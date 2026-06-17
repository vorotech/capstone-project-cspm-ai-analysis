import pandas as pd
import json

metrics_df = pd.read_csv("output/analysis/metrics_history.csv")
findings_df = pd.read_csv("output/analysis/findings_history.csv")

def calculate_summary(m_df, f_df):
    summary = {}
    if m_df.empty or f_df.empty:
        return summary
        
    f_df = f_df.copy()
    f_df['decision_signature'] = f_df['adjusted_severity'].astype(str) + "_" + f_df['is_false_positive'].astype(str) + "_" + f_df['adjustment_category'].astype(str)
    
    m_df['is_ok'] = (m_df['error_type'] == 'NONE') & (m_df['parsing_success'] == True) & (m_df['adjustment_rate_percentage'] > 0) & (m_df['adjustment_rate_percentage'] < 100)
    
    # Calculate OK status per model per tool
    # Wait, the threshold usually applies to the model universally or per tool? Let's do per tool.
    
    tools = m_df['cspm_tool'].unique()
    for tool in tools:
        t_m = m_df[m_df['cspm_tool'] == tool]
        t_f = f_df[f_df['cspm_tool'] == tool]
        summary[tool] = {"models_summary": []}
        
        models = t_m['model'].unique()
        for model in models:
            mod_m = t_m[t_m['model'] == model]
            mod_f = t_f[t_f['model'] == model]
            
            # Check threshold (Stage 1)
            total_runs = len(mod_m)
            ok_runs = mod_m['is_ok'].sum()
            ok_status = ok_runs / total_runs if total_runs > 0 else 0
            
            if ok_status < 0.8:
                continue # Skip this model (fails threshold)
            
            # Use only OK runs for metrics? 
            # "Етап 2 - це всі підрахунки..."
            # Usually we use only valid runs for averages
            mod_m_valid = mod_m[mod_m['is_ok'] == True]
            if mod_m_valid.empty:
                continue
                
            adj_rate = mod_m_valid['adjustment_rate_percentage'].mean()
            latency = mod_m_valid['latency_seconds'].mean()
            total_tokens = mod_m_valid['prompt_tokens'].mean() + mod_m_valid['completion_tokens'].mean()
            
            if len(mod_m_valid) > 1:
                cons_df = mod_f.groupby(['finding_id', 'resource_id'])['decision_signature'].nunique()
                cons_rate = (cons_df == 1).mean() * 100
            else:
                cons_rate = None
                
            is_fp = mod_f["is_false_positive"].astype(str).str.lower() == "true"
            adjusted = mod_f[(mod_f["adjusted_severity"] != mod_f["original_severity"]) | is_fp]
            cat_counts = {}
            if not adjusted.empty:
                cats = adjusted["adjustment_category"].value_counts()
                for c_name, c_count in cats.items():
                    if c_name and c_name != "NONE":
                        cat_counts[c_name] = int(c_count)
                        
            summary[tool]["models_summary"].append({
                "model": model.replace("local/", "").split("/")[-1],
                "adjustment_rate": round(adj_rate, 2),
                "decision_consistency": round(cons_rate, 2) if cons_rate is not None else None,
                "latency": round(latency, 2),
                "total_tokens": int(total_tokens),
                "adjustment_categories": cat_counts
            })
    return summary

final_export = calculate_summary(metrics_df, findings_df)
out_path = "presentation/public/summary.json"
with open(out_path, "w") as f:
    json.dump(final_export, f, indent=2)
print("Data written to", out_path)
