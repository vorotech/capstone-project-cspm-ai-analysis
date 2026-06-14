import os
import json
import glob
from typing import List, Dict, Any

class CSPMParser:
    def __init__(self, output_base_dir: str = None):
        if output_base_dir is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            self.output_base_dir = os.path.join(current_dir, "..", "output")
        else:
            self.output_base_dir = output_base_dir

    def parse_all(self, scenario_name: str) -> List[Dict[str, Any]]:
        """Parses outputs from all CSPM tools for a given scenario and normalizes them."""
        findings = []
        findings.extend(self.parse_prowler(scenario_name))
        findings.extend(self.parse_securityhub(scenario_name))
        return findings

    def _normalize_prowler_control(self, control: str) -> str:
        """
        Converts prowler format (e.g., cp_9_a, pm_11_b, sc_16_1) 
        to standard NIST format (e.g., CP-9(a), PM-11(b), SC-16(1)).
        """
        if not control or "_" not in control:
            return control.upper()
            
        parts = control.split('_')
        family = parts[0].upper()
        number = parts[1]
        
        base = f"{family}-{number}"
        
        if len(parts) > 2:
            # handle sc_16_1 -> SC-16(1) and cp_9_a -> CP-9(a)
            enhancements = parts[2:]
            suffix = ""
            for e in enhancements:
                # Security Hub uses numbers for enhancements: SC-16(1)
                # For sub-parts like 'a', we use lowercase: CP-9(a)
                if e.isalpha():
                    suffix += f"({e.lower()})"
                else:
                    suffix += f"({e})"
            return f"{base}{suffix}"
            
        return base

    def parse_prowler(self, scenario_name: str) -> List[Dict[str, Any]]:
        findings = []
        prowler_dir = os.path.join(self.output_base_dir, "prowler", scenario_name)
        if not os.path.exists(prowler_dir):
            return findings

        # Prowler outputs multiple formats. We look for .ocsf.json
        ocsf_files = glob.glob(os.path.join(prowler_dir, "*.ocsf.json"))
        for file in ocsf_files:
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for item in data:
                        # Only consider failed checks
                        if item.get("status_code") != "FAIL":
                            continue
                            
                        # Extract NIST controls from unmapped -> compliance
                        nist_controls = []
                        compliance = item.get("unmapped", {}).get("compliance", {})
                        for fw, controls in compliance.items():
                            if "NIST" in fw.upper():
                                for c in controls:
                                    nist_controls.append(self._normalize_prowler_control(c))

                        res_id = "unknown"
                        if item.get("resources"):
                            res_id = item["resources"][0].get("uid", "unknown")
                        elif item.get("finding_info") and item["finding_info"].get("uid"):
                            res_id = item["finding_info"]["uid"]
                        
                        finding = {
                            "tool": "prowler",
                            "finding_id": item.get("metadata", {}).get("event_code", "unknown"),
                            "resource_id": res_id,
                            "original_severity": item.get("severity", "UNKNOWN").upper(),
                            "associated_nist_controls": list(set(nist_controls)),
                            "description": item.get("message", "")
                        }
                        findings.append(finding)
            except Exception as e:
                print(f"Error parsing {file}: {e}")
        return findings

    def parse_securityhub(self, scenario_name: str) -> List[Dict[str, Any]]:
        findings = []
        sh_dir = os.path.join(self.output_base_dir, "securityhub", scenario_name)
        if not os.path.exists(sh_dir):
            return findings

        findings_file = os.path.join(sh_dir, "findings.json")
        if not os.path.exists(findings_file):
            return findings
            
        try:
            with open(findings_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for item in data:
                    if item.get("Compliance", {}).get("Status") != "FAILED":
                        continue
                        
                    # Extract controls
                    related_reqs = item.get("Compliance", {}).get("RelatedRequirements", [])
                    # Usually like "NIST.800-53.r5 CA-7" -> extract just "CA-7"
                    nist_controls = [req.split()[-1] for req in related_reqs if "NIST" in req]
                    
                    res_id = "unknown"
                    if item.get("Resources"):
                        res_id = item["Resources"][0].get("Id", "unknown")
                        
                    finding = {
                        "tool": "securityhub",
                        "finding_id": item.get("GeneratorId", "unknown"),
                        "resource_id": res_id,
                        "original_severity": item.get("Severity", {}).get("Label", "UNKNOWN").upper(),
                        "associated_nist_controls": list(set(nist_controls)),
                        "description": item.get("Title", "") + " - " + item.get("Description", "")
                    }
                    findings.append(finding)
        except Exception as e:
            print(f"Error parsing {findings_file}: {e}")
            
        return findings

if __name__ == "__main__":
    import sys
    parser = CSPMParser()
    scenario = "test_s3_red" if len(sys.argv) < 2 else sys.argv[1]
    res = parser.parse_all(scenario)
    print(json.dumps(res, indent=2))
