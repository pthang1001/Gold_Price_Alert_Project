const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('RolePermission', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    role_id: { type: DataTypes.UUID, allowNull: false },
    permission_id: { type: DataTypes.UUID, allowNull: false }
  }, { tableName: 'role_permissions', timestamps: false, underscored: true });
};
