# Deployment Checklist - Follow This Order

## Before Deployment (Do These First)

- [ ] You have git installed on your computer
- [ ] You have access to your GitHub account
- [ ] You have a Cloudflare account (free is fine)
- [ ] You have Supabase project set up
- [ ] You have VITE_SUPABASE_URL value
- [ ] You have VITE_SUPABASE_ANON_KEY value

## Step 1: Merge to Main Branch

Run on your computer (in project folder):

```bash
cd Sutra-Lounge-
git checkout main
git pull origin main
git merge v0/table-booking-with-whatsapp-6d7a8b4b
git push origin main
```

- [ ] Commands executed successfully
- [ ] No merge conflicts
- [ ] Code pushed to GitHub

## Step 2: Deploy to Cloudflare Pages

1. Go to https://pages.cloudflare.com
2. Click "Create a project"
3. Click "Connect to Git"
4. Authorize Cloudflare with GitHub
5. Select repository: `sahaniyogesh471/Sutra-Lounge-`
6. Cloudflare detects `main` branch automatically
7. Click "Save and Deploy"
8. Wait 2-3 minutes for build

- [ ] Project created in Cloudflare
- [ ] GitHub authorized
- [ ] Build started
- [ ] Build completed successfully (check Deployments tab)

## Step 3: Add Environment Variables

1. In Cloudflare Pages project
2. Click "Settings"
3. Click "Environment variables"
4. Add these variables (Production):

| Variable | Value |
|----------|-------|
| VITE_SUPABASE_URL | `https://xxxx.supabase.co` |
| VITE_SUPABASE_ANON_KEY | `eyJhbGc...` |
| VITE_ENVIRONMENT | `production` |

5. Click "Save"
6. Go back to Deployments
7. Click "Redeploy"

- [ ] VITE_SUPABASE_URL added
- [ ] VITE_SUPABASE_ANON_KEY added
- [ ] VITE_ENVIRONMENT set to `production`
- [ ] Redeploy started
- [ ] Build completed successfully

## Step 4: Verify Website is Live

1. Go to https://sutra-loungehtd.pages.dev
2. You should see your website homepage
3. Images should load (with blur effect initially)
4. Look for "Admin" button in top-right corner

- [ ] Website accessible
- [ ] Homepage loads
- [ ] Gallery images display
- [ ] Admin button visible

## Step 5: Test Admin Panel

1. Click "Admin" button
2. Authentication modal opens
3. Enter email: `admin@sutralounge.com`
4. Enter password: [your admin password]
5. Click "Login"

- [ ] Admin modal opens
- [ ] Login form displays
- [ ] Can enter credentials

**If login fails**: Go to Step 6 first (database migration)

## Step 6: Database Setup (One-Time)

**Only do this once:**

1. Go to https://app.supabase.com
2. Select your project
3. Go to "SQL Editor"
4. Click "New query"
5. Copy content from: `src/database/migrations/001_admin_auth_schema.sql`
6. Paste into editor
7. Click "Run"

Tables created:
- [ ] admin_users (extended)
- [ ] audit_logs (new)
- [ ] admin_sessions (new)
- [ ] admin_login_history (new)

## Step 7: Create Admin User (One-Time)

In Supabase SQL Editor, run:

```sql
INSERT INTO admin_users (name, email, is_active)
VALUES ('Your Name', 'admin@sutralounge.com', true);
```

- [ ] Admin user created
- [ ] Email matches your login email

## Step 8: Test Admin Login Again

1. Go to https://sutra-loungehtd.pages.dev
2. Click "Admin" button
3. Enter credentials
4. Admin dashboard should open

Dashboard tabs visible:
- [ ] Overview
- [ ] Orders
- [ ] Reservations
- [ ] Menu
- [ ] Gallery
- [ ] Settings

## Step 9: Test Admin Features

Try these:
- [ ] View Overview dashboard
- [ ] Click on Orders tab
- [ ] Click on Reservations tab
- [ ] Click on Menu tab
- [ ] Click on Gallery tab
- [ ] Click on Settings tab
- [ ] Click Logout button

## Step 10: Verify Performance

Check:
- [ ] Images load quickly (LQIP blur effect)
- [ ] No broken images
- [ ] Gallery filters work (All, Interior, Food, etc.)
- [ ] Smooth transitions and animations
- [ ] Mobile layout responsive (if testing on phone)

## Final Verification

- [ ] Website accessible at correct URL
- [ ] Admin panel accessible
- [ ] All features working
- [ ] Images loading properly
- [ ] No console errors (F12 → Console)
- [ ] Mobile responsive
- [ ] Fast performance

## Troubleshooting

### Build Failed
- Check Cloudflare deployment logs
- Verify GitHub branch is correct
- Check for syntax errors in code

### Admin Login Failed
- Check database migration completed
- Check admin user created in database
- Check environment variables are correct
- Check Supabase project is accessible

### Images Not Loading
- Check images directory exists
- Verify CORS headers (auto-configured)
- Check browser console for 404 errors

### Slow Performance
- Images should load with LQIP blur
- Check network speed
- Clear browser cache and reload

## Success Criteria

Your deployment is successful when:

✓ Website accessible at https://sutra-loungehtd.pages.dev
✓ Homepage loads with all content
✓ Gallery shows 18 images
✓ Admin button works
✓ Admin panel accessible with login
✓ All dashboard tabs functional
✓ No console errors
✓ Performance good (images load fast)

## Next Steps After Deployment

1. **Share URL** - Tell customers about your website
2. **Monitor** - Check Cloudflare analytics
3. **Update Content** - Use admin panel to manage
4. **Add Bookings** - Start taking reservations
5. **Customize** - Update menu, photos, settings

## Support Documentation

- `CLOUDFLARE_DEPLOYMENT_STEPS.md` - Detailed deployment guide
- `ADMIN_PANEL_ACCESS.md` - Admin features guide
- `ADMIN_AUTH_TESTING.md` - Testing procedures
- `DEPLOYMENT_GUIDE.md` - Full deployment reference

---

**Status**: Follow this checklist in order. You'll have a live website in 15 minutes!

