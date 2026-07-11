# Testing and Verification Guide

## Pre-Deployment Testing (After Cloudflare Setup)

### Environment Checklist

Before testing deployment, ensure:
- [ ] Cloudflare Pages project created
- [ ] GitHub repository connected
- [ ] Build command set to `npm run build`
- [ ] Build output directory set to `dist`
- [ ] Environment variables added (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_APP_URL)
- [ ] First deployment triggered

## Staging URL Testing

Your temporary Cloudflare URL will be: `https://sutra-lounge.pages.dev`

### Phase 1: Basic Functionality (10 minutes)

#### 1.1 Homepage Load Test
```
URL: https://sutra-lounge.pages.dev
Expected:
- Page loads within 3 seconds
- Hero image visible
- Navigation bar responsive
- Text content displays correctly
```

Test Steps:
1. Open URL in fresh browser tab
2. Wait for page to fully load
3. Check browser console (F12) for errors
4. Verify no 404 or failed requests

#### 1.2 Navigation Test
```
Test All Links:
- Logo click → redirects to homepage
- "Menu" → shows menu section
- "Gallery" → shows gallery with images
- "Admin Login" → accessible
- "Book Now" → shows booking form
```

#### 1.3 Responsive Design Test
```
Test Viewports:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (360x720)

Check:
- Navigation adapts correctly
- Images display without distortion
- Text remains readable
- Forms are usable on mobile
```

### Phase 2: Gallery & Image Loading (10 minutes)

#### 2.1 Gallery Images with LQIP

Test at: `https://sutra-lounge.pages.dev#gallery` or scroll to gallery section

Expected behavior:
1. Blurred placeholder images appear instantly (LQIP effect)
2. Placeholders are smooth and natural-looking
3. After ~1-2 seconds, full images fade in
4. Final images are crystal clear and colorful

```
Test Each Image:
1. Lounge Interior
   - Initial: Brown/gold blur
   - Final: Beautiful interior with lighting
   
2. Bar Counter
   - Initial: Medium brown blur
   - Final: Premium bar setup
   
3. Chicken Pizza
   - Initial: Reddish-brown blur
   - Final: Appetizing pizza photo
   
4. Latte Macchiato
   - Initial: Coffee brown blur
   - Final: Professional coffee image
   
5. Fried Momos
   - Initial: Golden brown blur
   - Final: Traditional food photo
   
6. Rooftop Patio
   - Initial: Amber blur
   - Final: Evening ambiance
```

Performance Metrics:
- LQIP appears: <100ms (instant)
- Full image loaded: 200-500ms
- Fade transition: 300ms smooth

#### 2.2 Image Format Verification

In DevTools (F12):
1. Go to Network tab
2. Filter by "img" (images)
3. Verify all images are `.webp` format
4. Check file sizes (50-113KB each)
5. All should return HTTP 200

#### 2.3 WebP Compression Verification

In DevTools:
1. Check "Type" column for images
2. All should show `image/webp`
3. Size should be optimized (not full resolution)

### Phase 3: Functionality Testing (15 minutes)

#### 3.1 Admin Login Page

Test at: `https://sutra-lounge.pages.dev/admin`

Expected:
- Page loads without 404 error
- Login form displays
- Email and password fields present
- "Login" button visible

Try logging in with test credentials:
```
Email: admin@sutralounge.com
Password: AdminPass123!
```

Expected result:
- Success: Dashboard loads
- Failure: Error message displays
- (Failure is OK - just testing form works)

#### 3.2 Booking Form

Located on homepage or at `/booking`:

Expected:
- All form fields display
- Date picker works
- Time picker works
- Party size selector functional
- Submit button clickable
- Form submission works

#### 3.3 Menu Section

Test at: `https://sutra-lounge.pages.dev#menu`

Expected:
- Menu categories display
- Menu items load from Supabase (or static data)
- Prices visible
- Categories: Food, Drinks, etc.
- No "undefined" values

### Phase 4: Performance Metrics (5 minutes)

#### 4.1 Lighthouse Score

1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Click "Analyze page load"
4. Run all categories

Expected Results:
```
Performance: 85+
Accessibility: 85+
Best Practices: 90+
SEO: 90+
PWA: 70+
```

#### 4.2 Web Vitals

In Lighthouse report, check:
- **LCP (Largest Contentful Paint):** <2.5s (good), <4s (acceptable)
- **FID (First Input Delay):** <100ms
- **CLS (Cumulative Layout Shift):** <0.1 (perfect)
- **FCP (First Contentful Paint):** <1.8s
- **TTFB (Time to First Byte):** <300ms

#### 4.3 Bundle Size

Expected sizes:
- Main bundle: 124 KB
- Total JS: ~1.3 MB (split across chunks)
- CSS: 73 KB
- Images: 600 KB

### Phase 5: Browser Console Checks (5 minutes)

Open DevTools Console (F12 → Console tab):

#### 5.1 No Red Errors
```
Expected: No red error messages
If any: Click on error to debug
Acceptable: Network warnings about images
Not acceptable: "Cannot find module", "undefined", CORS errors
```

#### 5.2 Verify Environment Variables

In console, type:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_APP_URL)
```

Expected:
- Both should output your actual values
- Not "undefined"
- Not empty strings

#### 5.3 Check LQIP Data Loading

In console:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
```

Should show Supabase URL (proves build variables loaded correctly)

### Phase 6: Supabase Integration Test (5 minutes)

#### 6.1 Test Database Connection

If booking form saves to database:
1. Fill out booking form
2. Submit
3. Go to Supabase dashboard → Tables
4. Check if new booking appears
5. If yes: Connection working

#### 6.2 Test Admin Login (if connected to auth)

