import argparse
import sys
import subprocess
from rich.console import Console

# Adjust path to import local modules
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from terraform_runner import TerraformRunner

from cspm_runner import CSPMRunner

console = Console()

def run_apply(args):
    """Executes the Terraform apply phase."""
    runner = TerraformRunner(scenarios_file=args.scenarios_file)
    runner.apply(args.scenario)

def run_cspm(args):
    """Executes the CSPM scanning phase."""
    console.print(f"\n[bold yellow]--- Running CSPM Tools for Scenario: {args.scenario} ---[/bold yellow]")
    runner = CSPMRunner(scenarios_file=args.scenarios_file)
    runner.run_all(args.scenario)

from llm_analyzer import LLMAnalyzer

def run_report(args):
    """Generates the HTML report from the Jupyter Notebook and the summary JSON."""
    scenario = args.scenario
    console.print(f"\n[bold yellow]--- Generating Reports for Scenario: {scenario} ---[/bold yellow]")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    notebook_path = os.path.join(base_dir, "analysis", "results_analysis.ipynb")
    public_dir = os.path.join(base_dir, "presentation", "public")
    
    try:
        # Save current scenario to a file so notebook can read it without env vars
        scenario_file_path = os.path.join(base_dir, "output", "analysis", ".current_scenario")
        with open(scenario_file_path, "w") as f:
            f.write(scenario)
            
        # Run generate_summary.py
        console.print("[dim]Updating summary.json...[/dim]")
        subprocess.run([sys.executable, "analysis/generate_summary.py", "--scenario", scenario], check=True, cwd=base_dir)
        
        # Run Jupyter Notebook
        console.print("[dim]Executing Jupyter Notebook...[/dim]")
        subprocess.run([sys.executable, "-m", "jupyter", "nbconvert", "--to", "html", "--execute", notebook_path, "--output-dir", public_dir], check=True, cwd=base_dir)
        
        console.print("[bold green]Success: Reports generated successfully[/bold green]")
    except Exception as e:
        console.print(f"[bold red]Error generating report:[/bold red] {e}")

def run_analyze(args):
    """Executes the LLM analysis phase."""
    console.print(f"\n[bold yellow]--- Running LLM Analysis for Scenario: {args.scenario} (Iterations: {args.iterations}) ---[/bold yellow]")
    if not args.models:
        console.print("[red]Error: You must provide at least one model via --models (e.g. --models local/gemma-4-12b,anthropic/claude-haiku-4.5) for analyze command.[/red]")
        sys.exit(1)
        
    analyzer = LLMAnalyzer(scenarios_file=args.scenarios_file)
    models_list = [m.strip() for m in args.models.split(",")]
    
    for i in range(args.iterations):
        if args.iterations > 1:
            console.print(f"\n[bold blue]=== Iteration {i+1}/{args.iterations} ===[/bold blue]")
        analyzer.run_analysis(args.scenario, models_list)
    
    # Automatically generate report after analysis
    run_report()

def run_destroy(args):
    """Executes the Terraform destroy phase."""
    runner = TerraformRunner(scenarios_file=args.scenarios_file)
    runner.destroy(args.scenario)


def main():
    parser = argparse.ArgumentParser(description="AI CSPM Overwatch Pipeline Manager")
    
    # Global arguments
    parser.add_argument(
        "--scenarios-file", 
        default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scenarios.yaml"), 
        help="Path to scenarios.yaml configuration file"
    )
   
    # Create subcommands
    subparsers = parser.add_subparsers(dest="command", required=True, help="Pipeline stage to execute")
    
    # Common arguments for subcommands
    parent_parser = argparse.ArgumentParser(add_help=False)
    
    # Subcommands that require scenario
    scenario_parser = argparse.ArgumentParser(add_help=False)
    scenario_parser.add_argument("--scenario", required=True, help="Name of the scenario to run (e.g. test_s3_red)")
    
    # Subcommand: apply
    parser_apply = subparsers.add_parser("apply", parents=[parent_parser, scenario_parser], help="Deploy Terraform infrastructure")
    parser_apply.set_defaults(func=run_apply)
    
    # Subcommand: cspm
    parser_cspm = subparsers.add_parser("cspm", parents=[parent_parser, scenario_parser], help="Run CSPM tools (Prowler, Security Hub)")
    parser_cspm.set_defaults(func=run_cspm)
    
    # Subcommand: analyze
    parser_analyze = subparsers.add_parser("analyze", parents=[parent_parser, scenario_parser], help="Run LLM analysis on CSPM results")
    parser_analyze.add_argument("--models", help="Comma separated list of models, e.g. local/gemma-4-12b,anthropic/claude-haiku-4.5")
    parser_analyze.add_argument("--iterations", type=int, default=1, help="Number of times to run the analysis loop (default: 1)")
    parser_analyze.set_defaults(func=run_analyze)
    
    # Subcommand: destroy
    parser_destroy = subparsers.add_parser("destroy", parents=[parent_parser, scenario_parser], help="Destroy deployed Terraform infrastructure")
    parser_destroy.set_defaults(func=run_destroy)
    

    # Subcommand: report
    parser_report = subparsers.add_parser("report", parents=[parent_parser, scenario_parser], help="Generate HTML report from Jupyter Notebook")
    parser_report.set_defaults(func=run_report)
    
    args = parser.parse_args()
    
    # Execute the chosen subcommand function
    args.func(args)

if __name__ == "__main__":
    main()
