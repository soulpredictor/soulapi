# TimedKeys Table Setup Guide

1. Go to your Supabase dashboard and select the SQL editor.

2. Run the following SQL to update the timedKeys table schema:

```sql
-- First, drop the existing table if it exists
DROP TABLE IF EXISTS "timedKeys";

-- Create the table with the correct schema
CREATE TABLE "timedKeys" (
    "id" text PRIMARY KEY,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "expiry" timestamp with time zone NOT NULL,
    "device_id" text,
    "activated_at" timestamp with time zone,
    "bound_at" timestamp with time zone
);

-- Enable Row Level Security
ALTER TABLE "timedKeys" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access
CREATE POLICY "Allow public access"
ON "timedKeys"
FOR ALL
TO public
USING (true);
```

3. Verify the table structure:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'timedKeys';
```

4. The table should have these columns:
- id (text, primary key)
- created_at (timestamp with time zone, not null)
- expiry (timestamp with time zone, not null)
- device_id (text, nullable)
- activated_at (timestamp with time zone, nullable)
- bound_at (timestamp with time zone, nullable)

5. Test the table by inserting a sample record:
```sql
INSERT INTO "timedKeys" (id, expiry)
VALUES ('test-key', timezone('utc'::text, now()) + interval '1 day');
```

6. Verify the record:
```sql
SELECT * FROM "timedKeys" WHERE id = 'test-key';
```

7. Clean up the test:
```sql
DELETE FROM "timedKeys" WHERE id = 'test-key';
``` 