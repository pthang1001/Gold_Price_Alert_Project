const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define('TwoFASecret', {
    id: { type: DataTypes.CHAR(36), primaryKey: true, defaultValue: () => uuidv4() },
    user_id: { type: DataTypes.CHAR(36), allowNull: false },
    secret: { type: DataTypes.STRING, allowNull: false },
    backup_codes: { type: DataTypes.JSON, allowNull: true },
    enabled: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, { tableName: 'twofa_secrets', timestamps: true, underscored: true });
};
