import bcryptjs from 'bcryptjs';
import CryptoJS from 'crypto-js';
import { supabase } from '../lib/supabase';

const ENCRYPTION_KEY = process.env.VITE_ENCRYPTION_KEY || 'sutra-lounge-secret-key-2024';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  password_hash?: string;
  passcode_hash?: string;
  google_id?: string;
  last_login?: string;
  session_token?: string;
  session_expires?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: AdminUser;
  token?: string;
}

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcryptjs.genSalt(12);
    return await bcryptjs.hash(password, salt);
  } catch (error) {
    console.error('[v0] Error hashing password:', error);
    throw error;
  }
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcryptjs.compare(password, hash);
  } catch (error) {
    console.error('[v0] Error verifying password:', error);
    return false;
  }
}

// Hash 3-digit passcode
export function hashPasscode(passcode: string): string {
  return CryptoJS.SHA256(passcode + ENCRYPTION_KEY).toString();
}

// Verify passcode
export function verifyPasscode(passcode: string, hash: string): boolean {
  const computed = CryptoJS.SHA256(passcode + ENCRYPTION_KEY).toString();
  return computed === hash;
}

// Email/Password login
export async function loginWithEmailPassword(email: string, password: string): Promise<LoginResponse> {
  try {
    // Get admin user by email
    const { data: adminUsers, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError || !adminUsers) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Check if account is locked
    if (adminUsers.locked_until && new Date(adminUsers.locked_until) > new Date()) {
      return {
        success: false,
        message: 'Account temporarily locked. Please try again later.'
      };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, adminUsers.password_hash || '');
    if (!isPasswordValid) {
      // Increment failed login attempts
      const newAttempts = (adminUsers.failed_login_attempts || 0) + 1;
      const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await supabase
        .from('admin_users')
        .update({
          failed_login_attempts: newAttempts,
          locked_until: lockUntil
        })
        .eq('id', adminUsers.id);

      await logAudit(adminUsers.id, 'LOGIN_FAILED_PASSWORD', { email, attempts: newAttempts });

      return {
        success: false,
        message: newAttempts >= 5 ? 'Account locked after 5 failed attempts' : 'Invalid email or password'
      };
    }

    // Reset failed attempts on successful login
    const sessionToken = generateSessionToken();
    const sessionExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await supabase
      .from('admin_users')
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        session_token: sessionToken,
        session_expires: sessionExpires.toISOString(),
        last_login: new Date().toISOString()
      })
      .eq('id', adminUsers.id);

    await logAudit(adminUsers.id, 'LOGIN_SUCCESS_PASSWORD', { email });

    return {
      success: true,
      message: 'Login successful',
      user: adminUsers,
      token: sessionToken
    };
  } catch (error: any) {
    console.error('[v0] Login error:', error);
    return {
      success: false,
      message: 'Login failed: ' + error.message
    };
  }
}

// 3-digit passcode login
export async function loginWithPasscode(email: string, passcode: string): Promise<LoginResponse> {
  try {
    const { data: adminUsers, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError || !adminUsers) {
      return {
        success: false,
        message: 'Invalid email or passcode'
      };
    }

    // Check if account is locked
    if (adminUsers.locked_until && new Date(adminUsers.locked_until) > new Date()) {
      return {
        success: false,
        message: 'Account temporarily locked. Please try again later.'
      };
    }

    // Validate passcode format (3 digits)
    if (!/^\d{3}$/.test(passcode)) {
      return {
        success: false,
        message: 'Passcode must be 3 digits'
      };
    }

    // Verify passcode
    const isPasscodeValid = verifyPasscode(passcode, adminUsers.passcode_hash || '');
    if (!isPasscodeValid) {
      const newAttempts = (adminUsers.failed_login_attempts || 0) + 1;
      const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await supabase
        .from('admin_users')
        .update({
          failed_login_attempts: newAttempts,
          locked_until: lockUntil
        })
        .eq('id', adminUsers.id);

      await logAudit(adminUsers.id, 'LOGIN_FAILED_PASSCODE', { email, attempts: newAttempts });

      return {
        success: false,
        message: newAttempts >= 5 ? 'Account locked after 5 failed attempts' : 'Invalid passcode'
      };
    }

    // Reset failed attempts and create session
    const sessionToken = generateSessionToken();
    const sessionExpires = new Date(Date.now() + 30 * 60 * 1000);

    await supabase
      .from('admin_users')
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        session_token: sessionToken,
        session_expires: sessionExpires.toISOString(),
        last_login: new Date().toISOString()
      })
      .eq('id', adminUsers.id);

    await logAudit(adminUsers.id, 'LOGIN_SUCCESS_PASSCODE', { email });

    return {
      success: true,
      message: 'Login successful',
      user: adminUsers,
      token: sessionToken
    };
  } catch (error: any) {
    console.error('[v0] Passcode login error:', error);
    return {
      success: false,
      message: 'Login failed: ' + error.message
    };
  }
}

