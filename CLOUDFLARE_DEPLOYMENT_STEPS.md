# Cloudflare Pages Deployment - Detailed Steps

## Issue: Branch Not Showing in Dropdown

If you can't see the branch in Cloudflare, use **ANY** of these approaches:

---

## APPROACH 1: Use Default Branch (Easiest)

### Step 1: Merge to Main
```bash
# From your local machine or GitHub:
git checkout main
git merge v0/table-booking-with-whatsapp-6d7a8b4b
git push origin main
```

### Step 2: Deploy from Main
1. Go to https://pages.cloudflare.com
2. Click "Create a project"
3. Select "Connect to Git"
4. Select repo: `sahaniyogesh471/Sutra-Lounge-`
5. It will auto-select `main` branch
6. Configure build settings (see below)
7. Deploy!

---

## APPROACH 2: Create Pull Request (Recommended)

### Step 1: Create PR on GitHub
1. Go to https://github.com/sahaniyogesh471/Sutra-Lounge-
2. You should see "Compare & pull request" button
3. Create PR from `v0/table-booking-with-whatsapp-6d7a8b4b` → `main`
4. Add title: "Deploy: Admin Auth, Image Fixes, Performance Optimizations"
5. Click "Create pull request"

### Step 2: Let Cloudflare Deploy Preview
1. GitHub automatically shows deployment preview
2. Scroll down to see preview URL (from GitHub Actions)
3. Or go to Cloudflare Pages and connect

### Step 3: Merge PR
1. After testing, click "Merge pull request"
2. Confirm merge
3. Cloudflare auto-deploys to production

---

## APPROACH 3: Manual Branch Selection

If branch still not showing:

### Step 1: Go to Cloudflare Project
1. https://pages.cloudflare.com
2. Click "Create a project"
3. Click "Connect to Git"

### Step 2: Look for Branch Selector
After selecting repository:
- Scroll down to find "Production branch" or "Select branch"
- If dropdown is empty, try:
  - Refresh page
  - Clear browser cache
  - Use incognito window
  - Disconnect and reconnect GitHub

### Step 3: Manual Entry
- If dropdown doesn't work, look for text input
- Type: `v0/table-booking-with-whatsapp-6d7a8b4b`
- Proceed with deployment

---

## Build Configuration (All Approaches)

After connecting repo, you'll see build settings:

```
Framework preset:     Vite
Build command:        npm run build
Build output:         dist
Root directory:       /
Environment:          Set VITE_* variables (see below)
```

Click these to confirm they're set correctly.

---

## Environment Variables Setup

### In Cloudflare Pages Dashboard

1. Go to **Settings** (after creating project)
2. Go to **Environment variables**
3. Add variables (choose Production or Preview environment):

```
VITE_SUPABASE_URL
Value: https://your-project.supabase.co

VITE_SUPABASE_ANON_KEY
Value: ey... (your anon key)

VITE_ENVIRONMENT
Value: production

VITE_ENCRYPTION_KEY (optional)
Value: (32-char encryption key)

VITE_GOOGLE_CLIENT_ID (optional)
Value: (your Google OAuth client ID)
```

### Where to Get These Values

**Supabase:**
1. Go to https://app.supabase.com
2. Click your project
3. Settings → API
4. Copy:
   - "Project URL" → VITE_SUPABASE_URL
   - "anon public" → VITE_SUPABASE_ANON_KEY

**Google OAuth (optional):**
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 Client ID
3. Add redirect URIs:
   - https://sutra-loungehtd.pages.dev
   - https://yourdomain.com (if custom)
4. Copy Client ID → VITE_GOOGLE_CLIENT_ID

**Encryption Key (generate):**
```bash
openssl rand -base64 32
```

---

## Complete Deployment Checklist

- [ ] Branch pushed to GitHub
- [ ] Selected approach (1, 2, or 3)
- [ ] Repo selected in Cloudflare
- [ ] Build settings confirmed
- [ ] Environment variables added
- [ ] Deployment started
- [ ] Build completes (2-3 min)
- [ ] Site URL accessible
- [ ] Admin panel works

---

## After Deployment

### Verify Site Works
1. Click deployment URL
2. Should see homepage with:
   - Hero section
   - Gallery with 18 images
   - Menu, reservations, etc.
   - "Admin" button in top-right

### Setup Database (First Time)
1. Go to https://app.supabase.com
2. Select your project
3. SQL Editor → New query
4. Copy/paste from: `src/database/migrations/001_admin_auth_schema.sql`
5. Execute query
6. Database ready!

### Test Admin Access
1. Click "Admin" button on your deployed site
2. Enter:
   - Email: `admin@sutralounge.com`
   - Password: [Your admin password]
3. Admin dashboard should open
4. All features accessible

---

## Troubleshooting

### Branch Not Showing
- Refresh Cloudflare page
- Disconnect/reconnect GitHub
- Try APPROACH 1 or 2 instead
- Use manual text input if available

### Build Fails
```
Check in Cloudflare build logs:
- npm install errors → Fix package.json
- Build command errors → Check Vite config
- Missing files → Verify src/ files exist
```

### Environment Variables Not Working
```
Check:
- Variables have VITE_ prefix
- Values don't have quotes
- Redeploy after adding variables
- Check build logs for validation errors
```

### Admin Panel Won't Open
```
Check:
- Environment variables correct
- Supabase project accessible
- Database migration completed
- Admin user created in database
- Browser console for errors (F12)
```

### Images Not Loading
```
Check:
- dist/images/ folder exists
- CORS headers (auto-configured)
- Image paths correct in data.ts
- Check browser console for 404 errors
```

---

## Continuous Deployment

After first deployment:

1. **Make changes** in your code
2. **Commit** to GitHub branch
3. **Push** to GitHub
4. **Cloudflare auto-detects** changes
5. **Auto-builds** (2-3 min)
6. **Auto-deploys** to your site
7. **See changes live**

You don't need to touch Cloudflare again - it's automatic!

---

## Rollback

If something breaks:

1. Go to Cloudflare Pages project
2. Click **Deployments**
3. Find **last working deployment**
4. Click **three dots** → **Rollback**
5. Confirm
6. Site reverts to previous version

---

## Support

If you still have issues:

1. **Check browser console** (F12 → Console)
2. **Check Cloudflare build logs** (Deployments → Click deployment)
3. **Verify environment variables** (Settings → Environment variables)
4. **Re-read this guide** carefully

---

## Next Steps

1. Choose an approach (1, 2, or 3) above
2. Follow the steps
3. Deploy to Cloudflare Pages
4. Access your website!

**Site will be live at:** https://sutra-loungehtd.pages.dev

