const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Role', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true }
  }, { tableName: 'roles', timestamps: true, underscored: true });
};
