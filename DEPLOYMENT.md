# Deployment Guide

This guide walks you through deploying the AI Automation Challenge app to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- All environment variables ready (Supabase + n8n)

## Step 1: Push to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Automation Challenge"
   ```

2. Create a new repository on GitHub
   - Go to [github.com/new](https://github.com/new)
   - Name it (e.g., `ai-automation-challenge`)
   - **Make it public** (required for submission)
   - Don't initialize with README (we already have one)

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Click "Import"

2. **Configure Project**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add each variable:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
     - `N8N_ENHANCE_WEBHOOK_URL` = your n8n enhancement webhook URL
     - `N8N_CHAT_WEBHOOK_URL` = your n8n chat webhook URL
   - Select "Production", "Preview", and "Development" for each
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 1-2 minutes)
   - Your app will be live at `https://your-project.vercel.app`

## Step 3: Verify Deployment

1. **Test the App**
   - Visit your Vercel deployment URL
   - Try creating a task
   - Verify it persists after refresh
   - Test the chatbot at `/chat`

2. **Check Logs**
   - Go to Vercel dashboard → Your project → "Deployments"
   - Click on the latest deployment
   - Check "Functions" tab for any errors

3. **Test n8n Integration**
   - Create a task with "Enhance with AI" checked
   - Verify enhancement works
   - Test chatbot with `#to-do` message

## Step 4: Update Environment Variables (if needed)

If you need to update environment variables later:

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Edit or add variables
3. Redeploy (Vercel will auto-redeploy on next push, or manually trigger)

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Common issues:
  - Missing environment variables
  - TypeScript errors (run `npm run build` locally first)
  - Missing dependencies

### App Works Locally but Not on Vercel

- Verify all environment variables are set
- Check that Supabase RLS policies allow public access
- Verify n8n webhook URLs are accessible from internet
- Check browser console for errors

### n8n Webhooks Not Working

- Ensure n8n workflows are activated
- Verify webhook URLs are correct (should be `https://your-instance.n8n.cloud/webhook/...`)
- Check n8n execution logs for errors
- Verify Supabase credentials in n8n are correct

## Custom Domain (Optional)

1. Go to Vercel dashboard → Your project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

## Continuous Deployment

Vercel automatically deploys on every push to your main branch:
- Push to `main` → Production deployment
- Push to other branches → Preview deployment

## Performance Optimization

- Vercel automatically optimizes Next.js apps
- Images are optimized via Next.js Image component
- Static assets are CDN-cached
- API routes run as serverless functions

## Monitoring

- Check Vercel Analytics (if enabled)
- Monitor function execution times
- Check error rates in Vercel dashboard
