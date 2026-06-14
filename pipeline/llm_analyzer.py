import os
import json
import yaml
import csv
from datetime import datetime
from jinja2 import Template
from typing import List, Dict, Any
from rich.console import Console

from cspm_parser import CSPMParser
from llm_client import LLMClient

console = Console()

class LLMAnalyzer:
    def __init__(self, base_path: str = None):
        if base_path is None:
            self.base_path = os.path.dirname(os.path.abspath(__file__))
        else:
            self.base_path = base_path
            
        self.scenarios_file = os.path.join(self.base_path, "scenarios.yaml")
        self.prompts_dir = os.path.join(self.base_path, "prompts")
        self.output_dir = os.path.join(self.base_path, "..", "output", "analysis")
        
        # Ensure output directory exists for CSV files
        os.makedirs(self.output_dir, exist_ok=True)
        self.metrics_csv_path = os.path.join(self.output_dir, "metrics_history.csv")
        self.findings_csv_path = os.path.join(self.output_dir, "findings_history.csv")
        self._init_csv_files()

    def _init_csv_files(self):
        """Initializes the CSV files with headers if they don't exist."""
        metrics_headers = [
            "run_id", "timestamp", "scenario", "model", "cspm_tool", "parsing_success",
            "total_unique_nist_controls_failed", "nist_controls_adjusted",
            "adjustment_rate_percentage", "prompt_tokens", "completion_tokens", "latency_seconds"
        ]
        if not os.path.exists(self.metrics_csv_path):
            with open(self.metrics_csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(metrics_headers)
                
        findings_headers = [
            "run_id", "model", "cspm_tool", "finding_id", "resource_id", "resource_type",
            "associated_nist_controls", "original_severity", "adjusted_severity",
            "is_false_positive", "adjustment_reason", "justification"
        ]
        if not os.path.exists(self.findings_csv_path):
            with open(self.findings_csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(findings_headers)

    def _get_scenario_config(self, scenario_name: str) -> dict:
        if not os.path.exists(self.scenarios_file):
            console.print(f"[red]Error: Scenarios file not found at {self.scenarios_file}[/red]")
            return {}
        with open(self.scenarios_file, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        for s in data.get("scenarios", []):
            if s.get("name") == scenario_name:
                return s
        return {}

    def _read_drawio_xml(self, file_path: str) -> str:
        full_path = os.path.join(self.base_path, "..", file_path)
        if not os.path.exists(full_path):
            console.print(f"[yellow]Warning: Architecture drawio file not found at {full_path}[/yellow]")
            return "No architecture diagram provided."
        with open(full_path, 'r', encoding='utf-8') as f:
            return f.read()

    def _load_prompts(self) -> tuple[str, Template]:
        sys_path = os.path.join(self.prompts_dir, "system_prompt.txt")
        user_path = os.path.join(self.prompts_dir, "user_prompt_template.jinja2")
        
        with open(sys_path, 'r', encoding='utf-8') as f:
            system_prompt = f.read()
            
        with open(user_path, 'r', encoding='utf-8') as f:
            user_template = Template(f.read())
            
        return system_prompt, user_template

    def _calculate_nist_metrics(self, raw_findings: List[Dict[str, Any]], analyzed_findings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculates NIST control adjustment rates based on the LLM output."""
        failed_controls_before = set()
        for f in raw_findings:
            failed_controls_before.update(f.get("associated_nist_controls", []))

        # Build a map of finding_id/resource_id to controls from original data
        control_map = {}
        for f in raw_findings:
            key = f"{f['finding_id']}_{f['resource_id']}"
            control_map[key] = f.get("associated_nist_controls", [])

        adjusted_controls = set()
        # Assume an adjustment happens if the original severity is HIGH/CRITICAL 
        # and adjusted is LOW/INFO. Or simply if adjusted != original.
        for af in analyzed_findings:
            key = f"{af.get('finding_id')}_{af.get('resource_id')}"
            orig_sev = af.get("original_severity", "").upper()
            adj_sev = af.get("adjusted_severity", "").upper()
            
            # If the LLM downgraded severity or explicitly marked it as FP
            if af.get("is_false_positive") or (orig_sev in ["CRITICAL", "HIGH", "MEDIUM"] and adj_sev in ["LOW", "INFO"]):
                controls = control_map.get(key, [])
                adjusted_controls.update(controls)

        return {
            "total_unique_nist_controls_failed": len(failed_controls_before),
            "nist_controls_adjusted": len(adjusted_controls),
            "adjustment_rate_percentage": round((len(adjusted_controls) / len(failed_controls_before) * 100) if failed_controls_before else 0, 2)
        }

    def _extract_resource_type(self, resource_id: str, finding_id: str) -> str:
        """Heuristically extracts resource type for easier Jupyter analysis."""
        rid = resource_id.lower()
        if "arn:aws:s3" in rid or "s3" in finding_id.lower() or "bucket" in rid:
            return "s3"
        elif "arn:aws:ec2" in rid or "ec2" in finding_id.lower():
            return "ec2"
        elif "arn:aws:iam" in rid or "iam" in finding_id.lower():
            return "iam"
        elif "arn:aws:rds" in rid or "rds" in finding_id.lower():
            return "rds"
        elif "arn:aws:sns" in rid or "sns" in finding_id.lower():
            return "sns"
        return "other"

    def run_analysis(self, scenario_name: str, models: List[str]):
        config = self._get_scenario_config(scenario_name)
        if not config:
            return

        run_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        timestamp_iso = datetime.now().isoformat()

        arch_file = config.get("architecture_context_file")
        if not arch_file:
            console.print(f"[yellow]No architecture_context_file specified for scenario {scenario_name}.[/yellow]")
        arch_xml = self._read_drawio_xml(arch_file) if arch_file else "None"

        parser = CSPMParser()
        all_findings = parser.parse_all(scenario_name)
        
        # Group findings by tool
        tool_findings = {}
        for f in all_findings:
            tool = f["tool"]
            if tool not in tool_findings:
                tool_findings[tool] = []
            tool_findings[tool].append(f)

        system_prompt, user_template = self._load_prompts()

        for model in models:
            client = LLMClient(model_name=model)
            model_slug = model.replace("/", "_")
            
            for tool, findings in tool_findings.items():
                if not findings:
                    continue
                    
                console.print(f"\n[bold magenta]--- Analyzing {tool} findings for {scenario_name} using {model} ---[/bold magenta]")
                
                # Strip associated_nist_controls to save LLM tokens
                llm_input_findings = []
                for f in findings:
                    f_copy = f.copy()
                    f_copy.pop("associated_nist_controls", None)
                    llm_input_findings.append(f_copy)
                
                user_prompt = user_template.render(
                    architecture_xml=arch_xml,
                    cspm_findings_json=json.dumps(llm_input_findings, indent=2)
                )

                response_json, metrics = client.analyze(system_prompt, user_prompt)
                
                analyzed_findings = response_json.get("findings_analysis", [])
                nist_metrics = self._calculate_nist_metrics(findings, analyzed_findings)
                metrics.update(nist_metrics)
                
                # Save raw results
                out_dir = os.path.join(self.output_dir, scenario_name, model_slug, tool, run_id)
                os.makedirs(out_dir, exist_ok=True)
                
                with open(os.path.join(out_dir, "report.json"), "w", encoding="utf-8") as f:
                    json.dump(response_json, f, indent=2)
                    
                with open(os.path.join(out_dir, "metrics.json"), "w", encoding="utf-8") as f:
                    json.dump(metrics, f, indent=2)
                    
                # Append to Global CSVs
                with open(self.metrics_csv_path, 'a', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow([
                        run_id, timestamp_iso, scenario_name, model, tool, metrics.get("parsing_success"),
                        metrics.get("total_unique_nist_controls_failed"), metrics.get("nist_controls_adjusted"),
                        metrics.get("adjustment_rate_percentage"), metrics.get("prompt_tokens"),
                        metrics.get("completion_tokens"), metrics.get("latency_seconds")
                    ])
                
                with open(self.findings_csv_path, 'a', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    for af in analyzed_findings:
                        # Find original associated nist controls and description for this finding
                        orig_finding = next((f for f in findings if f["finding_id"] == af.get("finding_id") and f["resource_id"] == af.get("resource_id")), {})
                        
                        nist_controls = orig_finding.get("associated_nist_controls", [])
                        nist_controls_json = json.dumps(nist_controls)
                        original_justification = orig_finding.get("description", "")
                        
                        res_id = af.get("resource_id", "unknown")
                        fid = af.get("finding_id", "unknown")
                        res_type = self._extract_resource_type(res_id, fid)
                        
                        writer.writerow([
                            run_id, model, tool, fid, res_id, res_type,
                            nist_controls_json, af.get("original_severity", "UNKNOWN"),
                            af.get("adjusted_severity", "UNKNOWN"), af.get("is_false_positive", False),
                            af.get("adjustment_reason", ""), original_justification
                        ])
                    
                console.print(f"[green]Saved analysis and metrics to {out_dir}[/green]")
                console.print(f"[green]Appended data to global CSVs[/green]")
                console.print(f"Tokens: {metrics['prompt_tokens']} prompt, {metrics['completion_tokens']} completion")
                console.print(f"NIST Controls Adjusted: {metrics['nist_controls_adjusted']}/{metrics['total_unique_nist_controls_failed']}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--scenario", required=True)
    parser.add_argument("--models", required=True, help="Comma separated list of models, e.g. local/gemma-4-12b,anthropic/claude-3-haiku")
    args = parser.parse_args()
    
    analyzer = LLMAnalyzer()
    models_list = [m.strip() for m in args.models.split(",")]
    analyzer.run_analysis(args.scenario, models_list)
