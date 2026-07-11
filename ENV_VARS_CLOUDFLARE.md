# Environment Variables for Cloudflare Pages

## Overview

Sutra Lounge requires specific environment variables for Cloudflare Pages to function properly. These include Supabase credentials and app configuration.

## Required Environment Variables

### For Production Environment

Add these to Cloudflare Pages → Your Project → Settings → Environment Variables → Production

#### Supabase Configuration
```
Variable Name: VITE_SUPABASE_URL
Value: <Your Supabase Project URL>
Example: https://your-project.supabase.co

Variable Name: VITE_SUPABASE_ANON_KEY
Value: <Your Supabase Anonymous Key>
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### App Configuration
```
Variable Name: VITE_APP_URL
Value: https://sutra-loungehtd.pages.dev (during testing)
Value: https://sutra-loungehtd.com (after DNS migration)
```

### For Preview Environment (Optional)

Add same variables to Preview environment if you want previews to work independently.

## How to Find Your Credentials

### Step 1: Get Supabase URL
1. Go to https://app.supabase.com
2. Select your project (should be named "Sutra Lounge" or similar)
3. Click "Settings" in the left sidebar
4. Click "API"
5. Copy the "Project URL" value
6. Paste into `VITE_SUPABASE_URL`

### Step 2: Get Supabase Anon Key
1. In the same Settings → API page
2. Look for "Project API keys"
3. Find the row with "anon" label
4. Copy the key (starts with "eyJ...")
5. Paste into `VITE_SUPABASE_ANON_KEY`

### Step 3: Set App URL
1. During testing: Use `https://sutra-lounge.pages.dev`
2. After DNS: Use `https://sutra-loungehtd.com`

## How to Add Variables in Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Click "Pages" in the left sidebar
3. Click your project name ("sutra-lounge")
4. Click "Settings" tab
5. Click "Environment variables" in the left menu
6. Click "Add variables"
7. For each variable:
   - Select environment: "Production" or "Preview"
   - Enter Variable name (e.g., `VITE_SUPABASE_URL`)
   - Enter Value (your actual value)
   - Click "Add"
8. Click "Save and deploy"

## Important Notes

### Vite Prefix Requirement
All environment variables must start with `VITE_` to be accessible in Vite projects.

- ✓ Correct: `VITE_SUPABASE_URL`
- ✗ Wrong: `SUPABASE_URL`

### No .env Files
Cloudflare Pages does NOT use local .env files. All variables must be set in the dashboard.

- Environment variables are injected at build/runtime
- Local .env files are ignored in Cloudflare

### Secret vs. Public
- `VITE_SUPABASE_ANON_KEY`: Can be public (it's the anonymous key, not secret key)
- `VITE_APP_URL`: Can be public (just the app URL)

## Variables Already in Production (Vercel)

The following variables are currently set in Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`

You'll need to copy these same values to Cloudflare Pages.

## Verification

After setting variables:

1. Trigger a new deployment:
   - Go to Deployments tab
   - Make a small change to the code and push to GitHub
   - Or click "Retry deployment" on latest deployment

2. Check if variables are loaded:
   - Open your Cloudflare Pages URL in browser
   - Press F12 (DevTools)
   - Go to Console tab
   - Type: `console.log(import.meta.env.VITE_SUPABASE_URL)`
   - Should output your Supabase URL (not undefined)

3. Test functionality:
   - Go to admin login page
   - Try logging in (tests Supabase connection)
   - If login fails, variables might be missing

## Troubleshooting

### Issue: "Cannot find module" or "undefined"
**Cause**: Variables not prefixed with `VITE_`
**Solution**: Ensure all variables start with `VITE_`

### Issue: Supabase connection fails
**Cause**: Wrong URL or key
**Solution**:
- Verify credentials from https://app.supabase.com
- Check for extra spaces or quotes
- Make sure you copied the FULL key

### Issue: Environment variables not updated after deployment
**Cause**: Cache or build not triggered
**Solution**:
- Hard refresh browser (Ctrl+Shift+Delete then Ctrl+F5)
- Clear Cloudflare cache in dashboard
- Trigger new build by pushing to GitHub

### Issue: Works on staging but not production domain
**Cause**: Different environment variables
**Solution**:
- Make sure `VITE_APP_URL` matches your production domain
- Set same variables for Production environment
- Test on production domain after deployment

## Advanced Configuration

### Custom Domains with Different URLs
If using multiple domains, you can set different URLs:

```
Development: https://sutra-lounge.pages.dev
Production: https://sutra-loungehtd.com
Staging: https://staging.sutra-loungehtd.com
```

Each would have their own `VITE_APP_URL` value.

### Environment-Specific Configuration
You can use different variables for different builds:

**In code:**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const appUrl = import.meta.env.VITE_APP_URL;
```

**Build time:** Variables are injected during build
**Runtime:** Variables are available in browser (public ones only)

## Security Best Practices

### What You're Sharing
- `VITE_SUPABASE_URL`: Safe to share (project URL)
- `VITE_SUPABASE_ANON_KEY`: Safe to share (anonymous key, not secret)
- `VITE_APP_URL`: Safe to share (your app URL)

### What NOT to Share
- `SUPABASE_SERVICE_ROLE_KEY`: NEVER share this (it's secret)
- `SUPABASE_JWT_SECRET`: NEVER share this (it's secret)
- Private API keys

### If Compromised
If you accidentally expose your service role key:
1. Go to Supabase dashboard
2. Settings → API
3. Regenerate the key
4. Update your backend

## Complete Setup Checklist

- [ ] Supabase project created
- [ ] Supabase URL obtained
- [ ] Supabase anon key obtained
- [ ] Cloudflare Pages project created
- [ ] `VITE_SUPABASE_URL` set in Production environment
- [ ] `VITE_SUPABASE_ANON_KEY` set in Production environment
- [ ] `VITE_APP_URL` set to staging domain
- [ ] New deployment triggered
- [ ] Variables verified in console
- [ ] Supabase connection tested
- [ ] All features working

## Support

- Cloudflare Env Vars: https://developers.cloudflare.com/pages/functions/bindings/
- Vite Env Variables: https://vitejs.dev/guide/env-and-modes
- Supabase API Keys: https://supabase.com/docs/guides/api#api-keys

After setting these variables, proceed to testing the deployment.
