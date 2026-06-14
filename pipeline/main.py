import argparse
import sys
from rich.console import Console

# Adjust path to import local modules
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from terraform_runner import TerraformRunner

from cspm_runner import CSPMRunner

console = Console()

def run_apply(args):
    """Executes the Terraform apply phase."""
    runner = TerraformRunner(scenarios_file=args.scenarios_file, base_path=args.base_path)
    runner.apply(args.scenario)

def run_cspm(args):
    """Executes the CSPM scanning phase."""
    console.print(f"\n[bold yellow]--- Running CSPM Tools for Scenario: {args.scenario} ---[/bold yellow]")
    runner = CSPMRunner(scenarios_file=args.scenarios_file, base_path=args.base_path)
    runner.run_all(args.scenario)

from llm_analyzer import LLMAnalyzer

def run_analyze(args):
    """Executes the LLM analysis phase."""
    console.print(f"\n[bold yellow]--- Running LLM Analysis for Scenario: {args.scenario} ---[/bold yellow]")
    if not args.models:
        console.print("[red]Error: You must provide at least one model via --models (e.g. --models local/gemma-4-12b,anthropic/claude-3-haiku) for analyze command.[/red]")
        sys.exit(1)
        
    analyzer = LLMAnalyzer()
    models_list = [m.strip() for m in args.models.split(",")]
    analyzer.run_analysis(args.scenario, models_list)

def run_destroy(args):
    """Executes the Terraform destroy phase."""
    runner = TerraformRunner(scenarios_file=args.scenarios_file, base_path=args.base_path)
    runner.destroy(args.scenario)

def run_all(args):
    """Executes the full pipeline from start to finish."""
    console.print(f"\n[bold green]=== Starting Full Pipeline for Scenario: {args.scenario} ===[/bold green]")
    try:
        run_apply(args)
        run_cspm(args)
        run_analyze(args)
    except Exception as e:
        console.print(f"[bold red]Error during pipeline execution: {e}[/bold red]")
    finally:
        console.print("\n[bold yellow]=== Ensuring Cleanup (Destroy) ===[/bold yellow]")
        run_destroy(args)

def main():
    parser = argparse.ArgumentParser(description="CSPM AI Analysis Pipeline Manager")
    
    # Global arguments
    parser.add_argument(
        "--scenarios-file", 
        default="scenarios.yaml", 
        help="Path to scenarios.yaml configuration file"
    )
    parser.add_argument(
        "--base-path", 
        default="../data/ecc-aws-rulepack", 
        help="Path to cloned ecc-aws-rulepack directory"
    )
    
    # Create subcommands
    subparsers = parser.add_subparsers(dest="command", required=True, help="Pipeline stage to execute")
    
    # Common arguments for subcommands
    parent_parser = argparse.ArgumentParser(add_help=False)
    parent_parser.add_argument("--scenario", required=True, help="Name of the scenario to run (e.g. test_s3_red)")
    
    # Subcommand: apply
    parser_apply = subparsers.add_parser("apply", parents=[parent_parser], help="Deploy Terraform infrastructure")
    parser_apply.set_defaults(func=run_apply)
    
    # Subcommand: cspm
    parser_cspm = subparsers.add_parser("cspm", parents=[parent_parser], help="Run CSPM tools (Prowler, Security Hub)")
    parser_cspm.set_defaults(func=run_cspm)
    
    # Subcommand: analyze
    parser_analyze = subparsers.add_parser("analyze", parents=[parent_parser], help="Run LLM analysis on CSPM results")
    parser_analyze.add_argument("--models", help="Comma separated list of models, e.g. local/gemma-4-12b,anthropic/claude-3-haiku")
    parser_analyze.set_defaults(func=run_analyze)
    
    # Subcommand: destroy
    parser_destroy = subparsers.add_parser("destroy", parents=[parent_parser], help="Destroy deployed Terraform infrastructure")
    parser_destroy.set_defaults(func=run_destroy)
    
    # Subcommand: run-all
    parser_run_all = subparsers.add_parser("run-all", parents=[parent_parser], help="Run full pipeline: apply -> cspm -> analyze -> destroy")
    parser_run_all.set_defaults(func=run_all)
    
    args = parser.parse_args()
    
    # Execute the chosen subcommand function
    args.func(args)

if __name__ == "__main__":
    main()
