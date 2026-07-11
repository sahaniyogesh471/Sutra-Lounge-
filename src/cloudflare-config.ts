/**
 * Cloudflare Pages Environment Configuration
 * Handles environment variables and runtime configuration
 */

// Detect if running on Cloudflare Pages
export const isCloudflarePages = (): boolean => {
  return typeof navigator !== 'undefined' && 'connection' in navigator;
};

// Get environment variable with fallback
export const getEnv = (key: string, defaultValue?: string): string => {
  // In Vite, env variables are prefixed with VITE_
  const value = import.meta.env[`VITE_${key}`];
  return value || defaultValue || '';
};

// Supabase configuration from environment
export const supabaseConfig = {
  url: getEnv('SUPABASE_URL', ''),
  anonKey: getEnv('SUPABASE_ANON_KEY', ''),
};

// Application environment
export const appConfig = {
  environment: getEnv('ENVIRONMENT', 'production'),
  isDevelopment: getEnv('ENVIRONMENT', 'production') === 'development',
  isProduction: getEnv('ENVIRONMENT', 'production') === 'production',
};

// Cloudflare specific configuration
export const cloudflareConfig = {
  // Cache settings optimized for Cloudflare
  cacheStrategy: {
    short: 3600, // 1 hour
    medium: 86400, // 24 hours
    long: 31536000, // 1 year
  },
  
  // Performance metrics
  enableMetrics: true,
  
  // Analytics Engine
  enableAnalytics: true,
};

// Validate required environment variables
export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!supabaseConfig.url) {
    errors.push('VITE_SUPABASE_URL is not set');
  }
  
  if (!supabaseConfig.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is not set');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Log configuration on startup (only in development)
if (appConfig.isDevelopment) {
  console.log('[Cloudflare] Environment Configuration:', {
    environment: appConfig.environment,
    supabaseConfigured: !!supabaseConfig.url,
    cloudflarePages: isCloudflarePages(),
  });
}

export default {
  isCloudflarePages,
  getEnv,
  supabaseConfig,
  appConfig,
  cloudflareConfig,
  validateEnvironment,
};
