'use strict';
module.exports = (sequelize, DataTypes) => {
  const AnswerOption = sequelize.define('AnswerOption', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  AnswerOption.associate = function(models) {
    AnswerOption.belongsTo(models.Question, {
      foreignKey: 'questionId',
      as: 'question'
    });
  };

  return AnswerOption;
};