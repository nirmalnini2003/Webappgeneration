# BNRI Infrastructure System - Deployment Guide

## 🚀 Complete Deployment Guide

This guide will walk you through deploying the BNRI Infrastructure Request & Approval System to production using Supabase and GitHub Pages.

---

## Prerequisites

- A Supabase account (https://supabase.com)
- A GitHub account
- Node.js 18+ installed locally

---

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details:
   - Name: `bnri-infrastructure-system`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### 1.2 Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from the project root
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. You should see: "BNRI Infrastructure Request & Approval System database setup complete!"

### 1.3 Create Authentication Users

You need to create users in **Supabase Auth**, then link them to the database:

#### Create Auth Users:

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click "Add User" → "Create new user"
3. Create these 7 demo users:

| Email                          | Password   | Role              |
|--------------------------------|------------|-------------------|
| admin@bnriinfra.com           | demo123    | Admin             |
| bob.finance@bnriinfra.com     | demo123    | Finance Approver  |
| ravi.kumar@bnriinfra.com      | demo123    | IT Approver       |
| carol.legal@bnriinfra.com     | demo123    | Legal Approver    |
| priya.sharma@bnriinfra.com    | demo123    | HR Approver       |
| david.director@bnriinfra.com  | demo123    | Final Approver    |
| alice.requester@bnriinfra.com | demo123    | Requester         |

#### Link Auth Users to Database:

After creating all auth users, run this SQL to link them:

```sql
DO $$
DECLARE
    user_record RECORD;
    auth_id UUID;
BEGIN
    -- Link each user
    FOR user_record IN SELECT email FROM public.users
    LOOP
        SELECT id INTO auth_id FROM auth.users WHERE email = user_record.email;

        IF auth_id IS NOT NULL THEN
            UPDATE public.users
            SET auth_user_id = auth_id
            WHERE email = user_record.email;

            RAISE NOTICE 'Linked user: %', user_record.email;
        END IF;
    END LOOP;
END $$;
```

### 1.4 Get API Keys

1. Go to **Settings** → **API** in Supabase dashboard
2. Copy these values (you'll need them later):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbG...` (long string)

---

## Step 2: Configure Environment Variables

### 2.1 Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_WHATSAPP_OWNER_NUMBER=9150459992
   VITE_WHATSAPP_OWNER_LINK=https://wa.me/message/KDRAPEQYUHEBB1
   ```

3. Test locally:
   ```bash
   pnpm install
   pnpm dev
   ```

4. Open http://localhost:5173 and test login with:
   - Email: `admin@bnriinfra.com`
   - Password: `demo123`

---

## Step 3: Deploy to GitHub

### 3.1 Create GitHub Repository

Using GitHub MCP (if available):

```bash
# Create a new repository
gh repo create bnri-infrastructure-system --public --source=. --remote=origin
```

Or manually:
1. Go to https://github.com/new
2. Repository name: `bnri-infrastructure-system`
3. Make it Public or Private
4. Don't initialize with README (we already have files)
5. Click "Create repository"

### 3.2 Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: BNRI Infrastructure System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bnri-infrastructure-system.git
git push -u origin main
```

### 3.3 Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Add these secrets:

   - **Name**: `VITE_SUPABASE_URL`
     **Value**: Your Supabase Project URL

   - **Name**: `VITE_SUPABASE_ANON_KEY`
     **Value**: Your Supabase Anon Key

### 3.4 Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Save

---

## Step 4: Deploy

### 4.1 Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
1. Build the app when you push to `main`
2. Deploy to GitHub Pages

### 4.2 Manual Deployment

To deploy manually:

```bash
# Build the app
pnpm build

# The built files will be in ./dist
# You can deploy this folder to any static hosting service
```

---

## Step 5: Access Your Deployed App

### GitHub Pages URL

Your app will be available at:
```
https://YOUR_USERNAME.github.io/bnri-infrastructure-system/
```

### Custom Domain (Optional)

1. Purchase a domain (e.g., from Namecheap, GoDaddy)
2. Add a `CNAME` file to your project root:
   ```
   bnri-system.yourdomain.com
   ```
3. Update your domain's DNS settings:
   - Type: `CNAME`
   - Name: `bnri-system` (or `@` for root domain)
   - Value: `YOUR_USERNAME.github.io`
4. Update `.github/workflows/deploy.yml`:
   ```yaml
   cname: bnri-system.yourdomain.com
   ```

---

## Step 6: Verify Deployment

1. Open your deployed URL
2. Test login with demo credentials:
   - **Admin**: admin@bnriinfra.com / demo123
   - **Approver**: bob.finance@bnriinfra.com / demo123
   - **Requester**: alice.requester@bnriinfra.com / demo123

3. Test core features:
   - ✅ Create a new request
   - ✅ Approve/Reject a request
   - ✅ Add comments
   - ✅ Export to Excel
   - ✅ WhatsApp notifications
   - ✅ Admin panel

---

## Alternative Hosting Options

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add environment variables in Vercel dashboard.

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

Add environment variables in Netlify dashboard.

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Build command: `pnpm build`
3. Output directory: `dist`
4. Add environment variables in Cloudflare dashboard

---

## Troubleshooting

### Build Fails

**Problem**: Build fails with "Missing environment variables"

**Solution**: Make sure you added the GitHub Secrets correctly:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Can't Login

**Problem**: Login shows "Invalid credentials"

**Solution**:
1. Verify you created users in Supabase Auth
2. Run the SQL script to link auth users to database users
3. Check browser console for errors

### Database Queries Fail

**Problem**: Requests don't load, errors in console

**Solution**:
1. Verify Row Level Security policies are created
2. Check that auth_user_id is set correctly in users table
3. Test Supabase connection in browser console:
   ```js
   import { checkSupabaseConnection } from './lib/supabase'
   checkSupabaseConnection().then(console.log)
   ```

### Real-time Not Working

**Problem**: Changes don't appear in real-time

**Solution**:
1. Enable Realtime in Supabase dashboard:
   - Go to **Database** → **Replication**
   - Enable replication for `requests` and `request_comments` tables

---

## Production Checklist

Before going live:

- [ ] Change all demo passwords
- [ ] Set up proper email verification
- [ ] Enable Supabase Auth email templates
- [ ] Configure CORS in Supabase (if using custom domain)
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Test all user roles and permissions
- [ ] Configure WhatsApp Business API (optional)
- [ ] Add SSL certificate (automatic with GitHub Pages)
- [ ] Set up error tracking (Sentry, LogRocket)

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **GitHub Pages Docs**: https://docs.github.com/pages
- **WhatsApp**: 9150459992

---

## Next Steps

1. ✅ Customize branding and colors
2. ✅ Add more approval stages if needed
3. ✅ Integrate with email service (SendGrid, Resend)
4. ✅ Set up automated backups
5. ✅ Add analytics (Plausible, Google Analytics)

**Your BNRI Infrastructure System is now live!** 🎉
