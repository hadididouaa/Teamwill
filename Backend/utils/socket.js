const { Message, User } = require('../db/models');
const initializeSocket = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
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
        photo: user.photo,
      };

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    socket.join(`user_${socket.user.id}`);
    onlineUsers.set(socket.user.id, socket.user);
    io.emit('online_users', Array.from(onlineUsers.values()));
      socket.emit('initial_data', {
    onlineUsers: Array.from(onlineUsers.values()),
    // Ajoutez d'autres données initiales si nécessaire
  });

// server/index.js
socket.on('initiate_video_call', ({ receiverId, callerName, callerPhoto, roomName }) => {
  console.log(`Initiating call from ${socket.user.id} to ${receiverId} in room ${roomName}`);
  if (!onlineUsers.has(receiverId)) {
    console.log(`User ${receiverId} is offline`);
    socket.emit('call_error', { message: 'User is offline' });
    return;
  }

  const receiverSocketIds = io.sockets.adapter.rooms.get(`user_${receiverId}`);
  if (!receiverSocketIds || receiverSocketIds.size === 0) {
    console.log(`Receiver ${receiverId} is not in user_${receiverId} room`);
    socket.emit('call_error', { message: 'Receiver not available' });
    return;
  }

  activeCalls.set(roomName, {
    callerId: socket.user.id,
    receiverId,
    roomName,
    status: 'pending',
    timestamp: new Date(),
    callerName,
    callerPhoto,
  });

  socket.join(roomName);
  console.log(`Caller ${socket.user.id} joined room ${roomName}`);
  console.log(`Emitting incoming_video_call to user_${receiverId}`);
  io.to(`user_${receiverId}`).emit('incoming_video_call', {
    callerId: socket.user.id,
    callerName,
    callerPhoto,
    roomName,
    respondentId: receiverId,
  });

  socket.emit('call_initiated', { roomName });
});
socket.on('answer_video_call', ({ roomName, answer, respondentId, respondentName }) => {
  const call = activeCalls.get(roomName);
  if (!call) {
    console.log(`Call not found for room: ${roomName}`);
    return;
  }

  if (answer) {
    activeCalls.set(roomName, {
      ...call,
      status: 'ongoing',
      respondentId,
      respondentName,
    });

    socket.join(roomName); // Receiver joins the room
    console.log(`Receiver ${respondentId} joined room ${roomName}`);
    io.to(`user_${call.callerId}`).emit('video_call_accepted', {
      roomName,
      isInitiator: true,
      participantName: respondentName,
    });
    io.to(`user_${respondentId}`).emit('video_call_accepted', {
      roomName,
      isInitiator: false,
      participantName: call.callerName,
    });
    io.to(roomName).emit('join_video_call', { roomName });
    console.log(`Call accepted for room: ${roomName}, both users joined`);
  } else {
    io.to(`user_${call.callerId}`).emit('call_terminated', {
      roomName,
      reason: 'Call declined by recipient',
    });
    activeCalls.delete(roomName);
    console.log(`Call declined for room: ${roomName}`);
  }
});
    socket.on('end_video_call', ({ roomName }) => {
      const call = activeCalls.get(roomName);
      if (!call) return;

      if ([call.callerId, call.receiverId].includes(socket.user.id)) {
        const otherUserId = call.callerId === socket.user.id ? call.receiverId : call.callerId;
        io.to(`user_${otherUserId}`).emit('video_call_ended', { roomName });
        io.to(roomName).emit('video_call_ended', { roomName });
        activeCalls.delete(roomName);
        console.log(`Call ended normally for room: ${roomName}`);
      }
    });

    socket.on('send_message', async ({ receiverId, content, attachments = [] }) => {
      try {
        const message = await Message.create({
          content,
          senderId: socket.user.id,
          receiverId,
          isRead: false,
          attachments,
        });

        const populatedMessage = await Message.findByPk(message.id, {
          include: [
            { model: User, as: 'sender' },
            { model: User, as: 'receiver' },
          ],
        });

        const messageToSend = {
          ...populatedMessage.toJSON(),
          sender: populatedMessage.sender.toJSON(),
          receiver: populatedMessage.receiver.toJSON(),
        };

        io.to(`user_${receiverId}`).emit('new_message', messageToSend);
        io.to(`user_${socket.user.id}`).emit('new_message', messageToSend);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('delete_message', async ({ messageId }) => {
      try {
        const message = await Message.findByPk(messageId);
        if (!message) return;

        if (![message.senderId, message.receiverId].includes(socket.user.id)) {
          return;
        }

        await message.destroy();

        io.to(`user_${message.senderId}`).emit('message_deleted', { messageId });
        io.to(`user_${message.receiverId}`).emit('message_deleted', { messageId });
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    });

    socket.on('mark_read', async ({ messageId }) => {
      try {
        const message = await Message.findByPk(messageId);
        if (!message || message.receiverId !== socket.user.id) return;

        await message.update({ isRead: true });

        io.to(`user_${message.senderId}`).emit('message_read', {
          messageId,
          readerId: socket.user.id,
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
        username: socket.user.username,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
      onlineUsers.delete(socket.user.id);
      io.emit('online_users', Array.from(onlineUsers.values()));

      for (const [roomName, call] of activeCalls) {
        if (call.callerId === socket.user.id || call.receiverId === socket.user.id) {
          const otherUserId = call.callerId === socket.user.id ? call.receiverId : call.callerId;
          io.to(`user_${otherUserId}`).emit('call_terminated', {
            roomName,
            reason: 'participant_disconnected',
          });
          activeCalls.delete(roomName);
        }
      }
    });
  });

  return io;
};

module.exports = initializeSocket;