-- Gold Prices Table
CREATE TABLE IF NOT EXISTS gold_prices (
  id SERIAL PRIMARY KEY,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  source VARCHAR(50) DEFAULT 'metals.live',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Price History Table
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  gold_price_id INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  recorded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gold_price_id) REFERENCES gold_prices(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_gold_prices_timestamp ON gold_prices(timestamp);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at);
CREATE INDEX idx_price_history_gold_price_id ON price_history(gold_price_id);
