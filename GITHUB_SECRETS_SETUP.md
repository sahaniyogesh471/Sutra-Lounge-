# Setup GitHub Secrets for Deployment

## Why Deployment is Failing

GitHub Actions workflow needs 4 secrets to deploy:
1. `VITE_SUPABASE_URL` - Supabase project URL
2. `VITE_SUPABASE_ANON_KEY` - Supabase authentication key
3. `CLOUDFLARE_API_TOKEN` - Cloudflare deployment token
4. `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID

These secrets are currently **NOT SET** in GitHub, so deployment fails.

---

## Step 1: Get Supabase Credentials

### Get VITE_SUPABASE_URL
1. Go to: https://app.supabase.com
2. Select your project
3. Click: Settings → API
4. Copy: **Project URL** (looks like `https://xxxxx.supabase.co`)
5. Save this value

### Get VITE_SUPABASE_ANON_KEY
1. Same location (Settings → API)
2. Copy: **anon public** key (starts with `eyJhbGc...`)
3. Save this value

---

## Step 2: Get Cloudflare Credentials

### Get CLOUDFLARE_API_TOKEN
1. Go to: https://dash.cloudflare.com/
2. Click your **Account** (bottom left)
3. Go to: **Settings** → **API Tokens**
4. Click: **Create Token**
5. Choose: **Edit Cloudflare Pages**
6. Click: **Use template**
7. Configure:
   - Permissions: Edit Cloudflare Pages ✓
   - Account Resources: Include specific account → Select your account
   - Zone Resources: Leave default
8. Click: **Continue to summary**
9. Click: **Create Token**
10. **Copy the token** (you only see it once!)
11. Save this value

### Get CLOUDFLARE_ACCOUNT_ID
1. Go to: https://dash.cloudflare.com/
2. Select your account
3. In the URL or Overview, find your **Account ID** (32-character alphanumeric)
4. Or go to: Right sidebar → Copy **Account ID**
5. Save this value

---

## Step 3: Add Secrets to GitHub

1. Go to: https://github.com/sahaniyogesh471/Sutra-Lounge-
2. Click: **Settings** (top navigation)
3. Left sidebar → Click: **Secrets and variables** → **Actions**
4. Click: **New repository secret**

### Add Secret 1: VITE_SUPABASE_URL
- **Name**: `VITE_SUPABASE_URL`
- **Value**: [Paste your Supabase URL]
- Click: **Add secret**

### Add Secret 2: VITE_SUPABASE_ANON_KEY
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: [Paste your Supabase anon key]
- Click: **Add secret**

### Add Secret 3: CLOUDFLARE_API_TOKEN
- **Name**: `CLOUDFLARE_API_TOKEN`
- **Value**: [Paste your Cloudflare API token]
- Click: **Add secret**

### Add Secret 4: CLOUDFLARE_ACCOUNT_ID
- **Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Value**: [Paste your Cloudflare Account ID]
- Click: **Add secret**

---

## Step 4: Trigger Deployment

After adding all 4 secrets:

1. Go to: GitHub repo → **Actions** tab
2. Click: **Deploy to Cloudflare Pages** workflow
3. Click: **Run workflow** → **Run workflow**

Or push new code to trigger automatically:

```bash
git commit --allow-empty -m "trigger deployment with secrets"
git push origin v0/table-booking-with-whatsapp-6d7a8b4b
```

---

## Verify Deployment

### Check GitHub Actions
1. GitHub repo → **Actions** tab
2. Find latest run for your branch
3. Should see all jobs passing ✓:
   - ✓ Build and Test
   - ✓ Performance Check
   - ✓ Security Check
   - ✓ Deploy to Cloudflare Pages

### Check Cloudflare Pages
1. Go to: https://pages.cloudflare.com
2. Your project should appear: **sutra-lounge**
3. Click project
4. Should show: **Deployment successful**

### Access Your Website
```
https://sutra-loungehtd.pages.dev
```

Should show your website live!

---

## Secret Values Reference

| Secret Name | Source | Example Value |
|------------|--------|---|
| VITE_SUPABASE_URL | Supabase Settings → API | `https://abc123.supabase.co` |
| VITE_SUPABASE_ANON_KEY | Supabase Settings → API | `eyJhbGciOi...` |
| CLOUDFLARE_API_TOKEN | Cloudflare → API Tokens | `v1.0a1b2c3...` |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare Account | `1a2b3c4d5e...` |

---

## Troubleshooting

### "Build failed" in GitHub Actions
- Check environment variables are set in secrets
- Run `npm run build` locally to debug

### "Deployment failed" in Cloudflare
- Check CLOUDFLARE_API_TOKEN is valid
- Check CLOUDFLARE_ACCOUNT_ID is correct
- Verify token has "Edit Cloudflare Pages" permission

### Can't find values
- Supabase: https://app.supabase.com → Settings → API
- Cloudflare: https://dash.cloudflare.com → Account → Settings → API Tokens

---

## After Setup

Once all secrets are added and deployment succeeds:

1. Website live at: `https://sutra-loungehtd.pages.dev`
2. Any push to GitHub auto-deploys
3. Admin panel accessible with credentials
4. Everything automated!

---

**Total time**: 10-15 minutes to add all secrets and deploy

