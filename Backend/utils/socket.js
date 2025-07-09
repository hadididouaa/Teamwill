const jwt = require('jsonwebtoken');
const { User, Message } = require('../db/models');
const socketIO = require('socket.io');
const cookie = require('cookie');

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    },
    transports: ['websocket', 'polling'] // Ajout du fallback polling
  });

  const onlineUsers = new Map();

  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token;
      
      if (!token) {
        const cookies = cookie.parse(socket.handshake.headers.cookie || '');
        token = cookies.token;
      }

      if (!token) {
        console.error('No token provided');
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'username', 'roleUtilisateur', 'isActive']
      });

      if (!user || !user.isActive) {
        console.error('User not found or inactive');
        return next(new Error('User not found'));
      }

      socket.user = {
        id: user.id,
        username: user.username,
        role: user.roleUtilisateur
      };

      next();
    } catch (error) {
      console.error('Socket auth error:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        socket.emit('session_expired');
      }
      
      next(new Error('Authentication failed'));
    }
  });

   io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} (${socket.id})`);
    
    // Gestion des rooms améliorée
    const userRoom = `user_${socket.user.id}`;
    socket.join(userRoom);
    onlineUsers.set(socket.user.id, socket.user);
    
    console.log(`Rooms after join:`, socket.rooms);
    io.emit('online_users', Array.from(onlineUsers.values()));

    // Événement d'envoi de message optimisé
    socket.on('send_message', async ({ receiverId, content, attachments = [] }) => {
      try {
        console.log(`Sending message from ${socket.user.id} to ${receiverId}`);
        
        const message = await Message.create({
          content,
          senderId: socket.user.id,
          receiverId,
          isRead: false,
          attachments
        });

        const populatedMessage = await Message.findByPk(message.id, {
          include: [
            { model: User, as: 'sender', attributes: ['id', 'username', 'photo', 'roleUtilisateur'] },
            { model: User, as: 'receiver', attributes: ['id', 'username', 'photo', 'roleUtilisateur'] }
          ]
        });

        const messageToSend = {
          ...populatedMessage.toJSON(),
          sender: populatedMessage.sender.toJSON(),
          receiver: populatedMessage.receiver.toJSON(),
          createdAt: populatedMessage.createdAt.toISOString()
        };

        console.log('Emitting to rooms:', `user_${receiverId}`, `user_${socket.user.id}`);
        
        // Émission aux deux parties avec vérification des rooms
        const receiverSocket = io.sockets.adapter.rooms.get(`user_${receiverId}`);
        const senderSocket = io.sockets.adapter.rooms.get(`user_${socket.user.id}`);
        
        console.log('Receiver socket exists:', !!receiverSocket);
        console.log('Sender socket exists:', !!senderSocket);

        io.to(`user_${receiverId}`).emit('new_message', messageToSend);
        io.to(`user_${socket.user.id}`).emit('new_message', messageToSend);
        
        console.log('Message emitted successfully');

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { 
          error: 'Failed to send message',
          details: error.message 
        });
      }
    });

    // Typing indicator
    socket.on('typing', ({ receiverId, isTyping }) => {
      io.to(`user_${receiverId}`).emit('typing_status', {
        userId: socket.user.id,
        username: socket.user.username,
        isTyping
      });
    });

    // Read receipt
    socket.on('mark_read', async ({ messageId }) => {
      try {
        const message = await Message.findByPk(messageId);
        
        if (message && message.receiverId === socket.user.id) {
          await message.update({ isRead: true });
          
          io.to(`user_${message.senderId}`).emit('message_read', {
            messageId,
            readerId: socket.user.id
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Message deletion
    socket.on('delete_message', async ({ messageId }) => {
      try {
        const message = await Message.findByPk(messageId);
        
        if (message && 
            (message.senderId === socket.user.id || 
             message.receiverId === socket.user.id)) {
          
          const otherUserId = message.senderId === socket.user.id 
            ? message.receiverId 
            : message.senderId;
            
          await message.destroy();
          
          io.to(`user_${otherUserId}`).emit('message_deleted', { messageId });
          io.to(`user_${socket.user.id}`).emit('message_deleted', { messageId });
        }
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    });

    // Gestion de la déconnexion
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
      onlineUsers.delete(socket.user.id);
      io.emit('online_users', Array.from(onlineUsers.values()));
    });
  });

  return io;
};

module.exports = initializeSocket;