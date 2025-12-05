const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('TwoFASecret', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    secret: { type: DataTypes.STRING, allowNull: false },
    backup_codes: { type: DataTypes.JSON, allowNull: true },
    enabled: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, { tableName: 'twofa_secrets', timestamps: true, underscored: true });
};
