// Ajoutez en haut du fichier :
const db = require('../db/models'); // Import des modèles
const sequelize = db.sequelize; // Import de l'instance Sequelize
const { Op } = require('sequelize'); // Ajoutez ceci en haut du fichier

// Helper function to check permissions
const checkPermissions = (user) => {
  return ['Psychologue', 'RH', 'Admin','Collaborateur'].includes(user.roleUtilisateur);
};

// Create a new questionnaire with questions and answer options
const createQuestionnaire = async (req, res) => {
  const { title, description, questions, analyses } = req.body; // Ajout de analyses
  
  try {
    if (!checkPermissions(req.user)) {
      return res.status(403).json({ message: 'Permission refusée.' });
    }

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Titre et questions sont requis.' });
    }

    // Validation des analyses si fournies
    if (analyses && (!Array.isArray(analyses) || analyses.length !== 3)) {
      return res.status(400).json({ message: 'Trois analyses sont requises.' });
    }

    const result = await sequelize.transaction(async (t) => {
      const questionnaire = await db.Questionnaire.create({
        title,
        description,
        createdBy: req.user.id,
        isActive: true
      }, { transaction: t });

      // Création des questions
      for (const questionData of questions) {
        if (!questionData.text || !questionData.options || !Array.isArray(questionData.options)) {
          throw new Error('Chaque question doit avoir un texte et des options.');
        }

        const question = await db.Question.create({
          questionnaireId: questionnaire.id,
          text: questionData.text,
          order: questionData.order || 0
        }, { transaction: t });

        // Création des options
        for (const optionData of questionData.options) {
          if (!optionData.text || optionData.score === undefined) {
            throw new Error('Chaque option doit avoir un texte et un score.');
          }
          
          await db.AnswerOption.create({
            questionId: question.id,
            text: optionData.text,
            score: optionData.score,
            order: optionData.order || 0
          }, { transaction: t });
        }
      }

      // Création des analyses psychologiques
      if (analyses) {
        for (const analysis of analyses) {
          if (!analysis.title || !analysis.description || analysis.minScore === undefined || analysis.maxScore === undefined) {
            throw new Error('Chaque analyse doit avoir un titre, une description et des scores min/max.');
          }
          
          await db.PsychologicalAnalysis.create({
            questionnaireId: questionnaire.id,
            title: analysis.title,
            description: analysis.description,
            recommendations: analysis.recommendations,
            minScore: analysis.minScore,
            maxScore: analysis.maxScore
          }, { transaction: t });
        }
      }

      return questionnaire;
    });

    // Récupération complète avec relations
    const fullQuestionnaire = await db.Questionnaire.findByPk(result.id, {
      include: [
        {
          model: db.Question,
          as: 'questions',
          include: [{
            model: db.AnswerOption,
            as: 'options'
          }]
        },
        {
          model: db.PsychologicalAnalysis,
          as: 'analyses'
        }
      ]
    });

    res.status(201).json(fullQuestionnaire);
  } catch (error) {
    console.error('Error creating questionnaire:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création du questionnaire',
      error: error.message,
      stack: error.stack // Pour le débogage
    });
  }
};

