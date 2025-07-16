// frontend/src/contexts/ChatContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { initSocket, disconnectSocket } from '../utils/socket';
import { message as antdMessage, notification, Avatar, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';

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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = API_URL;

  const initializeSocket = useCallback(
    (userId) => {
      if (!userId) return null;

      const newSocket = initSocket(userId);

    newSocket.on('connect', () => {
  console.log('Socket connected, isConnected:', true);
  setIsConnected(true);
});
      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
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
        notification.open({
          key: `call_${data.roomName}`,
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
              <div className="call-notification-buttons">
                <Button danger onClick={() => answerCall(data.roomName, false)}>
                  Decline
                </Button>
                <Button
                  type="primary"
                  onClick={() => answerCall(data.roomName, true)}
                  style={{ backgroundColor: '#a8b845', borderColor: '#a8b845' }}
                >
                  Accept
                </Button>
              </div>
            </div>
          ),
          duration: 0,
          placement: 'topRight',
        });
        setIncomingCalls((prev) => [...prev, data]);
      });

      newSocket.on('video_call_answer', (data) => {
        if (data.answer) {
          setOpenChats((prev) =>
            prev.map((chat) =>
              chat.partner.id === data.respondentId
                ? { ...chat, activeCall: { roomName: data.roomName, isInitiator: false } }
                : chat
            )
          );
        } else {
          notification.close(`call_${data.roomName}`);
          setIncomingCalls((prev) => prev.filter((call) => call.roomName !== data.roomName));
          antdMessage.warning('Call declined');
        }
      });

      newSocket.on('video_call_ended', ({ roomName }) => {
        notification.close(`call_${roomName}`);
        setIncomingCalls((prev) => prev.filter((call) => call.roomName !== roomName));
        setOpenChats((prev) =>
          prev.map((chat) =>
            chat.activeCall?.roomName === roomName ? { ...chat, activeCall: null } : chat
          )
        );
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      setSocket(newSocket);
      return newSocket;
    },
    [user]
  );
const answerCall = (roomName, accept) => {
  const call = incomingCalls.find((c) => c.roomName === roomName);
  if (!call || !socket) return;

 socket.emit('answer_video_call', {
  roomName,
  answer: accept
});
console.log('Emitted answer_video_call:', { roomName, answer });

  if (accept) {
    const partner = conversations.find((c) => c.partner.id === call.callerId)?.partner ||
      psychologists.find((p) => p.id === call.callerId) ||
      collaborators.find((c) => c.id === call.callerId);
    
    if (partner) {
      const chat = {
        partner,
        lastMessage: null,
        unreadCount: 0,
        activeCall: { roomName, isInitiator: false },
      };
      
      setOpenChats((prev) => {
        if (!prev.some((c) => c.partner.id === partner.id)) {
          return [...prev, chat];
        }
        return prev.map((c) =>
          c.partner.id === partner.id ? { ...c, activeCall: { roomName, isInitiator: false } } : c
        );
      });
      setCurrentChat(chat);
    }
  }

  notification.close(`call_${roomName}`);
  setIncomingCalls((prev) => prev.filter((c) => c.roomName !== roomName));
};

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
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};