import { io } from 'socket.io-client';

export const initSocket = (userId) => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  
  const socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    auth: {
      token: token
    },
    query: {
      userId: userId
    }
  });

  socket.on('connect', () => {
    console.log('Socket connected, joining room for user:', userId);
    socket.emit('join_user_room', { userId });
  });

  socket.on('connect_error', (error) => {
    console.error('Connection Error:', error);
    setTimeout(() => {
      socket.connect();
    }, 1000);
  });

  return socket;
};

export const disconnectSocket = (socket) => {
  if (socket) {
    socket.removeAllListeners();
    if (socket.connected) {
      socket.disconnect();
    }
  }
};