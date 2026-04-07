# 🚀 Deployment Guide - BNRI Infrastructure System

## 📋 Overview

This guide explains how to properly configure and deploy your BNRI Infrastructure System to GitHub Pages with Supabase backend integration.

---

## ✅ What Was Fixed

### 1. **Runtime Environment Variable Validation**
- ✅ Added comprehensive logging to debug missing environment variables
- ✅ Logs show exactly which variables are configured in production
- ✅ Never logs sensitive keys in production (only in development)

### 2. **GitHub Pages Deployment Configuration**
- ✅ Added proper `base` URL configuration in `vite.config.ts`
- ✅ Handles both custom domains and GitHub Pages URLs (`/repository-name/`)
- ✅ Optimized build with vendor chunk splitting for better caching

### 3. **GitHub Actions Workflow Enhancement**
- ✅ Added validation step to check if secrets are configured
- ✅ Provides clear error messages if secrets are missing
- ✅ Properly passes environment variables during build process

### 4. **Supabase Client Improvements**
- ✅ Graceful degradation when credentials not configured
- ✅ Prevents unnecessary network calls in unconfigured state
- ✅ Clear console logging for debugging production issues

---

## 🔧 Setup Instructions

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be provisioned
4. Go to **Project Settings** → **API**
5. Copy these values:
   - **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 2: Configure GitHub Repository Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:

   **Secret 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: Your Supabase Project URL (e.g., `https://abcdefghijk.supabase.co`)

   **Secret 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon/public key

⚠️ **IMPORTANT**: Use only the **anon/public key**, NEVER the service_role key in frontend apps.

### Step 3: Set Up Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Your database schema SQL here
-- (Copy from your existing schema file)
```

### Step 4: Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Select branch: **gh-pages**
4. Click **Save**

### Step 5: Deploy

1. Push your code to the `main` branch:
   ```bash
   git add .
   git commit -m "Configure Supabase integration"
   git push origin main
   ```

2. GitHub Actions will automatically:
   - Build your app with environment variables embedded
   - Deploy to the `gh-pages` branch
   - Make it available at your GitHub Pages URL

---

## 🔍 Verifying the Deployment

### Check Build Logs

1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. Look for the "Validate Environment Variables" step
4. You should see:
   ```
   ✅ VITE_SUPABASE_URL is configured
   ✅ VITE_SUPABASE_ANON_KEY is configured
   ```

### Check Production Console

1. Open your deployed app in a browser
2. Open Developer Tools (F12)
3. Look at the Console tab
4. You should see:
   ```
   🔧 Supabase Configuration
   Environment: production
   URL provided: ✅ Yes
   Anon Key provided: ✅ Yes
   Is Configured: ✅ Yes
   ```

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" errors in production

**Cause**: Supabase environment variables are not embedded in the build

**Solution**:
1. Verify GitHub Secrets are set correctly
2. Check the workflow run logs for validation messages
3. Redeploy by pushing a new commit or manually triggering the workflow

### Issue: 404 errors or blank page on GitHub Pages

**Cause**: Incorrect base URL configuration

**Solution**:
- If using `username.github.io/repository-name/` URL:
  - The `vite.config.ts` is already configured correctly
  - Make sure `GITHUB_PAGES=true` is set during build (already in workflow)

- If using a custom domain:
  - Update `vite.config.ts`:
    ```ts
    base: '/',
    ```

### Issue: Console shows "Supabase is NOT configured"

**Cause**: Environment variables not passed during build

**Solution**:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Verify both secrets exist:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Re-run the workflow or push a new commit

---

## 📱 Local Development

For local development, create a `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Then run:
```bash
pnpm install
pnpm dev
```

---

## 🔒 Security Best Practices

✅ **DO:**
- Use the Supabase **anon/public key** for frontend apps
- Store credentials in GitHub Secrets for deployment
- Use Row Level Security (RLS) policies in Supabase
- Keep sensitive keys in `.env.local` (gitignored)

❌ **DON'T:**
- Never commit `.env.local` to git
- Never use `service_role` key in frontend code
- Never hardcode credentials in source code
- Never disable RLS without proper security review

---

## 📚 Additional Resources

- [Vite Environment Variables](https://vite.dev/guide/env-and-mode.html)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## 💡 Key Takeaways

1. **Environment variables are embedded at BUILD time**, not runtime
2. **Secrets must be configured in GitHub repository settings** for deployment
3. **The workflow validates secrets** before building to catch configuration issues early
4. **Console logging helps debug** production deployment issues
5. **Use only the anon/public key** in frontend applications for security

---

Need help? Check the console logs in your deployed app for detailed configuration information.
