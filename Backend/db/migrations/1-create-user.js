
'use strict';
const { USER_ROLES } = require('../constants/roles'); 
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', { 
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      mdp: {
        type: Sequelize.STRING,
        allowNull: false
      },
      roleUtilisateur: {
        type: Sequelize.ENUM(...USER_ROLES), 
        allowNull: false
      },
      photo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tel: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      defaultMdp: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mustUpdatePassword: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      derConnx: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};

