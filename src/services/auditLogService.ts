// Audit logging service for tracking admin actions

import { supabase } from '../lib/supabase';

export interface AuditLogEntry {
  admin_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  status?: 'success' | 'failed';
  error_message?: string;
}

/**
 * Log an admin action
 */
export const logAdminAction = async (entry: AuditLogEntry): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        admin_id: entry.admin_id,
        action: entry.action,
        entity_type: entry.entity_type || null,
        entity_id: entry.entity_id || null,
        old_values: entry.old_values || null,
        new_values: entry.new_values || null,
        ip_address: entry.ip_address || null,
        user_agent: entry.user_agent || navigator.userAgent,
        status: entry.status || 'success',
        error_message: entry.error_message || null,
      }]);

    if (error) {
      console.error('[AuditLog] Failed to log action:', error);
      return false;
    }

    console.log('[AuditLog] Action logged:', entry.action);
    return true;
  } catch (error) {
    console.error('[AuditLog] Exception while logging:', error);
    return false;
  }
};

/**
 * Log a failed action
 */
export const logFailedAction = async (
  adminId: string,
  action: string,
  error: Error | string,
  entityType?: string,
  entityId?: string
): Promise<boolean> => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return logAdminAction({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    status: 'failed',
    error_message: errorMessage,
  });
};

/**
 * Log login attempt
 */
export const logLoginAttempt = async (
  adminId: string,
  loginType: 'email' | 'passcode' | 'google',
  success: boolean,
  failureReason?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_login_history')
      .insert([{
        admin_id: adminId,
        login_type: loginType,
        ip_address: null, // Would need server-side capture
        user_agent: navigator.userAgent,
        success,
        failure_reason: failureReason || null,
      }]);

    if (error) {
      console.error('[AuditLog] Failed to log login:', error);
      return false;
    }

    console.log('[AuditLog] Login attempt logged:', { adminId, loginType, success });
    return true;
  } catch (error) {
    console.error('[AuditLog] Exception logging login:', error);
    return false;
  }
};

/**
 * Get audit logs for an admin user
 */
export const getAdminAuditLogs = async (
  adminId: string,
  limit: number = 100,
  offset: number = 0
) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[AuditLog] Failed to fetch logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[AuditLog] Exception fetching logs:', error);
    return [];
  }
};

/**
 * Get login history for an admin user
 */
export const getAdminLoginHistory = async (
  adminId: string,
  limit: number = 50,
  offset: number = 0
) => {
  try {
    const { data, error } = await supabase
      .from('admin_login_history')
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[AuditLog] Failed to fetch login history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[AuditLog] Exception fetching login history:', error);
    return [];
  }
};

/**
 * Get all active sessions for an admin
 */
export const getAdminActiveSessions = async (adminId: string) => {
  try {
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('admin_id', adminId)
      .eq('revoked', false)
      .gt('expires_at', new Date().toISOString());

    if (error) {
      console.error('[AuditLog] Failed to fetch sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[AuditLog] Exception fetching sessions:', error);
    return [];
  }
};

/**
 * Revoke a session
 */
export const revokeSession = async (sessionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_sessions')
      .update({ revoked: true, revoked_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('[AuditLog] Failed to revoke session:', error);
      return false;
    }

    console.log('[AuditLog] Session revoked:', sessionId);
    return true;
  } catch (error) {
    console.error('[AuditLog] Exception revoking session:', error);
    return false;
  }
};
