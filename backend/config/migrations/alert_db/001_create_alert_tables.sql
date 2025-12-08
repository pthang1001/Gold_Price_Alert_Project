-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  status ENUM('active', 'paused', 'deleted') DEFAULT 'active',
  last_triggered TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Alert History Table (tracks when alerts were triggered)
CREATE TABLE IF NOT EXISTS alert_history (
  id SERIAL PRIMARY KEY,
  alert_id INT NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  current_price DECIMAL(10, 2) NOT NULL,
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE
);

-- Alert Subscriptions Table (for multiple notification channels)
CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id SERIAL PRIMARY KEY,
  alert_id INT NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', etc
  recipient VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_subscription (alert_id, channel, recipient)
);

-- Create indexes for better query performance
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alert_history_alert_id ON alert_history(alert_id);
CREATE INDEX idx_alert_history_user_id ON alert_history(user_id);
CREATE INDEX idx_alert_history_triggered_at ON alert_history(triggered_at);
CREATE INDEX idx_alert_subscriptions_alert_id ON alert_subscriptions(alert_id);
CREATE INDEX idx_alert_subscriptions_user_id ON alert_subscriptions(user_id);
