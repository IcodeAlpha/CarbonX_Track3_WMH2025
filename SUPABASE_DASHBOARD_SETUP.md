# Supabase Dashboard Setup Guide

This guide will help you set up a new Supabase project entirely through the dashboard (no CLI needed).

## Step 1: Create a New Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in the project details:
   - **Name**: `carbonx` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users (e.g., `West US` or `Europe West`)
   - **Pricing Plan**: Free tier is fine to start
5. Click **"Create new project"**
6. Wait 2-3 minutes for the project to be provisioned

## Step 2: Get Your Project Credentials

1. Once your project is ready, go to **Settings** → **API** (in the left sidebar)
2. You'll see two important values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** key: `eyJhbGc...` (long string)

3. **Copy these values** - you'll need them for your `.env` file

## Step 3: Run the Database Setup SQL

1. In your Supabase dashboard, go to **SQL Editor** (in the left sidebar)
2. Click **"New query"**
3. Open the file `supabase/DASHBOARD_SETUP.sql` from this project
4. **Copy the entire contents** of that file
5. **Paste it into the SQL Editor** in Supabase
6. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

The SQL will:
- Create all necessary tables (`profiles`, `individual_contributions`, `carbon_credits`, etc.)
- Set up Row Level Security (RLS) policies
- Create triggers for automatic profile creation
- Insert sample carbon credit projects
- Enable realtime subscriptions

**Note**: If you see any errors, they're likely because some objects already exist. The SQL uses `IF NOT EXISTS` and `DROP IF EXISTS` to handle this safely.

## Step 4: Verify the Setup

1. Go to **Table Editor** (in the left sidebar)
2. You should see these tables:
   - `profiles`
   - `individual_contributions`
   - `carbon_credits`
   - `contribution_likes`
   - `verification_projects`

3. Click on `carbon_credits` - you should see 6 sample projects already inserted

## Step 5: Update Your Environment Variables

1. In your project root (`carbonx` folder), create or update your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_public_key_here
```

Replace:
- `your-project-id` with your actual project ID from Step 2
- `your_anon_public_key_here` with your actual anon key from Step 2

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4MCwiZXhwIjoxOTU0NTQzMjgwfQ.example
```

## Step 6: Enable Storage (Optional - for image uploads)

If you want users to upload photos with their contributions:

1. Go to **Storage** (in the left sidebar)
2. Click **"Create a new bucket"**
3. Name it: `contributions`
4. Make it **Public**: Toggle ON (so images can be viewed)
5. Click **"Create bucket"**

## Step 7: Set Up Edge Functions (Optional - for auto-verification)

If you want the auto-verification function to work:

1. Go to **Edge Functions** (in the left sidebar)
2. Click **"Create a new function"**
3. Name it: `auto-verify-contribution`
4. Copy the code from `supabase/functions/auto-verify-contribution/index.ts`
5. Paste it into the function editor
6. Click **"Deploy"**

**Note**: You'll also need to set environment variables for the function:
- Go to **Edge Functions** → **Settings**
- Add:
  - `SUPABASE_URL`: Your project URL
  - `SUPABASE_SERVICE_ROLE_KEY`: Get this from **Settings** → **API** → **service_role** key (keep this secret!)

## Step 8: Test Your Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open your app in the browser
3. Try to sign up for a new account
4. If it works, you should see a new profile created automatically in the `profiles` table

## Troubleshooting

### Error: "Missing env.VITE_SUPABASE_URL"
- Make sure your `.env` file is in the `carbonx` folder (not the parent folder)
- Make sure the variable names start with `VITE_`
- Restart your dev server after creating/updating `.env`

### Error: "relation does not exist"
- Make sure you ran the entire `DASHBOARD_SETUP.sql` file
- Check the SQL Editor for any error messages
- Try running the SQL again (it's safe to run multiple times)

### Error: "permission denied"
- Check that RLS policies were created correctly
- Go to **Authentication** → **Policies** to verify

### Can't see tables in Table Editor
- Refresh the page
- Make sure you're in the correct project

## What's Next?

Once everything is set up:
1. ✅ Your database is ready
2. ✅ Your app should connect successfully
3. ✅ Users can sign up and create contributions
4. ✅ You can view data in the Supabase dashboard

## Recommended Next Steps

1. **Test the full flow**: Sign up → Create contribution → Verify it appears
2. **Set up storage buckets** for image uploads (if needed)
3. **Configure email templates** in **Authentication** → **Email Templates** (optional)
4. **Set up custom domains** (if deploying to production)

---

**Need Help?** Check the Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)

