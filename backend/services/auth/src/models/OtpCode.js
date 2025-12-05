const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OtpCode = sequelize.define('OtpCode', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true
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
    }
  }, {
    tableName: 'otp_codes',
    timestamps: true,
    underscored: true
  });

  return OtpCode;
};
