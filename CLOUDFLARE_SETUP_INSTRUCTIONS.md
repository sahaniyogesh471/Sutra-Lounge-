# Cloudflare Pages Migration - Setup Instructions

## Step 1: Create Cloudflare Account (if you don't have one)
1. Go to https://dash.cloudflare.com/sign-up
2. Sign up with your email or GitHub account
3. Complete email verification

## Step 2: Set Up Cloudflare Pages Project

### Method A: Via Cloudflare Dashboard (Recommended)
1. Log in to https://dash.cloudflare.com
2. Click "Pages" in the left sidebar
3. Click "Create a project"
4. Select "Connect to Git"
5. Authorize Cloudflare to access your GitHub account
6. Select repository: `sahaniyogesh471/Sutra-Lounge-`
7. Select branch: `v0/table-booking-with-whatsapp-6d7a8b4b` (or main)

### Build Configuration
When asked for build settings:
- **Project Name:** `sutra-lounge`
- **Production Branch:** `main` (or your deployment branch)
- **Framework Preset:** None (we have custom build config)
- **Build Command:** `npm run build`
- **Build Output Directory:** `dist`
- **Root Directory (advanced):** `/`

## Step 3: Configure Build Settings in Dashboard

In the Pages project settings:
1. Go to "Settings" tab
2. Click "Build & Deployments"
3. **Build Command:** `npm run build`
4. **Build Output Directory:** `dist`
5. **Node.js Version:** 18.x or higher

### Environment Variables
Before deployment, add these environment variables:

1. Go to "Settings" → "Environment Variables"
2. Add for Production environment:
   - `VITE_SUPABASE_URL`: Your Supabase project URL (from supabase.com dashboard)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_APP_URL`: `https://sutra-loungehtd.pages.dev` (temporary during testing)

3. Add same variables for Preview environment (optional)

### How to get Supabase credentials:
1. Go to https://app.supabase.com
2. Select your project (Sutra Lounge)
3. Go to "Settings" → "API"
4. Copy URL and Anon Key

## Step 4: Initial Deployment

1. The Pages project will automatically trigger a build when you push to GitHub
2. First deployment may take 2-3 minutes
3. You'll get a temporary URL like `sutra-lounge.pages.dev`
4. Test the site on this temporary URL

## Step 5: Test on Staging Domain

1. Visit your staging URL: `https://sutra-lounge.pages.dev`
2. Verify:
   - Homepage loads correctly
   - Gallery images display with LQIP blur placeholders
   - Admin login page works (at `/admin`)
   - Booking form is functional
   - Images load from `/images/` paths
   - All styling renders correctly

### Manual Testing Checklist
- [ ] Homepage hero image loads
- [ ] Gallery section shows with LQIP blur effect
- [ ] Navigation works on mobile
- [ ] Admin login page accessible
- [ ] Booking form submits
- [ ] Images load with correct WebP format
- [ ] LQIP blur placeholders fade to full images
- [ ] No console errors (F12 → Console tab)
- [ ] Page responsive on mobile (360px viewport)
- [ ] All Supabase connections work (if any form saves)

## Step 6: Configure Custom Domain

Once testing passes:

1. In Cloudflare Pages project settings
2. Go to "Custom Domains" tab
3. Click "Setup a custom domain"
4. Enter your domain: `sutra-loungehtd.com`
5. Cloudflare will provide nameserver information
6. Update your domain's nameservers to point to Cloudflare (done in your registrar)

### Nameserver Migration
1. Go to your domain registrar
2. Update nameservers to:
   - `ns1.cloudflare.com`
   - `ns2.cloudflare.com`
   - `ns3.cloudflare.com`
   - `ns4.cloudflare.com`
3. Wait 24-48 hours for DNS propagation
4. Verify: `nslookup sutra-loungehtd.com` should show Cloudflare nameservers

## Step 7: DNS Configuration in Cloudflare

1. In Cloudflare dashboard, go to "DNS" tab
2. Add records:
   ```
   Type: CNAME
   Name: @ (or sutra-loungehtd.com)
   Target: sutra-lounge.pages.dev
   Proxy Status: Proxied
   TTL: Auto
   ```

3. Verify DNS is working:
   - Visit https://sutra-loungehtd.com
   - Should load the same app as pages.dev version

## Step 8: Enable SSL/TLS

1. Go to "SSL/TLS" tab
2. Set encryption mode to "Full (strict)"
3. Wait for certificate (usually instant)

## Step 9: Set Up Rules and Performance

### Caching Rules
1. Go to "Caching" → "Cache Rules"
2. Add rules:
   ```
   Path: /assets/*
   Cache Level: Cache Everything
   TTL: 1 year
   
   Path: /images/*
   Cache Level: Cache Everything
   TTL: 1 year
   
   Path: *.webp
   Cache Level: Cache Everything
   TTL: 1 year
   ```

### Page Rules (optional)
1. Go to "Page Rules"
2. Add: `sutra-loungehtd.com/*` → Cache Level: Cache Everything

## Step 10: Final Verification

1. Clear browser cache (Ctrl+Shift+Delete)
2. Visit https://sutra-loungehtd.com
3. Verify all content loads
4. Check Lighthouse score (DevTools → Lighthouse)
5. Monitor console for errors
6. Test on mobile device

## Rollback Plan (if issues occur)

If something goes wrong:
1. Go back to Cloudflare Pages settings
2. Click "Deployments"
3. Select previous working deployment
4. Click "Rollback to this deployment"
5. Or temporarily point DNS back to Vercel

## Performance Monitoring

After migration:
1. Go to "Analytics" tab in Cloudflare
2. Monitor:
   - Page views
   - Request volume
   - Cache hit ratio
   - Error rates

## Common Issues & Fixes

### Issue: 404 errors on page refresh
**Solution:** _redirects file should handle SPA routing
- Verify `public/_redirects` exists in build output
- Check it contains: `/* /index.html 200`

### Issue: Images not loading
**Solution:** Check image paths and caching
- Images should be in `/public/images/`
- Verify they're in `dist/images/` after build
- Check LQIP blur placeholders are loading

### Issue: Environment variables not working
**Solution:** Ensure they're prefixed correctly
- For Vite: Must start with `VITE_`
- Set in Cloudflare dashboard, not `.env` files
- Redeploy after adding variables

### Issue: Supabase connection fails
**Solution:** Check API keys and URLs
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Ensure they're in the right environment
- Check CORS is not blocking the requests

## Support Resources

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Cloudflare Pages GitHub Integration: https://developers.cloudflare.com/pages/get-started/git-integration/
- Supabase Documentation: https://supabase.com/docs
- GitHub Issues: https://github.com/sahaniyogesh471/Sutra-Lounge-/issues

## Timeline

- Setup account & GitHub connection: 5-10 minutes
- Initial deployment: 2-3 minutes
- Testing & verification: 10-15 minutes
- DNS propagation: 24-48 hours
- **Total active time: ~30-45 minutes**
- **Total wait time: 24-48 hours for full DNS cutover**

After these steps, your Sutra Lounge website will be fully migrated to Cloudflare Pages with:
- Faster global CDN delivery
- Better caching
- Security features
- Same LQIP and fast loading optimization
- Supabase integration working perfectly
