import os
import argparse
import pandas as pd

def remove_model_history(model_name: str):
    """
    Removes all rows matching the specified model_name from
    metrics_history.csv and findings_history.csv.
    """
    analysis_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'output', 'analysis')
    metrics_path = os.path.join(analysis_dir, 'metrics_history.csv')
    findings_path = os.path.join(analysis_dir, 'findings_history.csv')
    
    removed_metrics = 0
    removed_findings = 0
    
    if os.path.exists(metrics_path):
        df_metrics = pd.read_csv(metrics_path)
        if 'model' in df_metrics.columns:
            initial_len = len(df_metrics)
            # Remove exact match or substring match depending on preference. 
            # We'll do exact match, or if it contains the model name.
            # Using exact match is safer.
            df_metrics = df_metrics[df_metrics['model'] != model_name]
            removed_metrics = initial_len - len(df_metrics)
            df_metrics.to_csv(metrics_path, index=False)
            print(f"Removed {removed_metrics} rows from metrics_history.csv for model '{model_name}'.")
        else:
            print("No 'model' column found in metrics_history.csv")
    else:
        print("metrics_history.csv not found.")
        
    if os.path.exists(findings_path):
        df_findings = pd.read_csv(findings_path)
        if 'model' in df_findings.columns:
            initial_len = len(df_findings)
            df_findings = df_findings[df_findings['model'] != model_name]
            removed_findings = initial_len - len(df_findings)
            df_findings.to_csv(findings_path, index=False)
            print(f"Removed {removed_findings} rows from findings_history.csv for model '{model_name}'.")
        else:
            print("No 'model' column found in findings_history.csv")
    else:
        print("findings_history.csv not found.")
        
    if removed_metrics == 0 and removed_findings == 0:
        print(f"No data found for model '{model_name}'. Please ensure the name exactly matches the CSV.")
    else:
        print(f"\n[Success] Purged all history for '{model_name}'.")
        print("Don't forget to run 'python pipeline/main.py report' to update your charts!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Remove a specific model's history from the analysis CSVs.")
    parser.add_argument("--model", required=True, help="Exact name of the model to remove (e.g. 'google/gemini-2.5-flash')")
    
    args = parser.parse_args()
    remove_model_history(args.model)
