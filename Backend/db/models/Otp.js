module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define('Otp', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    secret: {
      type: DataTypes.STRING,  // base32 secret for TOTP
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'Otps',
    timestamps: false,
  });



  return Otp;
};