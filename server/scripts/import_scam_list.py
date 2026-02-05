import json
import os
import re

# Paths
RAW_LIST_PATH = os.path.join(os.path.dirname(__file__), 'raw_list.txt')
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'entityTrustDatabase.json')

# Known Legitimate Companies (Safety Filter)
# These are companies that appear in the list but are likely major corporations 
# that we should NOT blindly block to avoid false positives on valid offers.
SAFETY_EXCLUDE = [
    "ZOHO", "VIRTUSA", "ANZ INFORMATION TECHNOLOGY", "ACCORD SOFTWARE", 
    "ADVANCED MICRONIC DEVICES", "24/7 CUSTOMER", "ALLIED DIGITAL", "BLUE APPLE"
]

def clean_name(line):
    # Remove common suffixes and extra info
    line = line.strip()
    if not line:
        return None
        
    # Remove "Pvt Ltd", "Limited", etc for cleaner matching, or keep them?
    # Better to keep them if they are part of the specific scam entity, but fuzzy matching handles it usually.
    # Let's clean up address artifacts like ", Bangalore", ", Hyderabad"
    line = re.sub(r',\s*(Bangalore|Hyderabad|Chennai|Pune|Mumbai|Noida|Jaipur|Cochin|Vizag|Kolkata).*$', '', line, flags=re.IGNORECASE)
    line = re.sub(r'\s-\s*\d+.*$', '', line) # Remove pin codes like "-560032"
    
    # Remove leading numbers (e.g. "1. Vedic Info Tech")
    line = re.sub(r'^\d+\.\s*', '', line)
    
    # Clean up "M/s."
    line = re.sub(r'^M/s\.?\s*', '', line)
    
    return line.strip()

def main():
    print("Reading raw list...")
    if not os.path.exists(RAW_LIST_PATH):
        print("Raw list not found!")
        return

    with open(RAW_LIST_PATH, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_entries = []
    seen_names = set()

    # Load existing DB
    if os.path.exists(DB_PATH):
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            current_blacklist = data.get('blacklist', [])
            for item in current_blacklist:
                seen_names.add(item['name'].lower())
    else:
        data = {"blacklist": [], "greylist": []}

    for line in lines:
        name = clean_name(line)
        if not name or len(name) < 3:
            continue
            
        lower_name = name.lower()
        
        # Check Safety Excludes
        is_safe = False
        for safe in SAFETY_EXCLUDE:
            if safe.lower() in lower_name:
                is_safe = True
                print(f"Skipping safety exclude: {name}")
                break
        if is_safe:
            continue

        if lower_name in seen_names:
            continue
            
        seen_names.add(lower_name)
        
        new_entries.append({
            "name": name,
            "type": "Reported Consultancy Scam",
            "addedAt": "2026-02-05", # Using current date from context
            "category": "red_flag"
        })

    print(f"Adding {len(new_entries)} new entries...")
    
    data['blacklist'].extend(new_entries)
    
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
        
    print("Database updated successfully.")

if __name__ == "__main__":
    main()
