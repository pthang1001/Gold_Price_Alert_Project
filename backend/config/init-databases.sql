-- Initialize all microservice databases
-- This script runs automatically when MySQL container starts

-- Create Auth Service Database
CREATE DATABASE IF NOT EXISTS auth_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create User Service Database
CREATE DATABASE IF NOT EXISTS user_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create Price Service Database
CREATE DATABASE IF NOT EXISTS price_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create Alert Service Database
CREATE DATABASE IF NOT EXISTS alert_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create Email Service Database
CREATE DATABASE IF NOT EXISTS email_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create Notification Service Database
CREATE DATABASE IF NOT EXISTS notification_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create Admin Service Database
CREATE DATABASE IF NOT EXISTS admin_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create Logging Service Database
CREATE DATABASE IF NOT EXISTS logging_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Verify databases created
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name IN ('auth_db', 'user_db', 'price_db', 'alert_db', 'email_db', 'notification_db', 'admin_db', 'logging_db')
ORDER BY schema_name;
