const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Session', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    refresh_token: { type: DataTypes.TEXT, allowNull: false, unique: true },
    device_info: { type: DataTypes.JSON, allowNull: true },
    ip_address: { type: DataTypes.STRING, allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: false }
  }, { tableName: 'sessions', timestamps: true, underscored: true });
};
