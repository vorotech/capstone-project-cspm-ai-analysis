import os
import yaml
import subprocess
import shutil
from rich.console import Console

console = Console()

class CSPMRunner:
    """
    Executes CSPM tools (Prowler, Security Hub) against deployed infrastructure.
    It reads `scenarios.yaml` to determine what needs to be run.
    """
    def __init__(self, scenarios_file: str):
        self.scenarios_file = scenarios_file
        # Використовуємо абсолютний шлях для output директорії
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.output_dir = os.path.join(current_dir, "..", "output")

    def _get_scenario_config(self, scenario_name: str) -> dict:
        """Reads scenarios.yaml and returns the configuration dict for the scenario."""
        if not os.path.exists(self.scenarios_file):
            console.print(f"[red]Error: Scenarios file not found at {self.scenarios_file}[/red]")
            return {}

        with open(self.scenarios_file, 'r', encoding='utf-8') as f:
            try:
                data = yaml.safe_load(f)
            except yaml.YAMLError as e:
                console.print(f"[red]Error parsing {self.scenarios_file}: {e}[/red]")
                return {}
        
        scenarios = data.get("scenarios", [])
        
        for s in scenarios:
            if s.get("name") == scenario_name:
                return s
                
        console.print(f"[red]Error: Scenario '{scenario_name}' not found in {self.scenarios_file}[/red]")
        return {}

    def run_prowler(self, scenario_name: str, profile: str = "auditor", region: str = "us-east-1"):
        """Runs Prowler limited to the services defined in the scenario's service_scope and NIST compliance. If no scope is defined, runs all NIST checks."""
        config = self._get_scenario_config(scenario_name)
        scope = config.get("service_scope", [])
        
        scenario_output_dir = os.path.join(self.output_dir, "prowler", scenario_name)
        
        # Clean up previous Prowler runs to prevent file accumulation
        if os.path.exists(scenario_output_dir):
            shutil.rmtree(scenario_output_dir)
        os.makedirs(scenario_output_dir, exist_ok=True)

        if not scope:
            console.print(f"\n[bold magenta]--- Running Prowler for ALL services (NIST 800-53 Rev 5) ---[/bold magenta]")
        else:
            console.print(f"\n[bold magenta]--- Running Prowler for scope: {', '.join(scope)} (NIST 800-53 Rev 5) ---[/bold magenta]")
            
        # 2. Run Prowler with compliance framework (we will filter services later during parsing)
        cmd = [
            "prowler", "aws",
            "--compliance", "nist_800_53_revision_5_aws",
            "--output-directory", scenario_output_dir,
            "--profile", profile,
            "--region", region
        ]
        
            
        try:
            subprocess.run(cmd, check=False, capture_output=True, text=True)
            console.print(f"[green]Success: Prowler finished. Output in {scenario_output_dir}[/green]")
        except Exception as e:
            console.print(f"[red]Error executing Prowler:[/red] {e}")

    def run_securityhub(self, scenario_name: str, profile: str = "auditor", region: str = "us-east-1"):
        """Fetches Security Hub findings for the NIST 800-53 Rev 5 standard."""
        console.print(f"\n[bold magenta]--- Fetching AWS Security Hub Findings (NIST 800-53 Rev 5) ---[/bold magenta]")
        scenario_output_dir = os.path.join(self.output_dir, "securityhub", scenario_name)
        os.makedirs(scenario_output_dir, exist_ok=True)
        output_file = os.path.join(scenario_output_dir, "findings.json")

        config = self._get_scenario_config(scenario_name)
        scope = config.get("service_scope", [])
        
        try:
            import boto3
            import json
            session = boto3.Session(profile_name=profile, region_name=region)
            sh = session.client('securityhub')
            
            paginator = sh.get_paginator('get_findings')
            findings = []
            
            # Filter for ACTIVE records, PASSED or FAILED, and NIST standard
            page_iterator = paginator.paginate(
                Filters={
                    'RecordState': [{'Value': 'ACTIVE', 'Comparison': 'EQUALS'}],
                    'ComplianceStatus': [{'Value': 'PASSED', 'Comparison': 'EQUALS'}, {'Value': 'FAILED', 'Comparison': 'EQUALS'}],
                    'ComplianceAssociatedStandardsId': [{'Value': 'standards/nist-800-53/v/5.0.0', 'Comparison': 'EQUALS'}]
                }
            )
            
            for page in page_iterator:
                for finding in page.get('Findings', []):
                    if scope:
                        resource_types = [res.get('Type', '').lower() for res in finding.get('Resources', [])]
                        matched = False
                        for rtype in resource_types:
                            # rtype is e.g. "awss3bucket"
                            for svc in scope:
                                if f"aws{svc}" in rtype.replace("::", "") or svc in rtype:
                                    matched = True
                                    break
                            if matched: break
                        
                        if not matched:
                            continue
                            
                    findings.append(finding)
                
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(findings, f, indent=2, default=str)
                
            console.print(f"[green]Success: Saved {len(findings)} Security Hub findings to {output_file}[/green]")
            
        except Exception as e:
            console.print(f"[red]Error fetching Security Hub findings:[/red] {e}")

    def run_all(self, scenario_name: str):
        """Runs all configured CSPM tools."""
        self.run_prowler(scenario_name)
        self.run_securityhub(scenario_name)

if __name__ == "__main__":
    # Example usage for manual testing
    current_dir = os.path.dirname(os.path.abspath(__file__))
    scenario_filepath = os.path.join(current_dir, "scenarios.yaml")
    
    runner = CSPMRunner(scenarios_file=scenario_filepath)
    # runner.run_all("test_s3_red")
