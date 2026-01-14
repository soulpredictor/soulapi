import random
import string
from datetime import datetime
import requests
import json
import time

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

def create_supabase_structure():
    """
    Instructions to manually create the right tables in Supabase
    """
    print("\n=== SUPABASE TABLE CREATION GUIDE ===")
    print("\nTo create tables in Supabase, follow these steps:")
    print("1. Go to your Supabase dashboard > Database > Tables")
    print("2. Click 'New Table'")
    print("3. For each table, set up the following structure:")
    
    print("\nTable 1: keys")
    print("  - Name: keys")
    print("  - Enable Row Level Security (RLS): Checked")
    print("  - Columns:")
    print("    * id (type: text, primary key)")
    print("    * created_at (type: timestamp with time zone, default: now())")
    print("    * device_id (type: text, nullable: true)")
    print("    * status (type: text, default: 'active')")
    print("    * activated_at (type: timestamp with time zone, nullable: true)")
    
    print("\nTable 2: invalid_keys")
    print("  - Name: invalid_keys")
    print("  - Enable Row Level Security (RLS): Checked")
    print("  - Columns:")
    print("    * id (type: text, primary key)")
    print("    * invalidated_at (type: timestamp with time zone, default: now())")
    print("    * previous_data (type: jsonb, nullable: true)")
    
    print("\nTable 3: timedKeys")
    print("  - Name: timedKeys")
    print("  - Enable Row Level Security (RLS): Checked")
    print("  - Columns:")
    print("    * id (type: text, primary key)")
    print("    * created_at (type: timestamp with time zone, default: now())")
    print("    * expiry (type: timestamp with time zone)")
    print("    * device_id (type: text, nullable: true)")
    
    print("\n=== IMPORTANT ===")
    print("* Make sure to change the id column type from int8 to text")
    print("* After creating tables, add RLS policies to allow access")
    
    print("\nDo you want to continue with key generation? (y/n): ", end="")
    choice = input().strip().lower()
    return choice == 'y'

def generate_random_string(length=5):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choices(chars, k=length))

def generate_keys(count=1000):
    keys = []
    for _ in range(count):
        prefix = random.choice(["s", "x"])
        rand_str = generate_random_string()
        key = f"{rand_str}-{rand_str}-{rand_str}"
        keys.append(key)
    return keys

def check_table_exists(table_name):
    """Check if a table exists in Supabase"""
    print(f"Checking if table '{table_name}' exists...")
    
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?limit=1"
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            print(f"Table '{table_name}' exists")
            return True
        else:
            print(f"Table '{table_name}' does not exist (status code: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"Error checking if table exists: {str(e)}")
        return False

def check_table_schema(table_name):
    """Try to determine the schema of the table to see what fields are available"""
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?limit=1"
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                print(f"Example record from '{table_name}':")
                print(json.dumps(data[0], indent=2))
                return data[0].keys()
            else:
                print(f"Table '{table_name}' exists but is empty")
                return None
        else:
            return None
            
    except Exception as e:
        print(f"Error checking table schema: {str(e)}")
        return None

def add_keys_to_table(keys, table_name):
    """Add keys to a Supabase table"""
    success_count = 0
    error_count = 0
    
    # Check if table exists
    if not check_table_exists(table_name):
        print(f"Table '{table_name}' does not exist. Please create it first.")
        return 0
    
    # Check table schema to determine format
    fields = check_table_schema(table_name)
    
    # Process keys in smaller batches
    batch_size = 10  # Use a smaller batch size for reliability
    for i in range(0, len(keys), batch_size):
        batch_keys = keys[i:i+batch_size]
        batch_data = []
        
        for key in batch_keys:
            # Create a record based on the table schema
            record = {
                'id': key,
                'created_at': datetime.now().isoformat(),
                'status': 'active'
            }
            
            # Remove any fields that don't exist in the schema
            if fields:
                record = {k: v for k, v in record.items() if k in fields}
                
            batch_data.append(record)
        
        try:
            # Use Supabase REST API directly
            url = f"{SUPABASE_URL}/rest/v1/{table_name}"
            
            response = requests.post(
                url,
                headers=headers,
                json=batch_data
            )
            
            if response.status_code in (200, 201, 204):
                success_count += len(batch_keys)
                print(f"Successfully added batch {i//batch_size + 1}")
            else:
                print(f"Error adding batch {i//batch_size + 1}: Status code {response.status_code}")
                print(f"Response: {response.text}")
                print(f"Request data: {json.dumps(batch_data)}")
                error_count += len(batch_keys)
            
            # Add a delay between batches
            time.sleep(1)
            
        except Exception as e:
            print(f"Exception when adding batch {i//batch_size + 1}: {str(e)}")
            error_count += len(batch_keys)
    
    print(f"Keys added to Supabase - Success: {success_count}, Failed: {error_count}")
    return success_count

if __name__ == "__main__":
    print("==== Supabase Key Generator ====")
    
    # Show guidance for creating tables
    if not create_supabase_structure():
        print("Exiting.")
        exit(0)
    
    # Let user select which table to add keys to
    print("\nWhich table do you want to add keys to?")
    print("1. keys (for permanent keys)")
    print("2. invalid_keys (for testing invalidated keys)")
    print("3. timedKeys (for keys with expiration)")
    
    table_choice = input("Enter choice (1-3) [default: 1]: ").strip() or "1"
    
    # Map numeric choice to table name
    table_map = {
        "1": "keys", 
        "2": "invalid_keys", 
        "3": "timedKeys"
    }
    
    table_name = table_map.get(table_choice, "keys")
    
    # Get number of keys to generate
    key_count = input("How many keys do you want to generate? (default: 30): ").strip()
    key_count = int(key_count) if key_count.isdigit() and int(key_count) > 0 else 30
    
    # Generate keys
    print(f"\nGenerating {key_count} keys...")
    keys = generate_keys(key_count)
    
    # Add to Supabase
    print(f"Adding {len(keys)} keys to Supabase table '{table_name}'...")
    add_keys_to_table(keys, table_name)
    
    # Print sample of keys
    print("\nSample of generated keys:")
    for key in keys[:5]:  # Print just the first 5 keys
        print(key)
    print(f"Total keys generated: {len(keys)}")
    print("\nDone!")

"""
REQUIRED TABLE STRUCTURES:

1. keys
   - id (TEXT, PRIMARY KEY) - The key string
   - created_at (TIMESTAMP WITH TIME ZONE) - When the key was created
   - device_id (TEXT, NULL) - The device ID the key is bound to (NULL if unused)
   - status (TEXT) - Status of the key (usually 'active')
   - activated_at (TIMESTAMP WITH TIME ZONE, NULL) - When the key was bound to a device

2. invalid_keys 
   - id (TEXT, PRIMARY KEY) - The key string
   - invalidated_at (TIMESTAMP WITH TIME ZONE) - When the key was invalidated
   - previous_data (JSONB) - Optional data about the key before invalidation

3. timedKeys
   - id (TEXT, PRIMARY KEY) - The key string
   - created_at (TIMESTAMP WITH TIME ZONE) - When the key was created
   - expiry (TIMESTAMP WITH TIME ZONE) - When the key expires
   - device_id (TEXT, NULL) - The device ID the key is bound to (NULL if unused)
"""