const getAllQuestionnaires = async (req, res) => {
  try {
    if (!checkPermissions(req.user)) {
      return res.status(403).json({ message: 'Permission refusée.' });
    }

    const questionnaires = await db.Questionnaire.findAll({
      include: [
        {
          model: db.Question,
          as: 'questions',
          include: [{
            model: db.AnswerOption,
            as: 'options'
          }]
        },
        {
          model: db.PsychologicalAnalysis,
          as: 'analyses'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(questionnaires);
  } catch (error) {
    console.error('Error fetching questionnaires:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const getQuestionnaireById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!checkPermissions(req.user)) {
      return res.status(403).json({ message: 'Permission refusée.' });
    }

    const questionnaire = await db.Questionnaire.findByPk(id, {
      include: [
        {
          model: db.Question,
          as: 'questions',
          include: [{
            model: db.AnswerOption,
            as: 'options'
          }]
        },
        {
          model: db.PsychologicalAnalysis,
          as: 'analyses' // Inclusion des analyses
        }
      ],
      order: [
        [{ model: db.Question, as: 'questions' }, 'order', 'ASC'],
        [{ model: db.Question, as: 'questions' }, { model: db.AnswerOption, as: 'options' }, 'order', 'ASC']
      ]
    });

    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire non trouvé' });
    }

    res.status(200).json(questionnaire);
  } catch (error) {
    console.error('Error fetching questionnaire:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du questionnaire',
      error: error.message 
    });
  }
};

// Update a questionnaire
const updateQuestionnaire = async (req, res) => {
  const { id } = req.params;
  const { title, description, questions, isActive } = req.body;

  try {
    // Check permissions
    if (!checkPermissions(req.user)) {
      return res.status(403).json({ message: 'Permission refusée.' });
    }

    // Find questionnaire
    const questionnaire = await db.Questionnaire.findByPk(id);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire non trouvé' });
    }

    // Use transaction for data consistency
    await sequelize.transaction(async (t) => {
      // Update basic fields
      questionnaire.title = title || questionnaire.title;
      questionnaire.description = description || questionnaire.description;
      if (isActive !== undefined) questionnaire.isActive = isActive;
      await questionnaire.save({ transaction: t });

      // Update questions if provided
      if (questions && Array.isArray(questions)) {
        // Delete existing questions (cascade will delete options)
        await db.Question.destroy({ 
          where: { questionnaireId: questionnaire.id },
          transaction: t 
        });

        // Create new questions and options
        for (const questionData of questions) {
          const question = await db.Question.create({
            questionnaireId: questionnaire.id,
            text: questionData.text,
            order: questionData.order || 0
          }, { transaction: t });

          for (const optionData of questionData.options) {
            await db.AnswerOption.create({
              questionId: question.id,
              text: optionData.text,
              score: optionData.score,
              order: optionData.order || 0
            }, { transaction: t });
          }
        }
      }
    });

    // Fetch updated questionnaire with relations
    const updatedQuestionnaire = await db.Questionnaire.findByPk(id, {
      include: [{
        model: db.Question,
        as: 'questions',
        include: [{
          model: db.AnswerOption,
          as: 'options'
        }]
      }]
    });

    res.status(200).json(updatedQuestionnaire);
  } catch (error) {
    console.error('Error updating questionnaire:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du questionnaire',
      error: error.message 
    });
  }
};

// Delete a questionnaire
const deleteQuestionnaire = async (req, res) => {
  const { id } = req.params;

  try {
    // Check permissions
    if (!checkPermissions(req.user)) {
      return res.status(403).json({ message: 'Permission refusée.' });
    }

    const questionnaire = await db.Questionnaire.findByPk(id);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire non trouvé' });
    }

    // Use transaction for data consistency
    await sequelize.transaction(async (t) => {
      await questionnaire.destroy({ transaction: t });
    });

    res.status(200).json({ message: 'Questionnaire supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting questionnaire:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression du questionnaire',
      error: error.message 
    });
  }
};

