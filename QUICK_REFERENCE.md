# 🚀 Quick Reference - Supabase Deployment

## ⚡ TL;DR - Deploy in 3 Steps

### 1️⃣ Add GitHub Secrets
```
Repository → Settings → Secrets and variables → Actions → New secret
```
- **Name**: `VITE_SUPABASE_URL`
  **Value**: `https://your-project.supabase.co`

- **Name**: `VITE_SUPABASE_ANON_KEY`
  **Value**: `eyJ...your-anon-key`

### 2️⃣ Push to GitHub
```bash
git add .
git commit -m "Deploy with Supabase"
git push origin main
```

### 3️⃣ Verify Deployment
Open your app → Press F12 → Check Console:
```
✅ Should see: "Is Configured: ✅ Yes"
❌ If not, secrets are missing
```

---

## 🔧 Where to Find Supabase Credentials

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon public** key → Use as `VITE_SUPABASE_ANON_KEY`

⚠️ **Use "anon public" NOT "service_role"**

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Failed to fetch" in production | Add GitHub Secrets (Step 1) |
| Console shows "Is Configured: ❌ No" | Check if secrets exist in repo settings |
| 404 errors on GitHub Pages | Enable Pages: Settings → Pages → gh-pages branch |
| Build succeeds but app doesn't work | Re-run workflow after adding secrets |

---

## 📝 What Changed

| File | Change |
|------|--------|
| `src/lib/supabase.ts` | ✅ Added runtime logging |
| `vite.config.ts` | ✅ Added GitHub Pages config |
| `.github/workflows/deploy.yml` | ✅ Added secret validation |

---

## 🎯 Success Checklist

- [ ] GitHub Secrets added (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Code pushed to `main` branch
- [ ] GitHub Actions workflow completed successfully
- [ ] GitHub Pages enabled (Settings → Pages)
- [ ] Production console shows "Is Configured: ✅ Yes"
- [ ] Login works in production

---

## 📚 Full Documentation

- **DEPLOYMENT_GUIDE.md** - Complete step-by-step deployment instructions
- **FIXES_SUMMARY.md** - Technical explanation of what was fixed and why
- **.env.example** - Environment variables reference

---

## 💡 Key Insight

**Vite embeds environment variables at BUILD time**, not runtime.

This means:
- ✅ Secrets must be set BEFORE building
- ✅ GitHub Actions reads secrets during build
- ✅ Console logging helps verify credentials were embedded
- ❌ Can't change credentials after build without rebuilding

---

Need help? Check the browser console - it now shows detailed configuration status!
