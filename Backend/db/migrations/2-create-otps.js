'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Otps', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: true
      },
      secret: {
        type: Sequelize.STRING,  // Add secret to store the OTP secret (base32)
        allowNull: true,
      },
      verified: {
        type: Sequelize.BOOLEAN,  // Add verified flag to track OTP verification status
        defaultValue: false,  // Default to false when a new OTP is created
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Otps');
  }
};