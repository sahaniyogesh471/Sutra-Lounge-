// Environment variable types and validators for admin authentication

export interface EnvironmentVariables {
  // Supabase configuration (required)
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;

  // Google OAuth configuration (optional)
  VITE_GOOGLE_CLIENT_ID?: string;

  // Encryption key for sensitive data (required for production)
  VITE_ENCRYPTION_KEY?: string;

  // Admin authentication settings
  VITE_SESSION_TIMEOUT_MINUTES?: string; // Default: 30 minutes
  VITE_MAX_LOGIN_ATTEMPTS?: string; // Default: 5 attempts
  VITE_LOCKOUT_DURATION_MINUTES?: string; // Default: 15 minutes

  // Environment detection
  VITE_ENVIRONMENT?: 'development' | 'staging' | 'production';
}

// Get environment variables with defaults
export const getEnvVar = (key: keyof EnvironmentVariables, defaultValue?: string): string => {
  const value = import.meta.env[key];
  
  if (!value && !defaultValue) {
    if (key.startsWith('VITE_') && ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].includes(key)) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return '';
  }
  
  return value || defaultValue || '';
};

// Validate required environment variables
export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl) errors.push('VITE_SUPABASE_URL is required');
    if (!supabaseKey) errors.push('VITE_SUPABASE_ANON_KEY is required');

    // Optional but recommended for production
    if (import.meta.env.MODE === 'production') {
      const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;
      if (!encryptionKey) errors.push('VITE_ENCRYPTION_KEY is recommended for production');
    }
  } catch (error) {
    errors.push('Failed to read environment variables');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Settings with environment variable overrides
export const AdminAuthSettings = {
  sessionTimeoutMinutes: parseInt(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES || '30', 10),
  maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5', 10),
  lockoutDurationMinutes: parseInt(import.meta.env.VITE_LOCKOUT_DURATION_MINUTES || '15', 10),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY || '',
  environment: (import.meta.env.VITE_ENVIRONMENT || 'production') as 'development' | 'staging' | 'production',
};
