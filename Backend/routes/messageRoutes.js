const express = require('express');
const router = express.Router();
const authenticateToken = require('../utils/authMiddleware');
const {
     handleMessageAttachments,
  sendMessage,
  getMyMessages,
  getConversation,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteMessage,
  getMessageContacts,
  getOnlineUsers,
  getAllConversations,
  getUnreadCountsBySender,
  getPsychologists,
  getCollaborators
} = require('../controllers/messageController');
const { uploadFile } = require('../utils/multerConfig');

// Routes protégées par verifyToken
router.post('/send', authenticateToken,  handleMessageAttachments, sendMessage);
router.get('/my-messages', authenticateToken, getMyMessages);
router.get('/conversation/:userId', authenticateToken, getConversation);
router.get('/unread-count', authenticateToken, getUnreadCount);
router.put('/mark-read/:messageId', authenticateToken, markAsRead);
router.put('/mark-all-read/:userId', authenticateToken, markAllAsRead);
router.delete('/delete/:messageId', authenticateToken, deleteMessage);
router.get('/contacts', authenticateToken, getMessageContacts);
router.get('/online-users', authenticateToken, getOnlineUsers);
router.get('/conversations', authenticateToken, getAllConversations);
router.get('/unread-counts-by-sender', authenticateToken, getUnreadCountsBySender);
router.get('/psychologists', authenticateToken, getPsychologists);
router.get('/collaborators', authenticateToken, getCollaborators);

module.exports = router;