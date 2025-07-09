const express = require('express');
const router = express.Router();
const { sendChatMessage } = require('../controllers/chatController');
const authenticateToken = require('../utils/authMiddleware');

// Handle OPTIONS preflight request without authentication
router.options('/', (req, res) => {
  res.status(200).end(); // Respond to OPTIONS requests immediately
});

// Apply authentication only to POST requests
router.post('/', sendChatMessage);

module.exports = router;