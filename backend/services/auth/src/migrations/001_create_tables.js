/**
 * Migration: Create Auth Service Tables
 * Database: auth_db
 */

module.exports = {
  up: async (sequelize) => {
    const { DataTypes } = require('sequelize');
    const queryInterface = sequelize.getQueryInterface();

    // Users table
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'inactive'
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true
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

    // Roles table
    await queryInterface.createTable('roles', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // User Roles join table
    await queryInterface.createTable('user_roles', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      role_id: {
        type: DataTypes.UUID,
        references: { model: 'roles', key: 'id' },
        onDelete: 'CASCADE'
      },
      assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // Permissions table
    await queryInterface.createTable('permissions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // Role Permissions join table
    await queryInterface.createTable('role_permissions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      role_id: {
        type: DataTypes.UUID,
        references: { model: 'roles', key: 'id' },
        onDelete: 'CASCADE'
      },
      permission_id: {
        type: DataTypes.UUID,
        references: { model: 'permissions', key: 'id' },
        onDelete: 'CASCADE'
      }
    });

    // Sessions table
    await queryInterface.createTable('sessions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
      },
      device_info: {
        type: DataTypes.JSON,
        allowNull: true
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // OTP Codes table
    await queryInterface.createTable('otp_codes', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('email_verification', 'password_reset', 'login'),
        allowNull: false
      },
      attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      max_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 5
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      verified_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // 2FA Secrets table
    await queryInterface.createTable('twofa_secrets', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      secret: {
        type: DataTypes.STRING,
        allowNull: false
      },
      backup_codes: {
        type: DataTypes.JSON,
        allowNull: true
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // Create indices
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('sessions', ['user_id']);
    await queryInterface.addIndex('sessions', ['refresh_token']);
    await queryInterface.addIndex('otp_codes', ['user_id']);
    await queryInterface.addIndex('otp_codes', ['email']);
  },

  down: async (sequelize) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable('twofa_secrets', { cascade: true });
    await queryInterface.dropTable('otp_codes', { cascade: true });
    await queryInterface.dropTable('sessions', { cascade: true });
    await queryInterface.dropTable('role_permissions', { cascade: true });
    await queryInterface.dropTable('permissions', { cascade: true });
    await queryInterface.dropTable('user_roles', { cascade: true });
    await queryInterface.dropTable('roles', { cascade: true });
    await queryInterface.dropTable('users', { cascade: true });
  }
};
