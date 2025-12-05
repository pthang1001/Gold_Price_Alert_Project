const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define('UserRole', {
    id: { type: DataTypes.CHAR(36), primaryKey: true, defaultValue: () => uuidv4() },
    user_id: { type: DataTypes.CHAR(36), allowNull: false },
    role_id: { type: DataTypes.CHAR(36), allowNull: false }
  }, { tableName: 'user_roles', timestamps: false, underscored: true });
};
