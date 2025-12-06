const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define('UserPreferences', {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      unique: true
    },
    theme: {
      type: DataTypes.ENUM('light', 'dark'),
      defaultValue: 'light'
    },
    language: {
      type: DataTypes.STRING(10),
      defaultValue: 'en'
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC'
    },
    email_notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    push_notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notification_frequency: {
      type: DataTypes.ENUM('instant', 'hourly', 'daily', 'weekly'),
      defaultValue: 'daily'
    }
  }, {
    tableName: 'user_preferences',
    timestamps: true,
    underscored: true
  });
};
