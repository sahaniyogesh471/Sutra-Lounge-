# Vercel to Cloudflare Pages Migration Guide

## Overview

This guide documents the complete migration of Sutra Lounge from Vercel to Cloudflare Pages. The migration is designed to be seamless with zero downtime using parallel deployment and DNS switching.

## Why Migrate to Cloudflare Pages?

### Benefits
1. **Global CDN**: Cloudflare's network reaches 99.9% of internet users
2. **Better Performance**: Automatic optimization and caching
3. **Security**: DDoS protection and Web Application Firewall included
4. **Cost**: More generous free tier
5. **Integrations**: Easy integration with Cloudflare Workers for serverless functions

## Migration Architecture

```
Current State (Vercel):
sutra-loungehtd.vercel.app → Vercel CDN → sutra-loungehtd.com DNS

New State (Cloudflare):
sutra-lounge.pages.dev → Cloudflare CDN → sutra-loungehtd.com DNS
```

## Files Prepared for Migration

### New Configuration Files
1. **wrangler.toml** - Cloudflare CLI configuration
2. **cloudflare.json** - Project metadata
3. **public/_redirects** - SPA routing rules
4. **public/_headers** - HTTP headers and caching

### Removed Files
1. **vercel.json** - No longer needed for Cloudflare

## Step-by-Step Migration Process

### Phase 1: Preparation (5-10 minutes)
✓ Configuration files created
✓ Production build tested (124.86 KB main bundle)
✓ All dependencies installed

### Phase 2: Cloudflare Setup (10-15 minutes)
You will:
1. Create Cloudflare account (if needed)
2. Connect GitHub repository
3. Configure build settings
4. Add environment variables
5. Trigger first deployment

**See CLOUDFLARE_SETUP_INSTRUCTIONS.md for detailed steps**

### Phase 3: Verification (10-15 minutes)
1. Test on temporary Cloudflare URL (`sutra-lounge.pages.dev`)
2. Verify all functionality:
   - Homepage loads
   - Gallery with LQIP works
   - Admin login accessible
   - Booking form functional
   - Images load correctly

### Phase 4: DNS Migration (5 minutes active, 24-48 hours propagation)
1. Update domain nameservers to Cloudflare
2. Add DNS records in Cloudflare
3. Configure SSL/TLS
4. Set caching rules
5. Monitor DNS propagation

### Phase 5: Verification & Cutover (5 minutes)
1. Confirm sutra-loungehtd.com points to Cloudflare
2. Test production domain
3. Monitor error rates
4. Keep Vercel running as fallback

## Build Configuration Details

### Vite Build Output
```
Main: 124.86 KB (index)
Vendor React: 194.03 KB
Vendor Supabase: 210.28 KB
Vendor Motion: 125.80 KB
Admin Panel: 544.99 KB (lazy loaded)
Icons: 12.79 KB
Utils: 30.46 KB
Data: 14.51 KB
CSS: 73.58 KB

Total: ~1.3 MB (heavily code-split)
```

### Build Command
```bash
npm run build
```

Output directory: `dist/`

### Deployment via Wrangler CLI
```bash
npm run deploy:cloudflare
```

## Environment Variables

### Required Variables
Add to Cloudflare Pages → Settings → Environment Variables:

**Production:**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
- `VITE_APP_URL`: Your production domain

**Preview:**
- Same as production (recommended) or custom values

### How to Find Supabase Credentials
1. Open https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy URL and Anon Key

## Caching Strategy

### HTTP Headers Configuration (_headers file)
```
Assets (1 year TTL):
- /assets/*.js
- /assets/*.css
- /images/*
- *.webp

HTML (no cache):
- /index.html → max-age=0

API/Data (1 hour):
- /data/*
```

### Cloudflare Cache Rules
```
/assets/* → Cache Everything, 1 year
/images/* → Cache Everything, 1 year
*.webp → Cache Everything, 1 year
/index.html → Bypass Cache
```

## Routing Configuration

### SPA Routing (_redirects file)
```
/* /index.html 200
```

This ensures all non-file requests are routed to index.html for React Router to handle.