// Google OAuth login
export async function loginWithGoogle(googleToken: string, googleId: string, email: string, fullName: string): Promise<LoginResponse> {
  try {
    // Find admin by google_id or email
    const { data: adminUsers, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('google_id', googleId)
      .single();

    if (!adminUsers || fetchError) {
      // Try by email instead
      const { data: adminByEmail, error: emailError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (!adminByEmail || emailError) {
        return {
          success: false,
          message: 'Admin account not found. Please use email/password or passcode.'
        };
      }

      // Link Google ID to existing email
      const sessionToken = generateSessionToken();
      const sessionExpires = new Date(Date.now() + 30 * 60 * 1000);

      await supabase
        .from('admin_users')
        .update({
          google_id: googleId,
          session_token: sessionToken,
          session_expires: sessionExpires.toISOString(),
          last_login: new Date().toISOString()
        })
        .eq('id', adminByEmail.id);

      await logAudit(adminByEmail.id, 'LOGIN_SUCCESS_GOOGLE', { email, googleId });

      return {
        success: true,
        message: 'Login successful',
        user: adminByEmail,
        token: sessionToken
      };
    }

    // Admin found with Google ID
    const sessionToken = generateSessionToken();
    const sessionExpires = new Date(Date.now() + 30 * 60 * 1000);

    await supabase
      .from('admin_users')
      .update({
        session_token: sessionToken,
        session_expires: sessionExpires.toISOString(),
        last_login: new Date().toISOString()
      })
      .eq('id', adminUsers.id);

    await logAudit(adminUsers.id, 'LOGIN_SUCCESS_GOOGLE', { email, googleId });

    return {
      success: true,
      message: 'Login successful',
      user: adminUsers,
      token: sessionToken
    };
  } catch (error: any) {
    console.error('[v0] Google login error:', error);
    return {
      success: false,
      message: 'Google login failed: ' + error.message
    };
  }
}

// Verify session token
export async function verifySession(adminId: string, sessionToken: string): Promise<boolean> {
  try {
    const { data: adminUsers, error } = await supabase
      .from('admin_users')
      .select('session_token, session_expires')
      .eq('id', adminId)
      .single();

    if (error || !adminUsers) return false;

    const isValid = adminUsers.session_token === sessionToken &&
      adminUsers.session_expires &&
      new Date(adminUsers.session_expires) > new Date();

    if (!isValid) {
      await supabase
        .from('admin_users')
        .update({ session_token: null, session_expires: null })
        .eq('id', adminId);
    }

    return isValid;
  } catch (error) {
    console.error('[v0] Session verification error:', error);
    return false;
  }
}

// Update admin password
export async function updateAdminPassword(adminId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const passwordHash = await hashPassword(newPassword);

    const { error } = await supabase
      .from('admin_users')
      .update({ password_hash: passwordHash })
      .eq('id', adminId);

    if (error) throw error;

    await logAudit(adminId, 'PASSWORD_CHANGED', {});

    return {
      success: true,
      message: 'Password updated successfully'
    };
  } catch (error: any) {
    console.error('[v0] Error updating password:', error);
    return {
      success: false,
      message: 'Failed to update password: ' + error.message
    };
  }
}

// Update admin passcode
export async function updateAdminPasscode(adminId: string, newPasscode: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validate 3-digit format
    if (!/^\d{3}$/.test(newPasscode)) {
      return {
        success: false,
        message: 'Passcode must be exactly 3 digits'
      };
    }

    const passcodeHash = hashPasscode(newPasscode);

    const { error } = await supabase
      .from('admin_users')
      .update({ passcode_hash: passcodeHash })
      .eq('id', adminId);

    if (error) throw error;

    await logAudit(adminId, 'PASSCODE_CHANGED', {});

    return {
      success: true,
      message: 'Passcode updated successfully'
    };
  } catch (error: any) {
    console.error('[v0] Error updating passcode:', error);
    return {
      success: false,
      message: 'Failed to update passcode: ' + error.message
    };
  }
}

// Update admin email
export async function updateAdminEmail(adminId: string, newEmail: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', newEmail)
      .neq('id', adminId);

    if (existing && existing.length > 0) {
      return {
        success: false,
        message: 'Email already in use'
      };
    }

    const { error } = await supabase
      .from('admin_users')
      .update({ email: newEmail })
      .eq('id', adminId);

    if (error) throw error;

    await logAudit(adminId, 'EMAIL_CHANGED', { new_email: newEmail });

    return {
      success: true,
      message: 'Email updated successfully'
    };
  } catch (error: any) {
    console.error('[v0] Error updating email:', error);
    return {
      success: false,
      message: 'Failed to update email: ' + error.message
    };
  }
}

// Logout
export async function logout(adminId: string): Promise<void> {
  try {
    await supabase
      .from('admin_users')
      .update({ session_token: null, session_expires: null })
      .eq('id', adminId);

    await logAudit(adminId, 'LOGOUT', {});
  } catch (error) {
    console.error('[v0] Logout error:', error);
  }
}

// Generate session token
function generateSessionToken(): string {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
}

// Audit logging
async function logAudit(adminId: string, action: string, details: any): Promise<void> {
  try {
    await supabase
      .from('audit_logs')
      .insert([
        {
          admin_id: adminId,
          action,
          details,
          created_at: new Date().toISOString()
        }
      ]);
  } catch (error) {
    console.error('[v0] Audit log error:', error);
  }
}

export default {
  hashPassword,
  verifyPassword,
  hashPasscode,
  verifyPasscode,
  loginWithEmailPassword,
  loginWithPasscode,
  loginWithGoogle,
  verifySession,
  updateAdminPassword,
  updateAdminPasscode,
  updateAdminEmail,
  logout,
  logAudit
};
