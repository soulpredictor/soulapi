import requests
import json
from datetime import datetime, timedelta

# Supabase API details
SUPABASE_URL = "https://zivchqddkiysjvjifrnv.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdmNocWRka2l5c2p2amlmcm52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDgwNjQyMywiZXhwIjoyMDYwMzgyNDIzfQ.wm2ffRacJsWcPJc2mDWKiziODWO6QWuor-LDizLIRoU"

# Headers for API requests
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def create_test_timed_key():
    # Current time and expiry time (1 day from now)
    now = datetime.now()
    expiry = now + timedelta(days=1)
    
    # Test data
    test_data = {
        "id": "X-TEST-KEY-123-X",
        "created_at": now.isoformat(),
        "expiry": expiry.isoformat(),
        "device_id": None
    }
    
    # URL for timedKeys table
    url = f"{SUPABASE_URL}/rest/v1/timedKeys"
    
    # Make POST request
    print(f"Sending request to {url}")
    print(f"With headers: {headers}")
    print(f"With data: {json.dumps(test_data)}")
    
    try:
        response = requests.post(url, headers=headers, json=test_data)
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code in (200, 201, 204):
            print("Successfully added test timed key!")
        else:
            print(f"Failed to add test timed key: {response.status_code}")
    except Exception as e:
        print(f"Exception: {str(e)}")

if __name__ == "__main__":
    create_test_timed_key() 