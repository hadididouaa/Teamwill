'use strict';
module.exports = (sequelize, DataTypes) => {
  const Evaluation = sequelize.define('Evaluation', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    questionnaireId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    totalScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  Evaluation.associate = function(models) {
    Evaluation.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Evaluation.belongsTo(models.Questionnaire, {
      foreignKey: 'questionnaireId',
      as: 'questionnaire'
    });
    Evaluation.hasMany(models.UserResponse, {
      foreignKey: 'evaluationId',
      as: 'responses',
      onDelete: 'CASCADE'
    });
  };

  return Evaluation;
};