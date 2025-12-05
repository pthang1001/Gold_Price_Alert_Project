/**
 * Database initialization and model setup
 */

const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('../middleware/logger');

let sequelize = null;

const initDatabase = async () => {
  try {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'auth_db',
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
    const User = require('../models/User')(sequelize);
    const OtpCode = require('../models/OtpCode')(sequelize);
    const Session = require('../models/Session')(sequelize);
    const Role = require('../models/Role')(sequelize);
    const Permission = require('../models/Permission')(sequelize);
    const UserRole = require('../models/UserRole')(sequelize);
    const RolePermission = require('../models/RolePermission')(sequelize);
    const TwoFASecret = require('../models/TwoFASecret')(sequelize);

    // Define associations
    User.hasMany(OtpCode, { foreignKey: 'user_id' });
    OtpCode.belongsTo(User, { foreignKey: 'user_id' });

    User.hasMany(Session, { foreignKey: 'user_id' });
    Session.belongsTo(User, { foreignKey: 'user_id' });

    User.hasMany(UserRole, { foreignKey: 'user_id' });
    UserRole.belongsTo(User, { foreignKey: 'user_id' });

    Role.hasMany(UserRole, { foreignKey: 'role_id' });
    UserRole.belongsTo(Role, { foreignKey: 'role_id' });

    Role.hasMany(RolePermission, { foreignKey: 'role_id' });
    RolePermission.belongsTo(Role, { foreignKey: 'role_id' });

    Permission.hasMany(RolePermission, { foreignKey: 'permission_id' });
    RolePermission.belongsTo(Permission, { foreignKey: 'permission_id' });

    User.hasOne(TwoFASecret, { foreignKey: 'user_id' });
    TwoFASecret.belongsTo(User, { foreignKey: 'user_id' });

    // Store models in sequelize instance
    sequelize.models.User = User;
    sequelize.models.OtpCode = OtpCode;
    sequelize.models.Session = Session;
    sequelize.models.Role = Role;
    sequelize.models.Permission = Permission;
    sequelize.models.UserRole = UserRole;
    sequelize.models.RolePermission = RolePermission;
    sequelize.models.TwoFASecret = TwoFASecret;

    // Run migrations
    await sequelize.sync({ alter: true }); // Auto-sync models with database
    logger.info('✅ Database migrations completed');
    
    // Insert default roles if not exist
    const roles = ['Super Admin', 'Admin', 'User', 'Moderator'];
    for (const roleName of roles) {
      await Role.findOrCreate({
        where: { name: roleName },
        defaults: { description: `${roleName} role` }
      });
    }
    logger.info('✅ Default roles created');

    // Expose to global for services
    global.db = sequelize;

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
