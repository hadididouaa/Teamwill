import React, { 
  createContext, 
  useState, 
  useEffect, 
  useCallback, 
  useContext, 
  useRef
} from 'react';
import axios from 'axios';
import { initSocket, disconnectSocket } from '../utils/socket';
import { message as antdMessage, notification, Avatar, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import callSound from '../assets/sounds/microsoft_teams_call.mp3';

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

  const audioRef = useRef(new Audio(callSound));
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = API_URL;
  const handleJoinVideoCall = useCallback((roomName) => {
  setCurrentChat(prev => ({
    ...prev,
    activeCall: {
      roomName,
      isInitiator: false,
      status: 'active'
    }
  }));
}, []);

  const initializeSocket = useCallback(
    (userId) => {
      if (!userId) return null;

      const newSocket = initSocket(userId);

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });
       newSocket.on('join_video_call', ({ roomName }) => {
      handleJoinVideoCall(roomName);
    });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users.map((u) => u.id));
        updateConversationsOnlineStatus(users.map((u) => u.id));
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

   newSocket.on('incoming_video_call', (data) => {
  console.log('Received incoming_video_call:', data);
  
  try {
    audioRef.current.currentTime = 0; // Reset audio
    audioRef.current.loop = true;
    audioRef.current.play().catch(e => console.error('Audio play failed:', e));
  } catch (e) {
    console.error('Audio error:', e);
  }
        

        const key = `call_${data.roomName}`;
        notification.destroy(key);
        
        const btn = (
          <div className="call-notification-buttons">
            <Button 
              danger 
              onClick={() => {
                notification.destroy(key);
                answerCall(data.roomName, false);
              }}
            >
              Decline
            </Button>
            <Button
              type="primary"
              onClick={() => {
                notification.destroy(key);
                answerCall(data.roomName, true);
              }}
              style={{ backgroundColor: '#a8b845', borderColor: '#a8b845' }}
            >
              Accept
            </Button>
          </div>
        );

        notification.open({
          key,
          message: 'Incoming Video Call',
          description: (
            <div className="call-notification">
              <Avatar
                src={data.callerPhoto ? `${API_URL}/Uploads/${data.callerPhoto}` : '/assets/img/user.png'}
                icon={<UserOutlined />}
                size="large"
                style={{ marginBottom: 10 }}
              />
              <div>{data.callerName} is calling...</div>
              {btn}
            </div>
          ),
          duration: 0,
          placement: 'topRight',
          onClose: () => {
            if (audioRef.current) audioRef.current.pause();
          }
        });

        setIncomingCalls(prev => [...prev, data]);
      });

      newSocket.on('video_call_answered', (data) => {
        console.log('Video call answered:', data);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        if (data.answer) {
          setCurrentChat(prev => ({
            ...prev,
            activeCall: {
              roomName: data.roomName,
              isInitiator: false,
              status: 'active'
            }
          }));
        } else {
          notification.warning({ message: 'Call declined' });
          setCurrentChat(prev => ({
            ...prev,
            activeCall: null
          }));
        }
      });

      newSocket.on('video_call_ended', ({ roomName }) => {
        console.log('Video call ended for room:', roomName);
        notification.destroy(`call_${roomName}`);
        setIncomingCalls(prev => prev.filter(call => call.roomName !== roomName));
        setCurrentChat(prev => {
          if (prev?.activeCall?.roomName === roomName) {
            return { ...prev, activeCall: null };
          }
          return prev;
        });
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      setSocket(newSocket);
      return newSocket;
    },
     [user, handleJoinVideoCall]
  );

  const startVideoCall = useCallback(async (partnerId) => {
    try {
      if (!socket || !isConnected) {
        notification.error({ message: 'Connection error. Please refresh the page.' });
        return;
      }
  
      const roomName = `video_call_${user.id}_${partnerId}_${Date.now()}`;
  
      setCurrentChat(prev => ({
        ...prev,
        activeCall: {
          roomName,
          isInitiator: true,
          status: 'calling'
        }
      }));
  
      if (audioRef.current) {
        audioRef.current.src = callSound;
        audioRef.current.loop = true;
        audioRef.current.play().catch(e => console.error('Audio play failed:', e));
      }
  
      socket.emit('initiate_video_call', {
        receiverId: partnerId,
        callerId: user.id,
        callerName: user.username,
        callerPhoto: user.photo,
        roomName
      });
  
      const callTimeout = setTimeout(() => {
        if (currentChat?.activeCall?.roomName === roomName && 
            currentChat?.activeCall?.status === 'calling') {
          notification.warning({ message: 'Call unanswered' });
          socket.emit('end_video_call', { roomName });
          setCurrentChat(prev => ({
            ...prev,
            activeCall: null
          }));
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }
      }, 30000);
  
      return () => clearTimeout(callTimeout);
    } catch (error) {
      console.error('Error starting video call:', error);
      notification.error({ 
        message: 'Failed to start video call',
        description: error.message 
      });
    }
  }, [socket, isConnected, user, currentChat]);

// Modifiez la fonction answerCall comme ceci :
const answerCall = useCallback((roomName, accept) => {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }
  
  const call = incomingCalls.find(c => c.roomName === roomName);
  if (!call || !socket) return;

  notification.destroy(`call_${roomName}`);
  setIncomingCalls(prev => prev.filter(c => c.roomName !== roomName));

  socket.emit('answer_video_call', { 
    roomName,
    answer: accept,
    respondentId: user.id,
    respondentName: user.username
  });

  if (accept) {
    setCurrentChat(prev => ({
      ...prev,
      activeCall: {
        roomName,
        isInitiator: false,
        status: 'active'
      }
    }));
    // Ajoutez cette ligne pour rejoindre l'appel immédiatement
    handleJoinVideoCall(roomName);
  }
}, [socket, incomingCalls, user, handleJoinVideoCall]);

  const endVideoCall = useCallback((roomName) => {
    if (socket) {
      socket.emit('end_video_call', { roomName });
    }
    setCurrentChat(prev => {
      if (prev?.activeCall?.roomName === roomName) {
        return { ...prev, activeCall: null };
      }
      return prev;
    });
  }, [socket]);

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
          fetchConversations()
        ]);
      }
    };
    
    const timer = setTimeout(initialize, 100);
    return () => clearTimeout(timer);
  }, [fetchCurrentUser]);

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
    audioRef,
    answerCall,
    startVideoCall,
    endVideoCall
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};