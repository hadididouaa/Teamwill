import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { initSocket, disconnectSocket } from '../utils/socket';
import { message as antdMessage } from 'antd';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [psychologists, setPsychologists] = useState([]);
  const [collaborators, setCollaborators] = useState([]);

  // Configuration Axios
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;

  const initializeSocket = useCallback((userId) => {
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

    newSocket.on('online_users', (users) => {
      setOnlineUsers(users.map(u => u.id));
      updateConversationsOnlineStatus(users.map(u => u.id));
    });

    newSocket.on('new_message', (message) => {
      console.log('New message received:', message);
      
      if (currentChat && 
          (message.sender.id === currentChat.partner.id || 
           message.receiver.id === currentChat.partner.id)) {
        setMessages(prev => [...prev, message]);
      }
      
      updateConversationLastMessage(message);
    });

    newSocket.on('message_deleted', ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      updateConversationsAfterDelete(messageId);
    });

    newSocket.on('message_read', ({ messageId }) => {
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? { ...msg, isRead: true } : msg)
      );
      updateConversationReadStatus(messageId);
    });

    newSocket.on('typing_status', ({ userId, isTyping, username }) => {
      if (currentChat?.partner.id === userId) {
        setTypingStatus(isTyping ? `${username} is typing...` : null);
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    setSocket(newSocket);
    return newSocket;
  }, [currentChat]);

  const updateConversationsOnlineStatus = (onlineUserIds) => {
    setConversations(prev => prev.map(conv => ({
      ...conv,
      partner: {
        ...conv.partner,
        isOnline: onlineUserIds.includes(conv.partner.id)
      }
    })));
  };

  const updateConversationsAfterDelete = (messageId) => {
    setConversations(prev =>
      prev.map(conv => {
        if (conv.lastMessage?.id === messageId) {
          const newLastMessage = messages
            .filter(msg => msg.id !== messageId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          return { ...conv, lastMessage: newLastMessage || null };
        }
        return conv;
      })
    );
  };

  const updateConversationReadStatus = (messageId) => {
    setConversations(prev =>
      prev.map(conv => {
        if (conv.lastMessage?.id === messageId) {
          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              isRead: true
            },
            unreadCount: Math.max(0, conv.unreadCount - 1)
          };
        }
        return conv;
      })
    );
  };

  const updateConversationLastMessage = (message) => {
    setConversations(prev => {
      const existingConv = prev.find(conv => 
        [message.sender.id, message.receiver.id].includes(conv.partner.id)
      );
      
      const partner = message.sender.id === user?.id ? message.receiver : message.sender;
      const isOnline = onlineUsers.includes(partner.id);
      
      return existingConv 
        ? prev.map(conv => 
            conv.partner.id === partner.id 
              ? { 
                  ...conv, 
                  lastMessage: message,
                  partner: { ...conv.partner, isOnline },
                  unreadCount: message.receiverId === user?.id && !message.isRead 
                    ? conv.unreadCount + 1 
                    : conv.unreadCount
                } 
              : conv
          )
        : [...prev, {
            partner: { ...partner, isOnline },
            lastMessage: message,
            unreadCount: message.receiverId === user?.id && !message.isRead ? 1 : 0
          }];
    });
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
      }
    };
  }, [user?.id, initializeSocket]);

  useEffect(() => {
    const initialize = async () => {
      const userData = await fetchCurrentUser();
      if (userData) {
        if (userData.roleUtilisateur === 'Collaborateur') {
          await getPsychologists();
        } else if (userData.roleUtilisateur === 'Psychologue') {
          await getCollaborators();
        }
        await fetchConversations();
      }
    };
    initialize();
  }, [fetchCurrentUser]);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/messages/conversations');
      const conversationsWithStatus = data.map(conv => ({
        ...conv,
        partner: {
          ...conv.partner,
          isOnline: onlineUsers.includes(conv.partner.id)
        }
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
      setMessages(data);
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
      attachments.forEach(file => formData.append('attachments', file));

      const { data } = await axios.post('/api/messages/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
    // Modifiez cette ligne pour utiliser le bon endpoint
    await axios.delete(`/api/messages/delete/${messageId}`);
  } catch (error) {
    // Ne montrez pas d'erreur si c'est juste un problème d'API
    // car la suppression en temps réel via socket fonctionne
    console.error('Error in API call (silenced for user):', error);
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

  const sendTypingStatus = (isTyping) => {
    if (socket && currentChat) {
      socket.emit('typing', {
        receiverId: currentChat.partner.id,
        isTyping
      });
    }
  };

  const startNewChat = async (partnerId) => {
    try {
      const partner = [...psychologists, ...collaborators].find(p => p.id === partnerId);
      if (!partner) throw new Error('Contact non trouvé');

      const partnerWithStatus = {
        ...partner,
        isOnline: onlineUsers.includes(partner.id)
      };

      setCurrentChat({
        partner: partnerWithStatus,
        lastMessage: null,
        unreadCount: 0
      });
      await fetchMessages(partnerId);
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
    currentChat,
    messages,
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
    setCurrentChat,
    startNewChat,
    sendTypingStatus,
    setMessages
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};