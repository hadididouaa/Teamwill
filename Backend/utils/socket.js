const { Message, User } = require('../db/models');

const initializeSocket = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  const onlineUsers = new Map();
 const activeCalls = new Map();
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token;
      
      if (!token) {
        const cookies = require('cookie').parse(socket.handshake.headers.cookie || '');
        token = cookies.token;
      }

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findByPk(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error('User not found'));
      }

       socket.user = {
        id: user.id,
        username: user.username,
        role: user.roleUtilisateur,
        photo: user.photo
      };

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    // Rejoindre la room de l'utilisateur
    socket.join(`user_${socket.user.id}`);
    onlineUsers.set(socket.user.id, socket.user);
    io.emit('online_users', Array.from(onlineUsers.values()));

 

// Dans la partie connection, ajoutez/modifiez ces handlers :
socket.on('initiate_video_call', ({ receiverId, callerName, callerPhoto, roomName }) => {
  const callerId = socket.user.id;
  console.log('Received initiate_video_call:', { callerId, receiverId, roomName });

  if (!callerId || !receiverId) {
    console.error('Invalid caller or receiver ID');
    return;
  }
  for (const [_, call] of activeCalls) {
        if (call.callerId === callerId || call.receiverId === callerId) {
          socket.emit('call_error', { message: 'You are already in a call' });
          return;
        }
      }

  activeCalls.set(roomName, {
    callerId,
    receiverId,
    roomName,
    timestamp: new Date(),
  });


  io.to(`user_${receiverId}`).emit('incoming_video_call', {
     callerId,
        callerName: callerName || socket.user.username,
        callerPhoto: callerPhoto || socket.user.photo,
        roomName,
        respondentId: receiverId,
  });

});

// Modifiez le handler 'answer_video_call' comme ceci :
socket.on('answer_video_call', ({ roomName, answer }) => {
  const call = activeCalls.get(roomName);
  if (!call) return;

  // Vérifier que l'utilisateur est bien le destinataire
  if (socket.user.id !== call.receiverId) return;

  // Informer l'appelant de la réponse
  io.to(`user_${call.callerId}`).emit('video_call_answered', {
    answer,
    roomName,
    respondentId: socket.user.id,
    respondentName: socket.user.username
  });

  if (answer) {
    // Les deux utilisateurs rejoignent la room Jitsi
    io.to(`user_${call.callerId}`).emit('join_video_call', { roomName });
    io.to(`user_${call.receiverId}`).emit('join_video_call', { roomName });
  } else {
    // Appel refusé, nettoyage
    activeCalls.delete(roomName);
    io.to(`user_${call.callerId}`).emit('call_declined', { roomName });
  }
});

socket.on('end_video_call', ({ roomName }) => {
  const call = activeCalls.get(roomName);
  if (!call) return;

  // Informer l'autre participant
  const otherUserId = call.callerId === socket.user.id ? call.receiverId : call.callerId;
  io.to(`user_${otherUserId}`).emit('video_call_ended', { roomName });

  // Nettoyer
  activeCalls.delete(roomName);
});


  
    

    onlineUsers.set(socket.user.id, socket.user);
    io.emit('online_users', Array.from(onlineUsers.values()));

    // Gestion des messages
    socket.on('send_message', async ({ receiverId, content, attachments = [] }) => {
      try {
        const message = await Message.create({
          content,
          senderId: socket.user.id,
          receiverId,
          isRead: false,
          attachments
        });

        const populatedMessage = await Message.findByPk(message.id, {
          include: [
            { model: User, as: 'sender' },
            { model: User, as: 'receiver' }
          ]
        });

        const messageToSend = {
          ...populatedMessage.toJSON(),
          sender: populatedMessage.sender.toJSON(),
          receiver: populatedMessage.receiver.toJSON()
        };

        io.to(`user_${receiverId}`).emit('new_message', messageToSend);
        io.to(`user_${socket.user.id}`).emit('new_message', messageToSend);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
    // Gestion de la déconnexion
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
      onlineUsers.delete(socket.user.id);
      io.emit('online_users', Array.from(onlineUsers.values()));

      // Nettoyer les appels en cours
      for (const [roomName, call] of activeCalls) {
        if (call.callerId === socket.user.id || call.receiverId === socket.user.id) {
          const otherUserId = call.callerId === socket.user.id ? call.receiverId : call.callerId;
          io.to(`user_${otherUserId}`).emit('video_call_ended', { roomName });
          activeCalls.delete(roomName);
        }
      }
    });
    socket.on('delete_message', async ({ messageId }) => {
      try {
        const message = await Message.findByPk(messageId);
        if (!message) return;

        // Vérifier que l'utilisateur a le droit de supprimer
        if (![message.senderId, message.receiverId].includes(socket.user.id)) {
          return;
        }

        await message.destroy();
        
        // Diffuser aux deux parties
        io.to(`user_${message.senderId}`).emit('message_deleted', { messageId });
        io.to(`user_${message.receiverId}`).emit('message_deleted', { messageId });
      } catch (error) {
       
      }
    });

    socket.on('mark_read', async ({ messageId }) => {
      try {
        const message = await Message.findByPk(messageId);
        if (!message || message.receiverId !== socket.user.id) return;

        await message.update({ isRead: true });
        
        // Notifier l'expéditeur
        io.to(`user_${message.senderId}`).emit('message_read', { 
          messageId,
          readerId: socket.user.id 
        });
      } catch (error) {
        console.error('Read error:', error);
      }
    });

    socket.on('typing', ({ receiverId, isTyping }) => {
      if (!receiverId || typeof isTyping !== 'boolean') return;
      
      io.to(`user_${receiverId}`).emit('typing_status', {
        userId: socket.user.id,
        isTyping,
        username: socket.user.username
      });
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