# Admin Authentication Environment Setup

## Required Environment Variables

### Supabase Configuration (Required)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find:**
1. Go to https://app.supabase.com/projects
2. Select your project
3. Click Settings → API
4. Copy "Project URL" and "anon public" key

### Google OAuth Configuration (Optional)
```
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

**How to get:**
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URIs:
   - http://localhost:3000
   - https://sutra-loungehtd.pages.dev
   - https://sutra-loungehtd.com
6. Copy Client ID

### Encryption Key (Recommended for Production)
```
VITE_ENCRYPTION_KEY=your-32-character-encryption-key
```

**Generate one:**
```bash
openssl rand -base64 32
```

## Optional Configuration

### Admin Authentication Settings
```
VITE_SESSION_TIMEOUT_MINUTES=30
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_LOCKOUT_DURATION_MINUTES=15
VITE_ENVIRONMENT=production
```

## Local Development Setup

1. Create `.env.local` in project root:
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_ENCRYPTION_KEY=generated-key-here
VITE_ENVIRONMENT=development
```

2. Start dev server:
```bash
npm run dev
```

## Cloudflare Pages Setup

1. Go to Cloudflare dashboard
2. Select your Pages project
3. Settings → Environment variables
4. Add for Preview environment:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_GOOGLE_CLIENT_ID
   - VITE_ENCRYPTION_KEY
   - VITE_ENVIRONMENT=staging

5. Add for Production environment:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_GOOGLE_CLIENT_ID
   - VITE_ENCRYPTION_KEY
   - VITE_ENVIRONMENT=production

## GitHub Actions Setup

Add secrets in Settings → Secrets and variables → Actions:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GOOGLE_CLIENT_ID
VITE_ENCRYPTION_KEY
```

These are automatically used during CI/CD deployment.

## Environment Variable Validation

The app validates all required environment variables on startup. If any are missing, you'll see:
```
Error: Required environment variable VITE_SUPABASE_URL is not set
```

## Security Best Practices

1. Never commit `.env` files to Git
2. Use `.env.local` for local development (already in .gitignore)
3. Always use HTTPS for OAuth redirect URIs
4. Rotate encryption keys regularly
5. Store secrets securely in Cloudflare dashboard
6. Use different keys for dev/staging/production
