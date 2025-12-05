/**
 * Setup script: Initialize database with tables and seed data
 */

const { initDatabase } = require('./init-db');
const logger = require('../middleware/logger');

const setup = async () => {
  try {
    console.log('🔧 Starting database setup...');
    
    const db = await initDatabase();
    
    const Role = db.models.Role;
    const Permission = db.models.Permission;
    
    // Create default roles
    const roles = [
      { name: 'Super Admin', description: 'Full system access' },
      { name: 'Admin', description: 'User and config management' },
      { name: 'User', description: 'Regular user' },
      { name: 'Moderator', description: 'Content moderation' }
    ];

    for (const roleData of roles) {
      const [role] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });
      console.log(`✅ Role created/updated: ${role.name}`);
    }

    // Create default permissions
    const permissions = [
      { name: 'user:create', description: 'Create users' },
      { name: 'user:read', description: 'Read users' },
      { name: 'user:update', description: 'Update users' },
      { name: 'user:delete', description: 'Delete users' },
      { name: 'admin:read', description: 'Access admin panel' },
      { name: 'admin:write', description: 'Modify settings' }
    ];

    for (const permData of permissions) {
      const [perm] = await Permission.findOrCreate({
        where: { name: permData.name },
        defaults: permData
      });
      console.log(`✅ Permission created/updated: ${perm.name}`);
    }

    console.log('✅ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Setup failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

setup();
