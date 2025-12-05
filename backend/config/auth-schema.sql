-- Auth Service Database Schema
-- auth_db

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'inactive',
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

CREATE TABLE IF NOT EXISTS roles (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  role_id CHAR(36),
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_role_id (role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id CHAR(36) PRIMARY KEY,
  role_id CHAR(36),
  permission_id CHAR(36),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  INDEX idx_role_id (role_id),
  INDEX idx_permission_id (permission_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  refresh_token TEXT UNIQUE NOT NULL,
  device_info JSON,
  ip_address VARCHAR(45),
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_refresh_token (refresh_token(100))
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  type ENUM('email_verification', 'password_reset', 'login') NOT NULL,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 5,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_email (email)
);

CREATE TABLE IF NOT EXISTS twofa_secrets (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  secret VARCHAR(255) NOT NULL,
  backup_codes JSON,
  enabled BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default roles
INSERT IGNORE INTO roles (id, name, description, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Super Admin', 'Full system access', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Admin', 'User and config management', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'User', 'Regular user', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Moderator', 'Content moderation', NOW());

-- Insert default permissions
INSERT IGNORE INTO permissions (id, name, description, created_at) VALUES
('550e8400-e29b-41d4-a716-446655450001', 'user:create', 'Create users', NOW()),
('550e8400-e29b-41d4-a716-446655450002', 'user:read', 'Read users', NOW()),
('550e8400-e29b-41d4-a716-446655450003', 'user:update', 'Update users', NOW()),
('550e8400-e29b-41d4-a716-446655450004', 'user:delete', 'Delete users', NOW()),
('550e8400-e29b-41d4-a716-446655450005', 'admin:read', 'Access admin panel', NOW()),
('550e8400-e29b-41d4-a716-446655450006', 'admin:write', 'Modify settings', NOW());
