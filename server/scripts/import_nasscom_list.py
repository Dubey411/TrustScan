import json
import os
import re

# Paths
RAW_LIST_PATH = os.path.join(os.path.dirname(__file__), 'raw_nasscom_list.txt')
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'entityTrustDatabase.json')

# Known Legitimate Companies (Safety Filter)
SAFETY_EXCLUDE = [
    "ZOHO", "VIRTUSA", "ANZ INFORMATION TECHNOLOGY", "ACCORD SOFTWARE", 
    "ADVANCED MICRONIC DEVICES", "24/7 CUSTOMER", "ALLIED DIGITAL", "BLUE APPLE"
]

def clean_name(line):
    line = line.strip()
    if not line:
        return None
        
    # Clean up address artifacts like ", Bangalore", ", Hyderabad"
    line = re.sub(r',\s*(Bangalore|Hyderabad|Chennai|Pune|Mumbai|Noida|Jaipur|Cochin|Vizag|Kolkata|Delhi|Gurugram).*$', '', line, flags=re.IGNORECASE)
    line = re.sub(r'\s-\s*\d+.*$', '', line) 
    line = re.sub(r'^\d+\.\s*', '', line)
    line = re.sub(r'^M/s\.?\s*', '', line)
    
    # Remove city names at the end if they are just loose words (e.g. "COMPANY NAME   PUNE")
    line = re.sub(r'\s+(PUNE|DELHI|MUMBAI|NOIDA|GURUGRAM|BANGALORE|CHENNAI|HYDERABAD)\s*$', '', line, flags=re.IGNORECASE)

    # Remove year patterns like "(2019)"
    line = re.sub(r'\(\d{4}\)', '', line)

    return line.strip()

def main():
    print("Reading Nasscom raw list...")
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
            "type": "NASSCOM Blacklisted / Fake Entity",
            "addedAt": "2026-02-05", # Using current date from context
            "category": "red_flag"
        })

    print(f"Adding {len(new_entries)} new entries from Nasscom list...")
    
    data['blacklist'].extend(new_entries)
    
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
        
    print("Database updated successfully.")

if __name__ == "__main__":
    main()
