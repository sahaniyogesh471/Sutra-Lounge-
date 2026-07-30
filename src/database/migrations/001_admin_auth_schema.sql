-- Admin Authentication Schema Migration
-- Creates tables for admin users, sessions, and audit logs

-- Extend admin_users table with authentication fields
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS passcode_hash TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS session_token TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS session_expiry TIMESTAMP WITH TIME ZONE;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX audit_logs_admin_id (admin_id),
  INDEX audit_logs_created_at (created_at),
  INDEX audit_logs_action (action)
);

-- Create admin_sessions table for session management
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  token_hash TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX admin_sessions_admin_id (admin_id),
  INDEX admin_sessions_token_hash (token_hash),
  INDEX admin_sessions_expires_at (expires_at)
);

-- Create admin_login_history table for security tracking
CREATE TABLE IF NOT EXISTS admin_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  login_type VARCHAR(20),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX admin_login_history_admin_id (admin_id),
  INDEX admin_login_history_created_at (created_at)
);

-- Enable Row Level Security on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_login_history ENABLE ROW LEVEL SECURITY;

-- Create security policies (admin users can see their own data)
CREATE POLICY "Admins can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (admin_id = auth.uid());

CREATE POLICY "Admins can view their own sessions"
  ON admin_sessions FOR SELECT
  USING (admin_id = auth.uid());

CREATE POLICY "Admins can view their own login history"
  ON admin_login_history FOR SELECT
  USING (admin_id = auth.uid());
