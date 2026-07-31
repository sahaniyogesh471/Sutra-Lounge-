# Add GitHub Secrets Directly (Safest Way)

## Do NOT Share Keys With Anyone!

Never paste API keys in chat, emails, or anywhere. Add them directly to GitHub secrets instead.

---

## Your Supabase Info (Collected)

✓ **Project URL**: pqighanrupfsugcwsuob.supabase.co
✓ **Anon Key**: You have it (don't share it)

---

## Step 1: Add VITE_SUPABASE_URL

1. Go to: https://github.com/sahaniyogesh471/Sutra-Lounge-
2. Click: **Settings** (top menu)
3. Left sidebar: **Secrets and variables** → **Actions**
4. Click: **New repository secret**

**Add Secret:**
- Name: `VITE_SUPABASE_URL`
- Value: `pqighanrupfsugcwsuob.supabase.co`
- Click: **Add secret**

---

## Step 2: Add VITE_SUPABASE_ANON_KEY

Same process:

1. Click: **New repository secret**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: [Paste your anon key directly here - the one you have]
- Click: **Add secret**

---

## Step 3: Get Cloudflare Credentials

### Get CLOUDFLARE_API_TOKEN
1. Go to: https://dash.cloudflare.com/
2. Click your **Account** (bottom left)
3. **Settings** → **API Tokens**
4. Click: **Create Token**
5. Use template: **Edit Cloudflare Pages**
6. Configure:
   - Permissions: Edit Cloudflare Pages ✓
   - Account Resources: Select your account
7. **Create Token**
8. **Copy the token** immediately (shown only once)

### Get CLOUDFLARE_ACCOUNT_ID
1. Stay on Cloudflare dashboard
2. Your **Account ID** is visible in:
   - URL (after /accounts/)
   - Or overview section
   - 32-character alphanumeric string

---

## Step 4: Add Cloudflare Secrets to GitHub

Same process as Step 2:

**Secret 3:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: [Paste your token]
- Click: **Add secret**

**Secret 4:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: [Paste your account ID]
- Click: **Add secret**

---

## Step 5: Verify All 4 Secrets Added

Go to: GitHub Settings → Secrets and variables → Actions

You should see:
- ✓ VITE_SUPABASE_URL
- ✓ VITE_SUPABASE_ANON_KEY
- ✓ CLOUDFLARE_API_TOKEN
- ✓ CLOUDFLARE_ACCOUNT_ID

---

## Step 6: Trigger Deployment

1. Go to: GitHub repo → **Actions** tab
2. Click: **Deploy to Cloudflare Pages** (left sidebar)
3. Click: **Run workflow** button (top right)
4. Select branch: (should be pre-selected)
5. Click: **Run workflow**

Wait 3-5 minutes...

---

## Step 7: Check Deployment Status

1. **GitHub Actions**: Should show all green checkmarks ✓
2. **Cloudflare Pages**: https://pages.cloudflare.com should show your project
3. **Your Website**: Should be live at `https://sutra-loungehtd.pages.dev`

---

## Complete!

Your website is now:
- Live online
- Auto-updating when you push to GitHub
- Running your admin panel
- Ready to manage your restaurant!

---

**Never share API keys - always add them directly to GitHub secrets!**
