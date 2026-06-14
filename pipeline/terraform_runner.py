import os
import yaml
import subprocess
from rich.console import Console

console = Console()

class TerraformRunner:
    """
    Parses the scenarios configuration and executes Terraform commands (init, apply, destroy).
    """
    def __init__(self, scenarios_file: str, base_path: str = "../data/ecc-aws-rulepack"):
        self.scenarios_file = scenarios_file
        self.base_path = base_path

    def get_scenario_paths(self, scenario_name: str) -> list[str]:
        """Reads scenarios.yaml and returns the list of absolute paths for the specified scenario."""
        if not os.path.exists(self.scenarios_file):
            console.print(f"[red]Error: Scenarios file not found at {self.scenarios_file}[/red]")
            return []

        with open(self.scenarios_file, 'r', encoding='utf-8') as f:
            try:
                data = yaml.safe_load(f)
            except yaml.YAMLError as e:
                console.print(f"[red]Error parsing {self.scenarios_file}: {e}[/red]")
                return []
        
        scenarios = data.get("scenarios", [])
        
        target_scenario = None
        for s in scenarios:
            if s.get("name") == scenario_name:
                target_scenario = s
                break
                
        if not target_scenario:
            console.print(f"[red]Error: Scenario '{scenario_name}' not found in {self.scenarios_file}[/red]")
            return []

        test_type = target_scenario.get("type", "red")
        rules = target_scenario.get("rules", [])
        
        paths_to_run = []
        for rule in rules:
            # According to ecc-aws-rulepack structure: terraform/<rule_name>/<red_or_green>
            rel_path = os.path.join("terraform", rule, test_type)
            abs_path = os.path.join(self.base_path, rel_path)
            
            if os.path.exists(abs_path):
                paths_to_run.append(abs_path)
            else:
                console.print(f"[yellow]Warning: Terraform path does not exist: {abs_path}[/yellow]")
        
        return paths_to_run

    def run_command(self, cmd: list[str], cwd: str) -> bool:
        """Helper to run a shell command safely in a specific directory."""
        console.print(f"[cyan]Running: {' '.join(cmd)} in {cwd}[/cyan]")
        try:
            result = subprocess.run(cmd, cwd=cwd, check=True, capture_output=True, text=True)
            console.print(f"[green]Success: {' '.join(cmd)}[/green]")
            return True
        except subprocess.CalledProcessError as e:
            console.print(f"[red]Error executing {' '.join(cmd)}:[/red]")
            console.print(e.stderr)
            return False

    def apply(self, scenario_name: str):
        """Runs terraform init and apply for all rules in the specified scenario."""
        paths = self.get_scenario_paths(scenario_name)
        if not paths:
            console.print("[yellow]No paths to process.[/yellow]")
            return

        for path in paths:
            console.print(f"\n[bold magenta]--- Applying Terraform in {path} ---[/bold magenta]")
            # Initialize Terraform
            if self.run_command(["terraform", "init"], cwd=path):
                # Apply changes automatically
                self.run_command(["terraform", "apply", "-auto-approve"], cwd=path)

    def destroy(self, scenario_name: str):
        """Runs terraform destroy for all rules in the specified scenario to clean up resources."""
        paths = self.get_scenario_paths(scenario_name)
        if not paths:
            console.print("[yellow]No paths to process.[/yellow]")
            return

        for path in paths:
            console.print(f"\n[bold magenta]--- Destroying Terraform in {path} ---[/bold magenta]")
            # Destroy changes automatically
            self.run_command(["terraform", "destroy", "-auto-approve"], cwd=path)

if __name__ == "__main__":
    # Example usage for manual testing
    # Note: Using absolute path resolution for reliable execution when run directly
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_repo_path = os.path.join(current_dir, "..", "data", "ecc-aws-rulepack")
    scenario_filepath = os.path.join(current_dir, "scenarios.yaml")
    
    runner = TerraformRunner(scenarios_file=scenario_filepath, base_path=base_repo_path)
    # runner.apply("test_s3_red")
    # runner.destroy("test_s3_red")
