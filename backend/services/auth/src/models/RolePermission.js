const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define('RolePermission', {
    id: { type: DataTypes.CHAR(36), primaryKey: true, defaultValue: () => uuidv4() },
    role_id: { type: DataTypes.CHAR(36), allowNull: false },
    permission_id: { type: DataTypes.CHAR(36), allowNull: false }
  }, { tableName: 'role_permissions', timestamps: false, underscored: true });
};
