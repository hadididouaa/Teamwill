import React, { useContext, useRef, useState, useEffect } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { Avatar, Input, Button, List, Typography, Spin, message as antdMessage, Badge, Empty } from 'antd';
import { SendOutlined, UserOutlined, CheckOutlined, PaperClipOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const { Text } = Typography;

const ChatWindow = () => {
  const { 
    currentChat,
    user,
    messages,
    loading,
    typingStatus,
    socket,
    isConnected,
    onlineUsers,
    sendMessage,
    deleteMessage,
    markAsRead,
    sendTypingStatus,
    setMessages
  } = useContext(ChatContext);

  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingStatus]);

  useEffect(() => {
    if (!socket || !currentChat || !messages.length) return;

    const unreadMessages = messages.filter(
      msg => msg.senderId === currentChat.partner.id && !msg.isRead
    );

    unreadMessages.forEach(msg => {
      markAsRead(msg.id);
    });
  }, [messages, currentChat, socket, markAsRead]);

  const handleSend = async () => {
    if (!messageInput.trim() && attachments.length === 0) return;

    setIsSending(true);
    try {
      await sendMessage(messageInput, currentChat.partner.id, attachments);
      setMessageInput('');
      setAttachments([]);
      sendTypingStatus(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      antdMessage.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (messageId) => {
  try {
    await deleteMessage(messageId);
    // Pas besoin de message de succès car la suppression est visible immédiatement
  } catch (error) {
    // Seulement afficher si ce n'est pas une 404
    if (!error.response || error.response.status !== 404) {
      antdMessage.error('Delete failed');
    }
  }
};

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      antdMessage.error('You can only send up to 5 files');
      return;
    }
    
    const maxSize = 50 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      antdMessage.error(`Some files exceed the maximum size of 50MB`);
      return;
    }
    
    setAttachments([...attachments, ...files]);
    e.target.value = null;
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (socket && currentChat) {
      sendTypingStatus(!!e.target.value);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set a new timeout to stop typing indication after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socket && currentChat) {
        sendTypingStatus(false);
      }
    };
  }, [socket, currentChat]);

  if (!currentChat) {
    return (
      <div className="empty-chat">
        <Text>Select a conversation to start chatting</Text>
      </div>
    );
  }

  return (
    <div className="chat-window-container">
      <div className="chat-header">
        <Badge 
          dot 
          color={onlineUsers.includes(currentChat.partner.id) ? '#52c41a' : '#f5222d'} 
          offset={[-5, 30]}
        >
          <Avatar 
            size="large" 
            src={currentChat.partner.photo ? `${axios.defaults.baseURL}${currentChat.partner.photo}` : '/assets/img/user.png'} 
            icon={<UserOutlined />}
          />
        </Badge>
        <div className="chat-header-info">
          <Text strong>{currentChat.partner.username}</Text>
          <Text type="secondary">
            {currentChat.partner.roleUtilisateur} • 
            {onlineUsers.includes(currentChat.partner.id) ? ' Online' : ' Offline'}
          </Text>
          {typingStatus && (
            <Text type="secondary" style={{ fontStyle: 'italic', marginLeft: 8 }}>
              {typingStatus}
            </Text>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="messages-container">
            {messages.length === 0 ? (
              <Empty description="No messages in this conversation" />
            ) : (
              <List
                dataSource={messages}
                renderItem={msg => (
                  <div className={`message ${msg.senderId === currentChat.partner.id ? 'received' : 'sent'}`}>
                    <div className="message-content">
                      <Text>{msg.content}</Text>
                      {msg.attachments?.length > 0 && (
                        <div className="message-attachments">
                          {msg.attachments.map((file, index) => (
                            <div key={index} className="attachment-item">
                              <PaperClipOutlined />
                              <a 
                                href={`${axios.defaults.baseURL}${file.path}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                {file.filename}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="message-meta">
                        <Text type="secondary">
                          {moment(msg.createdAt).format('HH:mm')}
                        </Text>
                        {msg.senderId !== currentChat.partner.id && msg.isRead && (
                          <CheckOutlined style={{ color: '#1890ff', marginLeft: 4 }} />
                        )}
                        {msg.senderId === user?.id && (
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<DeleteOutlined />} 
                            onClick={() => handleDelete(msg.id)}
                            style={{ marginLeft: 8 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input-container">
            <Input.TextArea
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              autoSize={{ minRows: 1, maxRows: 4 }}
            />          
            <div className="input-actions">
              <input 
                type="file" 
                id="file-upload" 
                multiple 
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="*"
              />
              <label htmlFor="file-upload" className="attachment-button">
                <PaperClipOutlined />
              </label>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={isSending}
                disabled={!messageInput.trim() && attachments.length === 0}
              />
            </div>
            {attachments.length > 0 && (
              <div className="attachment-preview">
                {attachments.map((file, index) => (
                  <div key={index} className="attachment-item">
                    <PaperClipOutlined className="attachment-icon" />
                    <span className="attachment-name">{file.name}</span>
                    <span className="attachment-size">
                      {(file.size / 1024 / 1024).toFixed(2)}MB
                    </span>
                    <Button 
                      type="text" 
                      icon={<CloseOutlined />} 
                      onClick={() => removeAttachment(index)}
                      className="attachment-remove"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>  
  );
};

export default ChatWindow;