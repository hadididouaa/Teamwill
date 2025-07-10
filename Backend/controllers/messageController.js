const { Message, User } = require('../db/models');
const { Op } = require('sequelize');


const handleMessageAttachments = async (req, res, next) => {
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');

  const uploadDir = path.join(__dirname, '..', 'public', 'message_attachments');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      cb(null, true);
    }
  }).array('attachments', 5);

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ 
        message: 'Erreur de téléchargement', 
        error: err.message 
      });
    }
    next();
  });
};
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    const io = req.app.get('io'); 

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Destinataire non trouvé" });
    }
      
    const messageData = {
      content: content || '',
      senderId,
      receiverId,
      isRead: false,
      attachments: []
    };

    if (req.files && req.files.length > 0) {
      messageData.attachments = req.files.map(file => ({
        filename: file.originalname,
        path: `/message_attachments/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
      }));
    }

    const message = await Message.create(messageData);

    const populatedMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender' },
        { model: User, as: 'receiver' }
      ]
    });

    // Émettre via socket.io
    io.to(`user_${receiverId}`).emit('new_message', populatedMessage.toJSON());
    io.to(`user_${senderId}`).emit('new_message', populatedMessage.toJSON());

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'photo', 'roleUtilisateur'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'photo', 'roleUtilisateur'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;

    const otherUser = await User.findByPk(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = await User.findByPk(userId);
    const validCombination = 
      (user.roleUtilisateur === 'Collaborateur' && otherUser.roleUtilisateur === 'Psychologue') ||
      (user.roleUtilisateur === 'Psychologue' && otherUser.roleUtilisateur === 'Collaborateur');
    
    if (!validCombination) {
      return res.status(403).json({ 
        message: "Conversation autorisée uniquement entre collaborateurs et psychologues" 
      });
    }

    let messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'photo', 'roleUtilisateur'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'photo', 'roleUtilisateur'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    await Message.update(
      { isRead: true },
      { 
        where: { 
          senderId: otherUserId, 
          receiverId: userId,
          isRead: false 
        } 
      }
    );

  

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
  

    const message = await Message.findByPk(messageId);
    if (!message || message.receiverId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await message.update({ isRead: true });

    // Émission socket déjà gérée par le handler socket.io
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const senderId = req.params.userId;
    
    const [updatedCount] = await Message.update(
      { isRead: true },
      { 
        where: { 
          senderId, 
          receiverId: userId,
          isRead: false 
        } 
      }
    );
    
    if (updatedCount > 0) {
      const io = req.app.get('io');
      io.to(`user_${senderId}`).emit('messages_read', {
        readBy: userId
      });
    }
    
    res.json({ updatedCount });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Dans messageController.js
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findByPk(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (![message.senderId, message.receiverId].includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await message.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getMessageContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      attributes: ['senderId', 'receiverId'],
      raw: true
    });

    const contactIds = [...new Set(
      messages.flatMap(msg => [msg.senderId, msg.receiverId])
    )].filter(id => id !== userId);

    const contacts = await User.findAll({
      where: { 
        id: contactIds,
        isActive: true 
      },
      attributes: ['id', 'username', 'photo', 'roleUtilisateur'],
      order: [['username', 'ASC']]
    });

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const getOnlineUsers = async (req, res) => {
  try {
    const io = req.app.get('io');
    const sockets = await io.fetchSockets();
    
    const onlineUserIds = sockets.map(s => s.userId).filter(id => id !== req.user.id);
    const onlineUsers = await User.findAll({
      where: { 
        id: onlineUserIds,
        isActive: true 
      },
      attributes: ['id', 'username', 'photo', 'roleUtilisateur'],
      raw: true
    });

    res.json(onlineUsers);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const getAllConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    let whereClause = {};
    if (user.roleUtilisateur === 'Collaborateur') {
      whereClause = { roleUtilisateur: 'Psychologue', isActive: true };
    } else if (user.roleUtilisateur === 'Psychologue') {
      whereClause = { roleUtilisateur: 'Collaborateur', isActive: true };
    } else {
      return res.status(403).json({ message: "Rôle non autorisé" });
    }

    const contacts = await User.findAll({
      where: whereClause,
      attributes: ['id', 'username', 'photo', 'roleUtilisateur']
    });

    const conversations = [];
    for (const contact of contacts) {
      const lastMessage = await Message.findOne({
        where: {
          [Op.or]: [
            { senderId: userId, receiverId: contact.id },
            { senderId: contact.id, receiverId: userId }
          ]
        },
        include: [
          { model: User, as: 'sender', attributes: ['id', 'username', 'photo', 'roleUtilisateur'] },
          { model: User, as: 'receiver', attributes: ['id', 'username', 'photo', 'roleUtilisateur'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      const unreadCount = await Message.count({
        where: {
          senderId: contact.id,
          receiverId: userId,
          isRead: false
        }
      });

      conversations.push({
        partner: contact,
        lastMessage,
        unreadCount
      });
    }

    res.json(conversations.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
      return bTime - aTime;
    }));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const getUnreadCountsBySender = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const unreadCounts = await Message.findAll({
      where: {
        receiverId: userId,
        isRead: false
      },
      attributes: [
        'senderId',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['senderId'],
      raw: true
    });
    
    const countsObject = unreadCounts.reduce((acc, item) => {
      acc[item.senderId] = item.count;
      return acc;
    }, {});
    
    res.json({ counts: countsObject });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const getPsychologists = async (req, res) => {
  try {
    const psychologists = await User.findAll({
      where: { 
        roleUtilisateur: 'Psychologue'
      },
      attributes: ['id', 'username', 'email', 'photo', 'tel', 'roleUtilisateur'],
      order: [['username', 'ASC']]
    });
    res.json(psychologists);
  } catch (error) {
    console.error('Error fetching psychologists:', error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const getCollaborators = async (req, res) => {
  try {
    const collaborators = await User.findAll({
      where: { 
        roleUtilisateur: 'Collaborateur'
      },
      attributes: ['id', 'username', 'email', 'photo', 'tel', 'roleUtilisateur'],
      order: [['username', 'ASC']]
    });
    res.json(collaborators);
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = {
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
};