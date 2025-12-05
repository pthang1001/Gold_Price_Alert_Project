const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { initDatabase } = require('./config/init-db');

dotenv.config();

const app = express();

// Initialize database and start server
let db = null;

const startServer = async () => {
  try {
    // Initialize database first
    db = await initDatabase();
    console.log('✅ Database initialized');
    global.db = db;

    // Make db available via middleware
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

    // Test route
    app.get('/test', (req, res) => {
      res.json({ message: 'Test OK' });
    });

    // Routes
    try {
      const authRoutes = require('./routes/auth');
      app.use('/auth', authRoutes);
      console.log('✅ Auth routes loaded');
    } catch (err) {
      console.error('❌ Failed to load auth routes:', err.message);
    }

    // Error handling
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ 
        success: false,
        message: err.message || 'Internal Server Error',
        timestamp: new Date()
      });
    });

    return true;
  } catch (error) {
    console.error('❌ Initialization error:', error);
    throw error;
  }
};

const PORT = process.env.PORT || 3001;
startServer().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ ${process.env.SERVICE_NAME} running on port ${PORT}`);
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