## Security Configuration

### HTTP Headers (_headers file)
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### SSL/TLS Configuration
- Mode: Full (strict)
- Automatically provided by Cloudflare
- No additional setup needed

### DDoS Protection
- Automatically enabled with Cloudflare
- WAF rules can be customized in dashboard

## Performance Optimization

### Already Implemented
1. Code splitting (8 chunks)
2. LQIP blur placeholders
3. WebP image format
4. Aggressive caching
5. Terser minification

### Cloudflare-Specific Optimizations
1. Brotli compression (automatic)
2. HTTP/2 and HTTP/3 (automatic)
3. Minification rules (optional)
4. Image optimization (optional)

## Monitoring & Analytics

### Key Metrics to Monitor
1. **Cache Hit Ratio**: Should be >80%
2. **Page Load Time**: Should remain <250ms
3. **Error Rate**: Should be ~0%
4. **Request Volume**: Monitor for spikes
5. **Bandwidth Usage**: Should decrease with better caching

### Where to Check
- Cloudflare Dashboard → Analytics
- Real-time data available 24/7

## Troubleshooting

### Issue: 404 Errors on Refresh
**Cause**: _redirects not working
**Solution**: 
- Verify `public/_redirects` exists
- Check it contains: `/* /index.html 200`
- Redeploy

### Issue: Images Not Loading
**Cause**: Path issues
**Solution**:
- Images should be in `/public/images/`
- Verify in dist/images/ after build
- Check cache headers allow images

### Issue: Supabase Connection Failed
**Cause**: Missing environment variables
**Solution**:
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Ensure they're in correct environment
- Redeploy after adding

### Issue: Slow Performance
**Cause**: Cache not working properly
**Solution**:
- Check cache hit ratio in analytics
- Verify cache rules are set
- Clear Cloudflare cache and redeploy

## Rollback Plan

If critical issues occur:

1. **Immediate Rollback** (same minute):
   - Keep Vercel running in parallel
   - DNS still points to Cloudflare
   - Manual intervention: Point DNS back to Vercel's Alias record

2. **Failed Deployment** (current):
   - In Cloudflare Pages → Deployments
   - Click previous working version
   - Click "Rollback to this deployment"

3. **DNS Revert** (if needed):
   - Update nameservers back to previous provider
   - Takes 24-48 hours to fully propagate

## Timeline

| Phase | Task | Duration | Active Time |
|-------|------|----------|------------|
| 1 | Preparation | - | ✓ Done |
| 2 | Cloudflare Setup | - | 15-20 min |
| 3 | Testing | - | 15-20 min |
| 4 | DNS Migration | 24-48 hours | 5 min |
| 5 | Verification | - | 5-10 min |

**Total Active Time**: 40-55 minutes
**Total Calendar Time**: 24-48 hours (DNS propagation)

## Post-Migration Tasks

### Day 1
- Monitor error logs
- Check analytics
- Verify all functionality
- Test on multiple devices/browsers

### Week 1
- Monitor cache hit ratio
- Check performance metrics
- Collect user feedback
- Optimize caching rules if needed

### Week 2+
- Decommission Vercel project (optional)
- Update DNS records (if using Cloudflare DNS)
- Set up automatic deployments

## Success Criteria

✓ Homepage loads in <250ms
✓ Gallery displays with LQIP blur effects
✓ Images load with WebP format
✓ Admin login functional
✓ Booking form works
✓ Supabase integration active
✓ Cache hit ratio >80%
✓ Zero 404 errors
✓ Mobile responsive
✓ All security headers present

## Support & Resources

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **GitHub Integration**: https://developers.cloudflare.com/pages/get-started/git-integration/
- **Supabase Docs**: https://supabase.com/docs
- **Project Repository**: https://github.com/sahaniyogesh471/Sutra-Lounge-

## Next Steps

1. Read CLOUDFLARE_SETUP_INSTRUCTIONS.md
2. Follow step-by-step setup guide
3. Test on staging domain
4. Execute DNS migration
5. Monitor and verify

The migration is designed to be seamless with full rollback capability at each stage.
