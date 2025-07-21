import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import axios from 'axios';
import { initSocket, disconnectSocket } from '../utils/socket';
import { message as antdMessage, notification, Avatar, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import callSound from '../assets/sounds/microsoft_teams_call.mp3';
import VideoCallOverlay from '../components/VideoCallOverlay';

export const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [openChats, setOpenChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [typingStatus, setTypingStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [psychologists, setPsychologists] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  

  const audioRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = API_URL;

  useEffect(() => {
    audioRef.current = new Audio(callSound);
    audioRef.current.loop = true;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  // Dans ChatContext.jsx
useEffect(() => {
  if (!socket) return;

  const handleJoinCall = ({ roomName }) => {
    console.log('Joining video call room:', roomName);
    setActiveVideoCall(roomName);
  };

  socket.on('join_video_call', handleJoinCall);

  return () => {
    socket.off('join_video_call', handleJoinCall);
  };
}, [socket]);

  const stopRingtone = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('Ringtone stopped');
    }
  }, []);

  const initializeSocket = useCallback(
    (userId) => {
      if (!userId) return null;

      const newSocket = initSocket(userId);

  newSocket.on('connect', () => {
  console.log('Socket connected for user:', userId);
  setIsConnected(true);
  newSocket.emit('join_user_room', `user_${userId}`);
});

// Handle reconnection
newSocket.on('reconnect', () => {
  console.log('Socket reconnected for user:', userId);
  newSocket.emit('join_user_room', `user_${userId}`);
});

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users.map((u) => u.id));
        updateConversationsOnlineStatus(users.map((u) => u.id));
      });

// Replace the standalone line with:
newSocket.on('incoming_video_call', ({ roomName, callerId, callerName, callerPhoto }) => {
  console.log('Received incoming_video_call:', { roomName, callerId, callerName, callerPhoto });
  setIncomingCalls(prev => [...prev, { roomName, callerId, callerName, callerPhoto }]);
  if (audioRef.current) {
    audioRef.current.play().catch(e => console.error('Audio play failed:', e));
  }
});

      newSocket.on('call_initiated', ({ roomName }) => {
        console.log('Call initiated:', roomName);
        setActiveVideoCall(roomName);
      });

      newSocket.on('video_call_accepted', ({ roomName, isInitiator, participantName }) => {
        console.log('Video call accepted:', { roomName, isInitiator, participantName });
        stopRingtone();
        setActiveVideoCall(roomName); // Ensure both users join the call
      });

      newSocket.on('join_video_call', ({ roomName }) => {
        console.log('Received join_video_call:', roomName);
        setActiveVideoCall(roomName); // Ensure the receiver joins the Jitsi room
      });

      newSocket.on('stop_call_sound', () => {
        console.log('Received stop_call_sound');
        stopRingtone();
      });

      newSocket.on('video_call_ended', ({ roomName }) => {
        console.log('Video call ended for room:', roomName);
        stopRingtone();
        notification.destroy(`call_${roomName}`);
        setIncomingCalls((prev) => prev.filter((call) => call.roomName !== roomName));
        setActiveVideoCall(null);
      });

      newSocket.on('call_terminated', ({ roomName, reason }) => {
        console.log('Call terminated:', { roomName, reason });
        stopRingtone();
        notification.destroy(`call_${roomName}`);
        setIncomingCalls((prev) => prev.filter((call) => call.roomName !== roomName));
        setActiveVideoCall(null);
        notification.warning({ message: 'Call ended', description: reason });
      });

      newSocket.on('new_message', (message) => {
        const partnerId = message.sender.id === user?.id ? message.receiver.id : message.sender.id;
        setMessages((prev) => ({
          ...prev,
          [partnerId]: [...(prev[partnerId] || []), message],
        }));
        updateConversationLastMessage(message);
      });

      newSocket.on('message_deleted', ({ messageId }) => {
        setMessages((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((partnerId) => {
            updated[partnerId] = updated[partnerId].filter((msg) => msg.id !== messageId);
          });
          return updated;
        });
        updateConversationsAfterDelete(messageId);
      });

      newSocket.on('message_read', ({ messageId }) => {
        setMessages((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((partnerId) => {
            updated[partnerId] = updated[partnerId].map((msg) =>
              msg.id === messageId ? { ...msg, isRead: true } : msg
            );
          });
          return updated;
        });
        updateConversationReadStatus(messageId);
      });

      newSocket.on('typing_status', ({ userId, isTyping, username }) => {
        setTypingStatus((prev) => ({
          ...prev,
          [userId]: isTyping ? `${username} is typing...` : null,
        }));
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      setSocket(newSocket);
      return newSocket;
    },
    [user, stopRingtone]
  );
const startVideoCall = useCallback(
  async (receiverId) => {
    if (!socket || !user?.id) {
      console.error('Socket or user not available');
      notification.error({ message: 'Cannot start call', description: 'Socket or user not available' });
      return;
    }

    if (!onlineUsers.includes(receiverId)) {
      console.error('Receiver is offline');
      notification.error({ message: 'Cannot start call', description: 'Receiver is offline' });
      return;
    }

    const roomName = `video_call_${user.id}_${receiverId}_${Date.now()}`;
    console.log('Starting video call:', { roomName, receiverId });

    const attemptCall = (attempts = 3, delay = 1000) => {
      socket.emit('initiate_video_call', {
        roomName,
        callerId: user.id,
        callerName: user.username,
        callerPhoto: user.photo,
        receiverId,
      });

      // Listen for call_initiated or call_error
      const handleCallInitiated = () => {
        console.log('Call initiated successfully:', roomName);
        setActiveVideoCall(roomName);
      };

      const handleCallError = ({ message }) => {
        console.error('Call error:', message);
        if (attempts > 1) {
          console.log(`Retrying call initiation. Attempts left: ${attempts - 1}`);
          setTimeout(() => attemptCall(attempts - 1, delay * 2), delay);
        } else {
          notification.error({ message: 'Call Failed', description: message });
        }
      };

      socket.once('call_initiated', handleCallInitiated);
      socket.once('call_error', handleCallError);

      // Cleanup listeners if call doesn't succeed within a timeout
      setTimeout(() => {
        socket.off('call_initiated', handleCallInitiated);
        socket.off('call_error', handleCallError);
      }, 10000); // 10 seconds timeout
    };

    attemptCall();
    return roomName;
  },
  [socket, user, onlineUsers]
);
const answerCall = useCallback(
  async (roomName, accept) => {
    console.log('Answering call:', { roomName, accept, userId: user?.id });
    stopRingtone();

    if (!socket || !user?.id) {
      console.error('Socket or user not available');
      return;
    }

    const call = incomingCalls.find((c) => c.roomName === roomName);
    if (!call) {
      console.error('Call not found');
      return;
    }

    if (accept) {
      socket.emit('answer_video_call', {
        roomName,
        answer: true,
        respondentId: user.id,
        respondentName: user.username,
      });
      setActiveVideoCall(roomName); // Receiver joins the Jitsi room
    } else {
      socket.emit('answer_video_call', {
        roomName,
        answer: false,
        respondentId: user.id,
      });
      setIncomingCalls((prev) => prev.filter((c) => c.roomName !== roomName));
    }
  },
  [socket, user, incomingCalls, stopRingtone]
);


  const endVideoCall = useCallback(
    (roomName) => {
      console.log('Ending video call:', roomName);
      if (socket) {
        socket.emit('end_video_call', { roomName });
      }
      stopRingtone();
      setActiveVideoCall(null);
      notification.destroy(`call_${roomName}`);
      setIncomingCalls((prev) => prev.filter((c) => c.roomName !== roomName));
    },
    [socket, stopRingtone]
  );

  const updateConversationsOnlineStatus = (onlineUserIds) => {
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        partner: {
          ...conv.partner,
          isOnline: onlineUserIds.includes(conv.partner.id),
        },
      }))
    );
  };

  const updateConversationLastMessage = (message) => {
    const partnerId = message.sender.id === user?.id ? message.receiver.id : message.sender.id;
    setConversations((prev) => {
      const existingConv = prev.find((conv) => conv.partner.id === partnerId);
      const partner = message.sender.id === user?.id ? message.receiver : message.sender;
      const isOnline = onlineUsers.includes(partner.id);

      return existingConv
        ? prev.map((conv) =>
            conv.partner.id === partnerId
              ? {
                  ...conv,
                  lastMessage: message,
                  partner: { ...conv.partner, isOnline, photo: partner.photo },
                  unreadCount:
                    message.receiverId === user?.id && !message.isRead
                      ? conv.unreadCount + 1
                      : conv.unreadCount,
                }
              : conv
          )
        : [
            ...prev,
            {
              partner: { ...partner, isOnline, photo: partner.photo },
              lastMessage: message,
              unreadCount: message.receiverId === user?.id && !message.isRead ? 1 : 0,
            },
          ];
    });
  };

  const updateConversationsAfterDelete = (messageId) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.lastMessage?.id === messageId) {
          const newLastMessage = messages[conv.partner.id]
            ?.filter((msg) => msg.id !== messageId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          return { ...conv, lastMessage: newLastMessage || null };
        }
        return conv;
      })
    );
  };

  const updateConversationReadStatus = (messageId) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.lastMessage?.id === messageId) {
          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              isRead: true,
            },
            unreadCount: Math.max(0, conv.unreadCount - 1),
          };
        }
        return conv;
      })
    );
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data } = await axios.get('/users/auth');
      setUser(data);
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    let socketInstance;
    if (user?.id) {
      socketInstance = initializeSocket(user.id);
    }

    return () => {
      if (socketInstance) {
        disconnectSocket(socketInstance);
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [user?.id, initializeSocket]);

  useEffect(() => {
    const initialize = async () => {
      const userData = await fetchCurrentUser();
      if (userData) {
        await Promise.all([
          userData.roleUtilisateur === 'Collaborateur' ? getPsychologists() : getCollaborators(),
          fetchConversations(),
        ]);
      }
    };

    const timer = setTimeout(initialize, 100);
    return () => clearTimeout(timer);
  }, [fetchCurrentUser]);
useEffect(() => {
  console.log('Incoming calls updated:', incomingCalls); // Add this log
  incomingCalls.forEach((call) => {
notification.open({
  key: `call_${call.roomName}`,
  message: `Incoming Video Call from ${call.callerName}`,
  description: (
 <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
  <Button
    onClick={() => {
      answerCall(call.roomName, true);
      notification.destroy(`call_${call.roomName}`);
    }}
    style={{
      width: '100px',
      height: '36px',
      borderRadius: '18px',
      fontWeight: '500',
      backgroundColor: '#a8b845',
      borderColor: '#a8b845',
      color: '#fff',
      ':hover': {
        backgroundColor: '#939e3b',
        borderColor: '#939e3b',
        color: '#fff'
      }
    }}
  >
    Accept
  </Button>
  <Button
    onClick={() => {
      answerCall(call.roomName, false);
      notification.destroy(`call_${call.roomName}`);
    }}
    style={{
      width: '100px',
      height: '36px',
      borderRadius: '18px',
      fontWeight: '500',
      backgroundColor: '#ff4d4f',
      borderColor: '#ff4d4f',
      color: '#fff',
      ':hover': {
        backgroundColor: '#d9363e',
        borderColor: '#d9363e',
        color: '#fff'
      }
    }}
  >
    Decline
  </Button>
</div>
  ),
  duration: 0,
  placement: 'topRight',
  style: { 
    zIndex: 1002,
    width: '320px',
    borderRadius: '8px',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)'
  },
});});

  return () => {
    incomingCalls.forEach((call) => notification.destroy(`call_${call.roomName}`));
  };
}, [incomingCalls, answerCall]);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/messages/conversations');
      const conversationsWithStatus = data.map((conv) => ({
        ...conv,
        partner: {
          ...conv.partner,
          isOnline: onlineUsers.includes(conv.partner.id),
          photo: conv.partner.photo,
        },
      }));
      setConversations(conversationsWithStatus);
    } catch (error) {
      console.error('Erreur conversations:', error);
      antdMessage.error('Erreur chargement conversations');
    } finally {
      setLoading(false);
    }
  }, [onlineUsers]);

  const fetchMessages = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/messages/conversation/${userId}`);
      setMessages((prev) => ({
        ...prev,
        [userId]: data,
      }));
    } catch (error) {
      console.error('Erreur messages:', error);
      antdMessage.error('Erreur chargement messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = async (content, receiverId, attachments = []) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('receiverId', receiverId);
      attachments.forEach((file) => formData.append('attachments', file));

      const { data } = await axios.post('/api/messages/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      if (socket) {
        socket.emit('delete_message', { messageId });
      }
      await axios.delete(`/api/messages/delete/${messageId}`, {
        validateStatus: (status) => status < 500,
      });
    } catch (error) {
      console.debug('Erreur API silencieuse:', error);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      if (socket) {
        socket.emit('mark_read', { messageId });
      }
      await axios.put(`/api/messages/mark-read/${messageId}`);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendTypingStatus = (isTyping, partnerId) => {
    if (socket && partnerId) {
      socket.emit('typing', {
        receiverId: partnerId,
        isTyping,
      });
    }
  };

  const startNewChat = async (partnerId) => {
    try {
      const partner = [...psychologists, ...collaborators].find((p) => p.id === partnerId);
      if (!partner) throw new Error('Contact non trouvé');

      const partnerWithStatus = {
        ...partner,
        isOnline: onlineUsers.includes(partner.id),
        photo: partner.photo,
      };

      const newChat = {
        partner: partnerWithStatus,
        lastMessage: null,
        unreadCount: 0,
      };

      setOpenChats((prev) => {
        if (!prev.some((chat) => chat.partner.id === partnerId)) {
          return [...prev, newChat];
        }
        return prev;
      });
      setCurrentChat(newChat);
      await fetchMessages(partnerId);
      return newChat;
    } catch (error) {
      console.error('Erreur nouvelle conversation:', error);
    }
  };

  const getPsychologists = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/messages/psychologists');
      setPsychologists(data);
    } catch (error) {
      console.error('Erreur psychologues:', error);
    }
  }, []);

  const getCollaborators = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/messages/collaborators');
      setCollaborators(data);
    } catch (error) {
      console.error('Erreur collaborateurs:', error);
    }
  }, []);

  const contextValue = {
    user,
    conversations,
    openChats,
    setOpenChats,
    currentChat,
    setCurrentChat,
    messages,
    setMessages,
    loading,
    psychologists,
    collaborators,
    onlineUsers,
    typingStatus,
    socket,
    isConnected,
    fetchConversations,
    fetchMessages,
    sendMessage,
    deleteMessage,
    markAsRead,
    startNewChat,
    sendTypingStatus,
    startVideoCall,
    answerCall,
    endVideoCall,
    activeVideoCall,
  };

  useEffect(() => {
    console.log('Active video call state changed:', activeVideoCall);
  }, [activeVideoCall]);

  return (
    <>
      <ChatContext.Provider value={contextValue}>
        {children}
        {activeVideoCall && (
          <VideoCallOverlay
            roomName={activeVideoCall}
            onEndCall={() => endVideoCall(activeVideoCall)}
            user={user}
          />
        )}
      </ChatContext.Provider>
    </>
  );
};