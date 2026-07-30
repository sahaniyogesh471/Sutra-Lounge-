# Admin Authentication Testing & Verification Guide

## Overview

This guide walks you through testing and verifying the complete admin authentication system implemented for Sutra Lounge.

## Pre-Testing Setup

### 1. Database Schema Migration

Run the SQL migration to create the authentication tables:

```sql
-- Execute in Supabase SQL Editor:
-- Copy content from src/database/migrations/001_admin_auth_schema.sql
```

**Tables Created:**
- `admin_users` (extended with auth columns)
- `audit_logs` (admin action tracking)
- `admin_sessions` (session management)
- `admin_login_history` (login attempt tracking)

### 2. Environment Variables

Set up local environment (.env.local):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id  # Optional
VITE_ENCRYPTION_KEY=your-32-char-encryption-key
VITE_SESSION_TIMEOUT_MINUTES=30
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_LOCKOUT_DURATION_MINUTES=15
VITE_ENVIRONMENT=development
```

### 3. Create Test Admin User

In Supabase:

1. Insert into `admin_users` table:
```sql
INSERT INTO admin_users (name, email, is_active)
VALUES ('Test Admin', 'admin@test.com', true);
```

2. Note the admin ID (UUID)

## Testing Phases

### Phase 1: Environment Validation

```bash
npm run dev
```

**Expected Output:**
- Console shows environment validation results
- No errors for required variables
- Warnings for optional variables in production mode

**Check:**
- Open browser console (F12)
- Look for `[v0] Environment validation` messages
- Verify no critical errors

### Phase 2: Session Creation

**Test Case:** User logs in with valid credentials

1. Click Admin button on homepage
2. Enter admin email and password
3. Submit auth form

**Expected Behavior:**
- Modal closes
- Admin panel opens
- Console shows: `[v0] Admin authenticated successfully, session created`
- SessionStorage contains encrypted session data

**Verification:**
```javascript
// In browser console:
JSON.parse(sessionStorage.getItem('admin_session_data'));
```

Should show:
```javascript
{
  userId: "uuid-here",
  token: "token-here",
  createdAt: timestamp,
  lastActivityAt: timestamp,
  expiresAt: timestamp,
  ...
}
```

### Phase 3: Session Persistence

**Test Case:** Refresh page while logged in

1. Log in successfully
2. Press F5 to refresh page
3. Wait for page to fully load

**Expected Behavior:**
- Admin stays logged in (session restored)
- Console shows: `[v0] Admin session restored and verified`
- Admin panel doesn't require re-authentication

**Failure Case:**
- If session was invalid/expired, auth modal opens automatically

### Phase 4: Session Timeout

**Test Case:** Idle timeout after 30 minutes

1. Log in successfully
2. Note the session expiry time in console
3. Wait (or simulate) until `expiresAt` timestamp passes

**Expected Behavior:**
- Console shows: `[v0] Session timeout detected, logging out`
- Admin panel closes
- Auth modal opens automatically
- User sees logout message

**Manual Test (Fast):**
- Set `VITE_SESSION_TIMEOUT_MINUTES=1` temporarily
- Log in
- Wait 1 minute
- Verify timeout behavior

### Phase 5: Activity Tracking

**Test Case:** Session survives with user activity

1. Log in successfully
2. Note session expiration time
3. Perform actions: move mouse, click, type
4. Wait past original expiration time

**Expected Behavior:**
- Session expiration extends with each activity
- User can continue working indefinitely
- Session only expires if idle for full timeout period

**Verification:**
```javascript
// In console:
const session = JSON.parse(sessionStorage.getItem('admin_session_data'));
console.log('Expires at:', new Date(session.expiresAt).toLocaleTimeString());
// Should update as you perform actions
```

### Phase 6: Audit Logging

**Test Case:** Admin actions are logged

1. Log in as admin
2. Make changes (e.g., update menu, change settings)
3. Save changes

**Expected Behavior:**
- Changes save successfully
- Check Supabase `audit_logs` table
- New entry appears with:
  - admin_id matching your user
  - action describing what was changed
  - old_values and new_values stored
  - created_at timestamp
  - status: 'success'

**Query in Supabase:**
```sql
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

### Phase 7: Login Attempt Tracking

**Test Case:** Login attempts are recorded

1. Try logging in with invalid credentials
2. Try successful login

**Expected Behavior:**
- Failed attempt logged in `admin_login_history`
- Successful attempt logged in `admin_login_history`
- Both show:
  - admin_id
  - login_type (email, passcode, google)
  - success (true/false)
  - failure_reason (if failed)
  - created_at timestamp
  - user_agent (browser info)

