/**
 * Migration: Create User Service Tables
 * Database: user_db
 */

module.exports = {
  up: async (sequelize) => {
    const { DataTypes } = require('sequelize');
    const queryInterface = sequelize.getQueryInterface();

    // User Profiles table
    await queryInterface.createTable('user_profiles', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        comment: 'Reference to auth_db.users.id'
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      avatar_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true
      },
      postal_code: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phone_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // User Preferences table
    await queryInterface.createTable('user_preferences', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
      },
      theme: {
        type: DataTypes.ENUM('light', 'dark', 'auto'),
        defaultValue: 'auto'
      },
      language: {
        type: DataTypes.STRING,
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
      in_app_notifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      notification_frequency: {
        type: DataTypes.ENUM('immediately', 'hourly', 'daily', 'weekly'),
        defaultValue: 'immediately'
      },
      marketing_emails: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // Deleted Users table (GDPR compliance)
    await queryInterface.createTable('deleted_users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true
      },
      grace_period_ends_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      permanently_deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      deleted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // Create indices
    await queryInterface.addIndex('user_profiles', ['user_id']);
    await queryInterface.addIndex('user_preferences', ['user_id']);
    await queryInterface.addIndex('deleted_users', ['user_id']);
    await queryInterface.addIndex('deleted_users', ['email']);
  },

  down: async (sequelize) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable('deleted_users', { cascade: true });
    await queryInterface.dropTable('user_preferences', { cascade: true });
    await queryInterface.dropTable('user_profiles', { cascade: true });
  }
};
