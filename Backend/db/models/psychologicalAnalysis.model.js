'use strict';
module.exports = (sequelize, DataTypes) => {
  const PsychologicalAnalysis = sequelize.define('PsychologicalAnalysis', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    questionnaireId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    minScore: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    maxScore: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    recommendations: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  PsychologicalAnalysis.associate = function(models) {
    PsychologicalAnalysis.belongsTo(models.Questionnaire, {
      foreignKey: 'questionnaireId',
      as: 'questionnaire'
    });
  };

  return PsychologicalAnalysis;
};