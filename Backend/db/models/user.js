'use strict';
const { USER_ROLES } = require('../constants/roles');
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true, 
      validate: { isEmail: true } 
    },
    mdp: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [6, 255] },
    },
    roleUtilisateur: {
      type: DataTypes.ENUM(...USER_ROLES),
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    defaultMdp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mustUpdatePassword: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    derConnx: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
    freezeTableName: true,
    tableName: 'Users',
  });

  
  return User;
};