**Query in Supabase:**
```sql
SELECT admin_id, login_type, success, created_at 
FROM admin_login_history 
ORDER BY created_at DESC 
LIMIT 20;
```

### Phase 8: Session Verification

**Test Case:** Periodic session validation

1. Log in successfully
2. Open browser console
3. Wait 5 minutes

**Expected Behavior:**
- Every 5 minutes, console shows session verification
- If session valid: continues silently
- If session invalid: logs out user, shows auth modal
- Console shows: `[v0] Local session validation` or `[v0] Server session validation`

**Manual Test:**
- Modify `sessionCheckInterval` in App.tsx to 10 seconds for testing
- Verify messages appear in console

### Phase 9: Logout

**Test Case:** User logout clears session

1. Log in successfully
2. Click logout button (if available) or close admin panel
3. Check session storage

**Expected Behavior:**
- Admin panel closes
- Session cleared from storage
- Console shows: `[v0] Admin logged out, session cleared`
- Session storage shows: `null` when queried

**Verification:**
```javascript
// In console:
sessionStorage.getItem('admin_session_data');  // Should return null
```

### Phase 10: Environment Variables in Production

**Test Case:** Deployment with Cloudflare Pages

1. Set environment variables in Cloudflare dashboard:
   - Production environment variables
   - Preview environment variables (different values)

2. Deploy to Cloudflare Pages

3. Test both production and preview deployments

**Expected Behavior:**
- Each environment uses correct env vars
- Preview uses preview configuration
- Production uses production configuration
- No leakage between environments

## Performance Metrics

After completing all tests, verify:

```javascript
// In browser console:
performance.measure('auth-check-time');
console.log('Auth check completed');
```

**Expected Times:**
- Session creation: < 100ms
- Session validation (local): < 10ms
- Session verification (server): < 500ms
- Activity tracking updates: < 5ms

## Troubleshooting

### Session Not Persisting

**Symptoms:** Refresh page, session lost

**Check:**
1. SessionStorage enabled in browser
2. VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set correctly
3. admin_sessions table exists in Supabase
4. No errors in browser console

**Fix:**
```javascript
// Check if sessionStorage available:
console.log(typeof sessionStorage);  // Should be 'object'

// Check session data:
console.log(sessionStorage.getItem('admin_session_data'));
```

### Session Expires Too Quickly

**Symptoms:** Logged out after < 30 minutes

**Check:**
1. VITE_SESSION_TIMEOUT_MINUTES value
2. No error messages in console
3. User activity being tracked

**Fix:**
```javascript
// Check timeout value:
const session = JSON.parse(sessionStorage.getItem('admin_session_data'));
const now = Date.now();
const timeRemaining = session.expiresAt - now;
console.log('Minutes remaining:', Math.floor(timeRemaining / 60000));
```

### Audit Logs Not Created

**Symptoms:** audit_logs table empty after admin actions

**Check:**
1. audit_logs table exists in Supabase
2. RLS policies are correct
3. No database errors in console

**Fix:**
```sql
-- Verify table exists:
SELECT * FROM audit_logs LIMIT 1;

-- Check RLS policies:
SELECT * FROM pg_policies WHERE tablename = 'audit_logs';
```

### Environment Variables Not Loading

**Symptoms:** `Required environment variable` error

**Check:**
1. .env.local file exists in project root
2. Variables have VITE_ prefix
3. App restarted after adding env vars

**Fix:**
```bash
# Restart dev server:
npm run dev

# Check loaded env vars:
console.log(import.meta.env.VITE_SUPABASE_URL);  // Should show URL
```

## Verification Checklist

- [ ] Database schema created (3 new tables + extensions)
- [ ] Environment variables configured locally
- [ ] Admin user created in admin_users table
- [ ] Session created on login
- [ ] Session persists after refresh
- [ ] Session expires after 30 minutes idle
- [ ] Activity tracking extends session
- [ ] Admin actions logged in audit_logs
- [ ] Login attempts logged in admin_login_history
- [ ] Periodic session verification working (5-min interval)
- [ ] Logout clears session properly
- [ ] Environment validation passes on startup
- [ ] Console shows expected [v0] messages

## Next Steps

1. **Deploy to Staging:**
   - Push to GitHub with all changes
   - Set Cloudflare Pages environment variables
   - Test in staging environment

2. **Production Deployment:**
   - Set production environment variables
   - Monitor Cloudflare logs for errors
   - Verify admin functionality

3. **Monitoring:**
   - Check audit_logs regularly
   - Monitor session creation/expiration
   - Track login attempt patterns
   - Set up Sentry integration for errors

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Session Management: See src/utils/sessionManagement.ts
- Audit Logging: See src/services/auditLogService.ts
