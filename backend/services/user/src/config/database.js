/**
 * Database singleton - gets global.userDb
 */

function getDb() {
  if (!global.userDb) {
    throw new Error('Database not initialized. Call initDatabase() from init-db.js first');
  }
  return global.userDb;
}

module.exports = {
  get models() {
    return getDb().models;
  },
  
  getDb: getDb,
  
  // Support direct access like db.sequelize
  get sequelize() {
    return getDb();
  }
};
