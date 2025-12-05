const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { initDatabase } = require('./config/init-db');

dotenv.config();

const app = express();

// Initialize database
let db = null;
initDatabase().then(database => {
  db = database;
  console.log('✅ Database initialized');
}).catch(error => {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
});

// Make db available globally
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    service: process.env.SERVICE_NAME,
    timestamp: new Date()
  });
});

// Routes
app.use('/auth', require('./routes/auth'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ ${process.env.SERVICE_NAME} running on port ${PORT}`);
});

module.exports = app;
