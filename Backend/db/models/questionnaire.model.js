'use strict';
module.exports = (sequelize, DataTypes) => {
  const Questionnaire = sequelize.define('Questionnaire', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    paranoid: true
  });

  Questionnaire.associate = function(models) {
    Questionnaire.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    Questionnaire.hasMany(models.Question, {
      foreignKey: 'questionnaireId',
      as: 'questions',
      onDelete: 'CASCADE'
    });
    Questionnaire.hasMany(models.PsychologicalAnalysis, {
      foreignKey: 'questionnaireId',
      as: 'analyses',
      onDelete: 'CASCADE'
    });
  };

  return Questionnaire;
};