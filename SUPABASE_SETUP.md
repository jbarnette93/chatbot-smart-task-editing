# Supabase Setup Instructions

## Manual Steps Required

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Wait for the project to be fully provisioned

2. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy your Project URL
   - Copy your `anon` public key

3. **Run SQL Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Run the following SQL:

```sql
-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  user_email TEXT,
  enhanced_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (basic)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (for challenge simplicity)
CREATE POLICY "Allow all operations" ON tasks
  FOR ALL USING (true) WITH CHECK (true);
```

4. **Set Environment Variables**
   - Create a `.env.local` file in the project root
   - Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

5. **Verify Setup**
   - The app will automatically use these credentials when you run `npm run dev`
