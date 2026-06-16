import os
import json
import urllib.request

NIST_URL = "https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json"

def fetch_mapping():
    print("Downloading NIST 800-53 Rev 5 catalog from OSCAL repository...")
    try:
        with urllib.request.urlopen(NIST_URL) as response:
            data = json.loads(response.read().decode())
    except Exception as e:
        print(f"Failed to download or parse NIST catalog: {e}")
        return
        
    mapping = {}
    
    # OSCAL catalog structure is highly nested
    # catalog -> groups -> controls
    def extract_controls(items):
        for item in items:
            if 'id' in item and 'class' in item and item['class'] == 'SP800-53':
                title = item.get('title', '')
                control_id = item.get('id', '').upper()
                
                # Try to get the original control id label without zero-padding if available
                # In OSCAL, props are used for this
                actual_label = None
                for prop in item.get('props', []):
                    if prop.get('name') == 'label' and 'class' not in prop:
                        actual_label = prop.get('value')
                        break
                        
                # Use the actual label (e.g. AC-1) or fallback to upper case ID (e.g. AC-01)
                final_id = actual_label if actual_label else control_id
                # Removing spaces if any, e.g. "AC-1 "
                final_id = final_id.replace(" ", "")
                
                mapping[final_id] = title
            
            # Recursive check for nested controls/enhancements
            if 'controls' in item:
                extract_controls(item['controls'])
            
            # Check groups
            if 'groups' in item:
                extract_controls(item['groups'])

    catalog = data.get('catalog', {})
    
    # Process top-level controls if any
    if 'controls' in catalog:
        extract_controls(catalog['controls'])
        
    # Process top-level groups (families like Access Control)
    if 'groups' in catalog:
        extract_controls(catalog['groups'])
        
    print(f"Extracted {len(mapping)} NIST controls.")
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_path = os.path.join(base_dir, "presentation", "public", "nist_mapping.json")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2)
        
    print(f"Saved mapping to {output_path}")

if __name__ == "__main__":
    fetch_mapping()
