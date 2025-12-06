/**
 * Database singleton - routes requests to global.userDb
 * The actual initialization happens in init-db.js via startServer()
 */

module.exports = {
  get models() {
    if (!global.userDb) {
      throw new Error('Database not initialized. Call initDatabase() from init-db.js first');
    }
    return global.userDb.models;
  },
  
  get sequelize() {
    if (!global.userDb) {
      throw new Error('Database not initialized');
    }
    return global.userDb;
  },

  // For direct access
  getDb() {
    return global.userDb;
  }
};