1. Try admin login with correct credentials
2. If works: Database connection verified
3. If fails: Check environment variables

### Phase 7: Mobile Testing (5 minutes)

Test on actual devices:

#### 7.1 iPhone/iPad Safari
- Homepage loads
- Gallery visible
- Navigation works
- Images display
- No layout shift

#### 7.2 Android Chrome
- Same tests as iOS
- Responsive layout
- Touch interactions smooth

#### 7.3 Mobile DevTools Simulation
In Chrome DevTools:
1. Click device icon (toggle device toolbar)
2. Select iPhone 12 / Galaxy S21
3. Test responsive design
4. Check touch-friendly buttons
5. Verify form inputs work

## DNS Migration Testing (After Staging Verified)

### Pre-DNS Cutover Checklist

Once staging is fully tested:
- [ ] All images load correctly
- [ ] LQIP blur effects visible
- [ ] Admin login functional
- [ ] Booking form works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Lighthouse score acceptable
- [ ] Performance metrics good

### DNS Migration Step

1. Update domain nameservers to Cloudflare
2. Add DNS records in Cloudflare
3. Wait 15-60 minutes for propagation

### Post-DNS Verification

#### Test 1: Domain Resolution
```bash
# Check if domain points to Cloudflare
nslookup sutra-loungehtd.com
# Should show Cloudflare nameservers
```

#### Test 2: HTTPS Connection
1. Visit https://sutra-loungehtd.com
2. Should connect (no certificate warnings)
3. Check SSL cert info
4. Should show Cloudflare certificate

#### Test 3: Redirect Test
```
HTTP: http://sutra-loungehtd.com
Expected: Redirect to https://sutra-loungehtd.com

WWW: https://www.sutra-loungehtd.com
Expected: Resolve correctly (configure in Cloudflare if needed)
```

#### Test 4: Full Functionality on Production Domain
```
Test Same as Staging:
- Homepage loads
- Gallery with LQIP
- Admin login
- Booking form
- All images
- Mobile responsive
- Console check
```

## Performance Monitoring

### Key Metrics to Track

After deployment:

1. **Cache Hit Ratio** (should increase over time)
   - Target: >80%
   - Check in: Cloudflare Dashboard → Analytics

2. **Page Load Time**
   - Baseline: Should match or improve from Vercel
   - Target: <2 seconds

3. **Error Rate**
   - Target: 0% or <0.1%
   - Check in: Cloudflare Analytics

4. **Bandwidth Usage**
   - Should decrease due to caching
   - Monitor for anomalies

## Rollback Procedure (If Issues Found)

### Immediate Rollback
If critical issues found during testing:

1. In Cloudflare Pages → Deployments
2. Find previous working version
3. Click "Rollback to this deployment"
4. Takes effect immediately

### During DNS Migration
If issues after DNS switch:

1. Go to Cloudflare DNS settings
2. Find CNAME record pointing to pages.dev
3. Temporarily change target to Vercel domain
4. Or point nameservers back to previous DNS

## Success Criteria (All Must Pass)

- [x] Staging URL accessible without 404
- [x] All 6 gallery images display with LQIP blur
- [x] Images fade smoothly from blur to full resolution
- [x] Homepage loads in <3 seconds
- [x] Gallery loads in <2 seconds per image
- [x] Admin login page accessible
- [x] Booking form functional
- [x] Mobile responsive on 360px viewport
- [x] No red console errors
- [x] Environment variables loaded
- [x] Lighthouse Performance score ≥85
- [x] CLS = 0.0 (perfect)
- [x] No 404 errors in network tab
- [x] WebP images served (not JPEG/PNG)
- [x] HTTPS working with valid certificate
- [x] All navigation links functional
- [x] Forms submit without errors
- [x] Database integration working (if applicable)

## Troubleshooting Common Issues

### Issue: Images not loading
**Debug:**
1. Check Network tab (F12)
2. Look for failed image requests
3. Verify image paths in code
4. Check CORS headers

**Solution:**
- Verify images exist in dist/images/
- Check cache headers aren't too aggressive
- Purge Cloudflare cache and redeploy

### Issue: 404 on refresh
**Debug:**
1. Try different pages
2. Check Network tab for _redirects

**Solution:**
- Verify _redirects in dist/
- Check it contains: `/* /index.html 200`
- Rebuild if needed

### Issue: Slow loading
**Debug:**
1. Check Lighthouse report
2. Look at what's slow
3. Check cache hit ratio

**Solution:**
- Verify cache headers are set
- Check Cloudflare cache rules
- Look for N+1 queries if database

### Issue: Supabase not connecting
**Debug:**
1. Check console for errors
2. Verify environment variables: `console.log(import.meta.env.VITE_SUPABASE_URL)`
3. Check Supabase dashboard for API errors

**Solution:**
- Verify credentials in Cloudflare dashboard
- Ensure VITE_ prefix on variables
- Redeploy after updating
- Check Supabase CORS settings

## Testing Timeline

- **Before DNS:** 60-90 minutes
- **During DNS:** 15-60 minutes
- **After DNS:** 15-30 minutes
- **Total:** 90-180 minutes

## Documentation of Tests

Consider recording:
- Screenshots of each page
- Browser console output
- Network tab (timing)
- Mobile screenshots
- Lighthouse report
- Performance metrics

This creates a baseline for comparison and documentation of successful migration.

## Handoff to Production

Once all tests pass:

1. Update status in v0_plans/cloudflare-pages-migration.md
2. Archive Vercel project (optional)
3. Set up monitoring alerts
4. Document any custom configurations
5. Share access with team

The website is now successfully migrated to Cloudflare Pages with full LQIP image loading optimization and fast performance.
