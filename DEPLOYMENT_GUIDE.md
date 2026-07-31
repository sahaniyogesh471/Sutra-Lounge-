# Deployment Guide - Cloudflare Pages

## Status
- ✓ Build: Successful
- ✓ Code: All changes committed to GitHub
- ⏳ Deployment: Ready to deploy

## Prerequisites

1. **GitHub Account** - Already connected
2. **Cloudflare Account** - Free account is fine
3. **Repository Branch** - `v0/table-booking-with-whatsapp-6d7a8b4b`

## Step 1: Connect Cloudflare to GitHub

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click **"Create a project"**
3. Select **"Connect to Git"**
4. Authorize Cloudflare to access GitHub
5. Select repository: `sahaniyogesh471/Sutra-Lounge-`
6. Select branch: `v0/table-booking-with-whatsapp-6d7a8b4b`

## Step 2: Configure Build Settings

1. **Framework preset**: Select "Vite"
2. **Build command**: `npm run build`
3. **Build output directory**: `dist`
4. **Root directory**: `/` (leave default)

## Step 3: Add Environment Variables

Before deploying, add these environment variables in Cloudflare:

### Go to: Settings → Environment variables

**Production Environment:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GOOGLE_CLIENT_ID=your-google-client-id (optional)
VITE_ENCRYPTION_KEY=your-encryption-key
VITE_ENVIRONMENT=production
```

**Preview Environment (optional):**
```
Same as above, or use staging database
VITE_ENVIRONMENT=staging
```

### How to get these values:

**Supabase:**
1. Go to [Supabase](https://app.supabase.com)
2. Select your project
3. Settings → API
4. Copy "Project URL" and "anon public" key

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Create OAuth 2.0 Client ID
4. Copy Client ID

**Encryption Key:**
```bash
openssl rand -base64 32
```

## Step 4: Deploy

1. Click **"Save and Deploy"** button
2. Wait for build to complete (typically 2-3 minutes)
3. Deployment complete!

## Step 5: Verify Deployment

After deployment:

1. Click the **"Visit site"** button
2. You should see your website at:
   - `https://sutra-loungehtd.pages.dev` (default URL)
   - Or your custom domain if configured

## Step 6: Test Admin Panel

1. Click **"Admin"** button (top-right)
2. Enter credentials:
   - Email: `admin@sutralounge.com`
   - Password: [Your admin password]
3. Admin dashboard should open

## Database Setup

Before using admin panel, run the database migration:

1. Go to [Supabase](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Click **"New query"**
5. Copy and paste content from: `src/database/migrations/001_admin_auth_schema.sql`
6. Click **"Run"**

## Custom Domain (Optional)

To use your own domain (e.g., sutra-lounge.com):

1. In Cloudflare Pages project settings
2. Go to **"Custom domains"**
3. Click **"Add custom domain"**
4. Enter your domain name
5. Follow DNS configuration steps

## Troubleshooting

### Build Fails
```
Check:
- Node version (use 18+ or 20+)
- npm dependencies (`npm install`)
- Environment variables set
- GitHub branch is correct
```

### Images Not Loading
```
Check:
- Images in /public/images/ directory
- Build output includes dist/images/
- CORS headers configured (automatic)
```

### Admin Panel Not Accessible
```
Check:
- Environment variables set correctly
- Supabase project accessible
- Database migration ran
- Admin user exists in database
```

### Session Issues
```
Check:
- VITE_ENVIRONMENT set to "production"
- VITE_SUPABASE_URL correct
- VITE_SUPABASE_ANON_KEY correct
```

## Rollback

If deployment has issues:

1. In Cloudflare Pages
2. Go to **"Deployments"** tab
3. Find previous successful deployment
4. Click **"Rollback to this deployment"**

## Continuous Deployment

After initial setup:

1. Push changes to GitHub branch
2. Cloudflare automatically builds and deploys
3. Preview URL updates within 2-3 minutes
4. Production URL updates only when you manually promote

## Monitoring

In Cloudflare Pages dashboard:

- **Analytics**: Traffic, performance, errors
- **Build logs**: See deployment details
- **Performance**: Web Vitals metrics
- **Errors**: Failed requests and errors

## Environment Variables Summary

| Variable | Purpose | Required |
|----------|---------|----------|
| VITE_SUPABASE_URL | Supabase project URL | Yes |
| VITE_SUPABASE_ANON_KEY | Supabase auth key | Yes |
| VITE_GOOGLE_CLIENT_ID | Google OAuth (optional) | No |
| VITE_ENCRYPTION_KEY | Data encryption key | No |
| VITE_ENVIRONMENT | Environment type | Yes |

## Deployment Checklist

- [ ] GitHub account connected
- [ ] Cloudflare account created
- [ ] Repository selected
- [ ] Build command configured
- [ ] Environment variables added
- [ ] Database migration completed
- [ ] Admin user created
- [ ] Deployment initiated
- [ ] Site accessible
- [ ] Admin panel tested
- [ ] Images loading properly
- [ ] Custom domain configured (optional)

## Next Steps

1. **Deploy** - Follow steps above
2. **Test** - Verify all features work
3. **Monitor** - Check Cloudflare analytics
4. **Maintain** - Regular backups and updates

---

**Status**: Ready for deployment

Run `npm run build` locally to verify, then deploy to Cloudflare Pages!

