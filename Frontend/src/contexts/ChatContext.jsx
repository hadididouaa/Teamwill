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
    newSocket.emit('join_user_room', { userId });
  });

  newSocket.on('new_message', (message) => {
    console.log('New message received:', message);
    console.log('Current chat partner:', currentChat?.partner?.id);
    console.log('Message participants:', message.sender.id, message.receiver.id);

    // Vérifier si le message appartient à la conversation actuelle
    const isForCurrentChat = currentChat && (
      message.sender.id === currentChat.partner.id || 
      message.receiver.id === currentChat.partner.id
    );

    // Mettre à jour les messages si c'est la conversation active
    if (isForCurrentChat) {
      setMessages(prev => {
        // Éviter les doublons
        if (!prev.some(m => m.id === message.id)) {
          return [...prev, message];
        }
        return prev;
      });
    }

    // Toujours mettre à jour les conversations
    updateConversationLastMessage(message);
  });

  // Gestion des erreurs
  newSocket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
  });

  setSocket(newSocket);
  return newSocket;
}, [currentChat?.partner?.id]); // Seulement dépendant de l'ID du partenaire

  const updateConversationsOnlineStatus = (users) => {
    setConversations(prev => prev.map(conv => ({
      ...conv,
      partner: {
        ...conv.partner,
        isOnline: users.includes(conv.partner.id)
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
 const fetchCurrentUser = useCallback(async () => {
    try {
      const { data } = await axios.get('/users/auth');
      if (!data || !data.roleUtilisateur) {
        throw new Error('Données utilisateur incomplètes');
      }
      setUser(data);
      return data;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login?session_expired=true';
      }
      return null;
    }
  }, []);
  useEffect(() => {
    let socketInstance;
    if (user?.id) {
      socketInstance = initializeSocket(user.id);

      const pingInterval = setInterval(() => {
        if (socketInstance && isConnected) {
          socketInstance.emit('ping', () => {
            console.log('Ping successful');
          });
        }
      }, 25000);

      return () => {
        clearInterval(pingInterval);
        if (socketInstance) {
          disconnectSocket(socketInstance);
        }
      };
    }
  }, [user?.id, initializeSocket, isConnected]);

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

    // Envoyer via HTTP
    const { data } = await axios.post('/api/messages/send', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // Émettre également via socket
    if (socket) {
      socket.emit('send_message', {
        receiverId,
        content,
        attachments: data.attachments || []
      });
    }

    updateConversationLastMessage(data);
    return data;
  } catch (error) {
    console.error('Erreur envoi message:', error);
    throw error;
  }
};
  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/messages/delete/${messageId}`);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      updateConversationsAfterDelete(messageId);
      socket.emit('delete_message', { messageId });
    } catch (error) {
      console.error('Erreur suppression message:', error);
      throw error;
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const message = await axios.get(`/api/messages/conversation/${currentChat?.partner.id}`);
      const targetMessage = message.data.find(msg => msg.id === messageId);
      if (!targetMessage) {
        console.error('Message not found:', messageId);
        return;
      }
      await axios.put(`/api/messages/mark-read/${messageId}`);
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? { ...msg, isRead: true } : msg)
      );
      socket.emit('mark_read', { 
        messageId, 
        senderId: targetMessage.senderId 
      });
    } catch (error) {
      console.error('Erreur marquage lu:', error);
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

  const sendTypingStatus = (isTyping) => {
    if (socket && currentChat) {
      socket.emit('typing', {
        receiverId: currentChat.partner.id,
        isTyping
      });
    }
  };

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