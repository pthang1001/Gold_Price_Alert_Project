/**
 * Database initialization for User Service
 */

const { Sequelize } = require('sequelize');
const logger = require('../middleware/logger');

let sequelize = null;

const initDatabase = async () => {
  try {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'user_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '123456',
      {
        host: process.env.DB_HOST || 'mysql',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

    // Test connection
    await sequelize.authenticate();
    logger.info('✅ Database connection successful');

    // Load models
    const UserProfile = require('../models/UserProfile')(sequelize);
    const UserPreferences = require('../models/UserPreferences')(sequelize);

    // Store models
    sequelize.models.UserProfile = UserProfile;
    sequelize.models.UserPreferences = UserPreferences;
    sequelize.models.UserPreference = UserPreferences; // Alias for backwards compatibility

    // Run migrations
    await sequelize.sync({ alter: true });
    logger.info('✅ Database migrations completed');

    // Expose to global for services
    global.userDb = sequelize;

    return sequelize;
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  initDatabase,
  getSequelize: () => sequelize
};
