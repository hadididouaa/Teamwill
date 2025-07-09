'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserResponse = sequelize.define('UserResponse', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    evaluationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    answerOptionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  UserResponse.associate = function(models) {
    UserResponse.belongsTo(models.Evaluation, {
      foreignKey: 'evaluationId',
      as: 'evaluation'
    });
    UserResponse.belongsTo(models.Question, {
      foreignKey: 'questionId',
      as: 'question'
    });
    UserResponse.belongsTo(models.AnswerOption, {
      foreignKey: 'answerOptionId',
      as: 'selectedOption'
    });
  };

  return UserResponse;
};