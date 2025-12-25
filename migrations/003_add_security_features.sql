-- Migration 003: Add Security Features
-- Add account lockout and audit logging capabilities

-- Add account lockout columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Create audit logs table for security tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit logs performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);

-- Create indexes for account lockout performance
CREATE INDEX IF NOT EXISTS idx_users_failed_attempts ON users(failed_login_attempts);
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);

-- Create function to automatically clean up old audit logs (optional)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    -- Delete audit logs older than 1 year
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old logs (can be run manually or via cron)
-- SELECT cleanup_old_audit_logs();
