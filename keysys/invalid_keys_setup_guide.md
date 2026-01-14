# Setting Up invalid_keys Table in Supabase

To correctly set up the `invalid_keys` table in Supabase for your key management system, follow these steps:

## Step 1: Delete the Current Table (if it exists with the wrong structure)

1. Go to your Supabase dashboard
2. Navigate to Table Editor
3. Find the `invalid_keys` table
4. Click the three dots (⋮) next to the table name
5. Select "Delete table"
6. Confirm the deletion

## Step 2: Create a New invalid_keys Table

1. Click "New Table"
2. Enter table details:
   - Name: `invalid_keys`
   - Enable Row Level Security (RLS): Checked
   - **IMPORTANT**: For columns, set them up as follows:

## Step 3: Set Up Columns Correctly

Set up these columns:

1. **id** (Primary Column)
   - Type: **text** (NOT int8)
   - Default Value: None (leave empty)
   - Primary Key: Yes
   - Is Nullable: No

2. **invalidated_at**
   - Type: timestamp with time zone
   - Default Value: `now()`
   - Is Nullable: No

3. **previous_data** (Optional, for storing metadata)
   - Type: jsonb
   - Default Value: None (leave empty)
   - Is Nullable: Yes

## Step 4: Create the Table

Click "Save" to create the table with the correct structure.

## Step 5: Set Up RLS Policies

After creating the table:

1. Go to "Authentication" -> "Policies"
2. Find your `invalid_keys` table
3. Add a policy that allows public access:
   
   - Name: "Allow full access"
   - For operation: All operations
   - Policy definition: Using custom check: `true`

This will allow your API to access the table with the service role key.

## Step 6: Test with the API

After setting up the table, you can test it with your API endpoints:
- `/invalidate-key`
- `/check-key-status`
- `/get-analytics` 