// Toggle questionnaire activation status
// In questionnaireController.js
const toggleQuestionnaireActivation = async (req, res) => {
  const { id } = req.params;

  try {
    if (!checkPermissions(req.user)) {
      return res.status(403).json({ message: 'Permission refusée.' });
    }

    const questionnaire = await db.Questionnaire.findByPk(id);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire non trouvé' });
    }

    questionnaire.isActive = !questionnaire.isActive;
    await questionnaire.save();

    res.status(200).json({ 
      message: `Questionnaire ${questionnaire.isActive ? 'activé' : 'désactivé'}`,
      isActive: questionnaire.isActive
    });
  } catch (error) {
    console.error('Error toggling questionnaire activation:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la modification du statut du questionnaire',
      error: error.message 
    });
  }
};
const submitQuestionnaireResponse = async (req, res) => {
  const { id: questionnaireId } = req.params;
  const { answers } = req.body;
  const userId = req.user.id;

  try {
    // Vérification du questionnaire
    const questionnaire = await db.Questionnaire.findOne({
      where: { id: questionnaireId, isActive: true },
      include: [{
        model: db.Question,
        as: 'questions',
        include: [{
          model: db.AnswerOption,
          as: 'options'
        }]
      }]
    });

    if (!questionnaire) {
      return res.status(404).json({ 
        success: false,
        message: 'Questionnaire non trouvé ou inactif' 
      });
    }

    // Validation des réponses
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Format des réponses invalide'
      });
    }

    let totalScore = 0;
    const responseRecords = [];

    // Validation de chaque réponse
    for (const question of questionnaire.questions) {
      const selectedOptionId = answers[question.id];
      
      if (!selectedOptionId) {
        return res.status(400).json({ 
          success: false,
          message: `Réponse manquante pour la question ${question.id}` 
        });
      }

      const selectedOption = question.options.find(opt => opt.id == selectedOptionId);
      
      if (!selectedOption) {
        return res.status(400).json({ 
          success: false,
          message: `Option invalide pour la question ${question.id}` 
        });
      }

      totalScore += selectedOption.score;
      responseRecords.push({
        questionId: question.id,
        answerOptionId: selectedOption.id
      });
    }

    // Enregistrement transactionnel
    const evaluation = await sequelize.transaction(async (t) => {
      // First create the evaluation record
      const evaluation = await db.Evaluation.create({
        userId,
        questionnaireId,
        completed: true,
        totalScore
      }, { transaction: t });

      // Then create user responses linked to the evaluation
      const responsesWithEvaluationId = responseRecords.map(r => ({
        ...r,
        evaluationId: evaluation.id
      }));

      await db.UserResponse.bulkCreate(responsesWithEvaluationId, { transaction: t });

      return evaluation;
    });

    // Recherche de l'analyse correspondante
    const analysis = await db.PsychologicalAnalysis.findOne({
      where: {
        questionnaireId,
        minScore: { [Op.lte]: totalScore },
        maxScore: { [Op.gte]: totalScore }
      }
    });

    res.status(201).json({
      success: true,
      totalScore,
      analysis: analysis || null
    });

  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la soumission des réponses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getAllQuestionnaireResults = async (req, res) => {
  try {
    // Vérification des permissions
    if (!['Admin', 'Psychologue', 'RH'].includes(req.user.roleUtilisateur)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Récupération des évaluations avec les relations de base
    const evaluations = await db.Evaluation.findAll({
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'roleUtilisateur']
        },
        {
          model: db.Questionnaire,
          as: 'questionnaire',
          attributes: ['id', 'title']
        },
        {
          model: db.UserResponse,
          as: 'responses',
          include: [
            {
              model: db.Question,
              as: 'question',
              attributes: ['id', 'text']
            },
            {
              model: db.AnswerOption,
              as: 'selectedOption',
              attributes: ['id', 'text', 'score']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Récupération des analyses en une seule requête
    const analyses = await db.PsychologicalAnalysis.findAll({
      where: {
        questionnaireId: evaluations.map(e => e.questionnaireId)
      }
    });

    // Formatage des résultats
    const formattedResults = evaluations.map(evaluation => {
      const analysis = analyses.find(a => 
        a.questionnaireId === evaluation.questionnaireId &&
        evaluation.totalScore >= a.minScore && 
        evaluation.totalScore <= a.maxScore
      );

      return {
        id: evaluation.id,
        user: evaluation.user,
        questionnaire: evaluation.questionnaire,
        completedAt: evaluation.createdAt,
        totalScore: evaluation.totalScore,
        responses: evaluation.responses.map(response => ({
          question: response.question.text,
          answer: response.selectedOption.text,
          score: response.selectedOption.score
        })),
        analysis: analysis ? {
          title: analysis.title,
          description: analysis.description,
          recommendations: analysis.recommendations
        } : null
      };
    });

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error('Error fetching results:', {
      message: error.message,
      stack: error.stack,
      original: error.original
    });
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des résultats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
const getUserResults = async (req, res) => {
  try {
    const targetUserId = req.user.id;

    // Get evaluations with all necessary associations
    const evaluations = await db.Evaluation.findAll({
      where: { userId: targetUserId },
      include: [
        {
          model: db.Questionnaire,
          as: 'questionnaire',
          attributes: ['id', 'title', 'description']
        },
        {
          model: db.UserResponse,
          as: 'responses',
          include: [
            {
              model: db.Question,
              as: 'question',
              attributes: ['id', 'text']
            },
            {
              model: db.AnswerOption,
              as: 'selectedOption',
              attributes: ['id', 'text', 'score']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get all possible analyses for these questionnaires
    const analyses = await db.PsychologicalAnalysis.findAll({
      where: {
        questionnaireId: evaluations.map(e => e.questionnaireId)
      }
    });

    // Format the response
    const formattedResults = evaluations.map(evaluation => {
      const analysis = analyses.find(a => 
        a.questionnaireId === evaluation.questionnaireId &&
        evaluation.totalScore >= a.minScore && 
        evaluation.totalScore <= a.maxScore
      );

      return {
        id: evaluation.id,
        questionnaire: {
          id: evaluation.questionnaire.id,
          title: evaluation.questionnaire.title,
          description: evaluation.questionnaire.description
        },
        completedAt: evaluation.createdAt,
        totalScore: evaluation.totalScore,
        responses: evaluation.responses.map(response => ({
          questionId: response.question.id,
          question: response.question.text,
          answer: response.selectedOption.text,
          score: response.selectedOption.score
        })),
        analysis: analysis ? {
          title: analysis.title,
          description: analysis.description,
          recommendations: analysis.recommendations
        } : null
      };
    });

    res.status(200).json(formattedResults);

  } catch (error) {
    console.error('Error fetching user results:', error);
    res.status(500).json({ 
      message: 'Failed to fetch user results',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
module.exports = {
  createQuestionnaire,
  getAllQuestionnaires,
  getQuestionnaireById,
  updateQuestionnaire,
  deleteQuestionnaire,
  toggleQuestionnaireActivation,submitQuestionnaireResponse,getAllQuestionnaireResults,getUserResults,
};