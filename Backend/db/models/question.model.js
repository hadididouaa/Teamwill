'use strict';
module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
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
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  Question.associate = function(models) {
    Question.belongsTo(models.Questionnaire, {
      foreignKey: 'questionnaireId',
      as: 'questionnaire'
    });
    Question.hasMany(models.AnswerOption, {
      foreignKey: 'questionId',
      as: 'options',
      onDelete: 'CASCADE'
    });
  };

  return Question;
};