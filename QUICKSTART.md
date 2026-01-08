# Quick Start Guide

Get up and running in 15 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) and create a project
2. Run the SQL from `SUPABASE_SETUP.md` in the SQL Editor
3. Copy your Project URL and anon key from Settings → API

## Step 3: Configure Environment (2 minutes)

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

## Step 4: Run Locally (1 minute)

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) - you should see the to-do app!

## Step 5: Test Basic Features

- ✅ Create a task
- ✅ Mark it complete
- ✅ Edit the task
- ✅ Delete the task
- ✅ Refresh page - task should still be there

## Next Steps

### For Day 2 (n8n Integration):

1. Set up n8n workflows (see `N8N_SETUP.md`)
2. Add n8n webhook URLs to `.env.local`:
   ```env
   N8N_ENHANCE_WEBHOOK_URL=your_webhook_url
   N8N_CHAT_WEBHOOK_URL=your_webhook_url
   ```
3. Test AI enhancement (check "Enhance with AI" when creating task)
4. Test chatbot at `/chat` page

### For Deployment:

1. Push to GitHub (see `DEPLOYMENT.md`)
2. Deploy to Vercel
3. Add environment variables in Vercel dashboard
4. Test deployed app

## Troubleshooting

**Can't connect to Supabase?**
- Check `.env.local` has correct values
- Verify Supabase project is active
- Check RLS policies are set correctly

**Tasks not showing?**
- Check browser console for errors
- Verify Supabase table exists
- Check network tab for API calls

**Build errors?**
- Run `npm install` again
- Delete `node_modules` and `.next` folder, then reinstall
- Check Node.js version (18+ required)

## Need Help?

- See `README.md` for full documentation
- See `N8N_SETUP.md` for n8n configuration
- See `DEPLOYMENT.md` for deployment steps
- See `SUBMISSION_CHECKLIST.md` before submitting

Happy coding! 🚀
