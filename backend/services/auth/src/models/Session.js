const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define('Session', {
    id: { type: DataTypes.CHAR(36), primaryKey: true, defaultValue: () => uuidv4() },
    user_id: { type: DataTypes.CHAR(36), allowNull: false },
    refresh_token: { type: DataTypes.STRING(512), allowNull: false, unique: true },
    device_info: { type: DataTypes.JSON, allowNull: true },
    ip_address: { type: DataTypes.STRING, allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: false }
  }, { tableName: 'sessions', timestamps: true, underscored: true });
};
