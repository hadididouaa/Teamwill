// backend/routes/questionnaireRoute.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../utils/authMiddleware');
const {
  createQuestionnaire,
  getAllQuestionnaires,
  getQuestionnaireById,
  updateQuestionnaire,
  deleteQuestionnaire,
  toggleQuestionnaireActivation,submitQuestionnaireResponse,getAllQuestionnaireResults,getUserResults
} = require('../controllers/questionnaireController');

// Routes pour les questionnaires
router.post('/', authenticateToken, createQuestionnaire);
router.get('/', authenticateToken, getAllQuestionnaires);
router.get('/:id', authenticateToken, getQuestionnaireById);
router.put('/:id', authenticateToken, updateQuestionnaire);
router.delete('/:id', authenticateToken, deleteQuestionnaire);
router.patch('/:id/toggle', authenticateToken, toggleQuestionnaireActivation);
router.post('/:id/responses', authenticateToken, submitQuestionnaireResponse);
// N'oubliez pas d'ajouter la route dans votre questionnaireRouter.js
router.get('/results/all', authenticateToken, getAllQuestionnaireResults);
// Nouvelle route pour les résultats par utilisateur
router.get('/results/user', authenticateToken, getUserResults);

module.exports = router;