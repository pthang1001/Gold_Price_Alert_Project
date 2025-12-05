const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Permission', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true }
  }, { tableName: 'permissions', timestamps: true, underscored: true });
};
