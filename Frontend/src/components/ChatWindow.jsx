import React, { useContext, useRef, useState, useEffect } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { Avatar, Tabs, Input, Button, List, Typography, Spin, notification, Badge, Empty } from 'antd';
import { SendOutlined, UserOutlined, CheckOutlined, PaperClipOutlined, DeleteOutlined, CloseOutlined, VideoCameraOutlined, SearchOutlined ,  MessageOutlined} from '@ant-design/icons';
import moment from 'moment';

const { Text } = Typography;

const ChatWindow = ({ currentChat, embedded = false }) => {
  const {
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
    startVideoCall,
    endVideoCall,
  } = useContext(ChatContext);

  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [activeTab, setActiveTab] = useState('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [conversationAttachments, setConversationAttachments] = useState([]);
  const [searchMode, setSearchMode] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [contextMessages, setContextMessages] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const handleSend = async () => {
    if (!messageInput.trim() && attachments.length === 0) return;

    setIsSending(true);
    try {
      await sendMessage(messageInput, currentChat.partner.id, attachments);
      setMessageInput('');
      setAttachments([]);
      sendTypingStatus(false, currentChat.partner.id);
    } catch (error) {
      console.error('Failed to send message:', error);
      notification.error({ message: 'Failed to send message' });
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      if (!error.response || error.response.status !== 404) {
        notification.error({ message: 'Delete failed' });
      }
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      notification.error({ message: 'You can only send up to 5 files' });
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      notification.error({ message: 'Some files exceed the maximum size of 50MB' });
      return;
    }

    setAttachments([...attachments, ...files]);
    e.target.value = null;
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (socket && currentChat) {
      sendTypingStatus(!!e.target.value, currentChat.partner.id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false, currentChat.partner.id);
      }, 3000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages[currentChat?.partner.id], typingStatus[currentChat?.partner.id]]);

  useEffect(() => {
    if (!socket || !currentChat || !messages[currentChat?.partner.id]?.length) return;

    const unreadMessages = messages[currentChat.partner.id].filter(
      (msg) => msg.senderId === currentChat.partner.id && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach((msg) => {
        markAsRead(msg.id);
      });
    }
  }, [messages, currentChat, socket, markAsRead]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socket && currentChat) {
        sendTypingStatus(false, currentChat.partner.id);
      }
    };
  }, [socket, currentChat]);

  useEffect(() => {
    if (searchQuery.trim() && messages[currentChat?.partner.id]) {
      const filtered = messages[currentChat.partner.id].filter(msg =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
      setSearchMode(true);
    } else {
      setFilteredMessages([]);
      setSearchMode(false);
      setSelectedSearchResult(null);
    }
  }, [searchQuery, messages, currentChat]);

  const loadMessageContext = (message) => {
    setSelectedSearchResult(message);
    
    if (!messages[currentChat.partner.id]) return;
    
    const messageIndex = messages[currentChat.partner.id].findIndex(m => m.id === message.id);
    if (messageIndex === -1) return;
    
    const start = Math.max(0, messageIndex - 5);
    const end = Math.min(messages[currentChat.partner.id].length - 1, messageIndex + 5);
    
    setContextMessages(messages[currentChat.partner.id].slice(start, end + 1));
  };

  useEffect(() => {
    if (currentChat && messages[currentChat.partner.id]) {
      const attachments = messages[currentChat.partner.id].flatMap(msg => 
        msg.attachments?.map(att => ({
          ...att,
          messageId: msg.id,
          sentAt: msg.createdAt,
          sender: msg.senderId === user?.id ? user : currentChat.partner
        })) || []
      );
      setConversationAttachments(attachments);
    }
  }, [messages, currentChat, user]);

  if (!currentChat) {
    return (
      <div className="empty-chat">
        <Text>Select a conversation to start chatting</Text>
      </div>
    );
  }

  return (
    <div className="chat-window-container" style={embedded ? { height: '100%', border: 'none', borderRadius: 0 } : {}}>
     
      <div className="chat-header">
        <Badge dot color={onlineUsers.includes(currentChat.partner.id) ? '#52c41a' : '#f5222d'} >
          <Avatar
            size="default"
            src={currentChat.partner.photo ? `${API_URL}/Uploads/${currentChat.partner.photo}` : '/assets/img/user.png'}
            icon={<UserOutlined />}
            style={{ width: 50, height: 50}}
            className="avatar-img"
          />
        </Badge>

        <div className="chat-header-info">
          <Text strong style={{ paddingLeft: 1, paddingRight: 24 }}>
            {currentChat.partner.username.toUpperCase()}
          </Text>
          <Text type="secondary">{onlineUsers.includes(currentChat.partner.id) ? ' Online' : ' Offline'}</Text>
          {typingStatus[currentChat.partner.id] && (
            <Text type="secondary" style={{ fontStyle: 'italic', marginLeft: 8 }}>
              {typingStatus[currentChat.partner.id]}
            </Text>
          )}
        </div>
        {onlineUsers.includes(currentChat.partner.id) && (
          <Button
            type="primary"
            icon={<VideoCameraOutlined />}
            onClick={() => startVideoCall(currentChat.partner.id)}
            style={{ marginLeft: 'auto', backgroundColor: '#a8b845', borderColor: '#a8b845' }}
            disabled={!isConnected}
          />
        )}
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={
          activeTab === 'messages' && (
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search in this conversation"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              style={{ 
                width: 200,
                marginLeft: 8
              }}
            />
          )
        }
        tabBarStyle={{
          marginBottom: 0,
          padding: '0 16px'
        }}
      >
        <Tabs.TabPane 
          tab={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              padding: '8px 0',
              fontSize: '18px'
            }}>
              <MessageOutlined style={{ fontSize: '18px' }} />
            </div>
          } 
          key="messages" 
        />
        <Tabs.TabPane 
          tab={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              padding: '8px 0',
              fontSize: '18px'
            }}>
              <Badge 
                count={conversationAttachments.length} 
                size="small"
                offset={[-5, 5]}
                style={{ 
                  fontSize: '10px',
                  lineHeight: '16px'
                }}
              >
                <PaperClipOutlined style={{ fontSize: '18px' }} />
              </Badge>
            </div>
          } 
          key="attachments" 
        />
      </Tabs>
      
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {activeTab === 'messages' ? (
            <div className="messages-container">
              {searchMode ? (
                <>
                  <div className="search-results-header">
                    <Text strong>Résultats pour "{searchQuery}" ({filteredMessages.length})</Text>
                    <Button type="link" onClick={() => {
                      setSearchQuery('');
                      setSearchMode(false);
                    }}>
                      Effacer
                    </Button>
                  </div>
                  
                  {filteredMessages.length > 0 ? (
                    <>
                      <List
                        dataSource={filteredMessages}
                        renderItem={(msg) => (
                          <div 
                            className={`search-result-item ${selectedSearchResult?.id === msg.id ? 'selected' : ''}`}
                            onClick={() => loadMessageContext(msg)}
                          >
                            <div className="message-content">
                              <Text>{msg.content}</Text>
                              <div className="message-meta">
                                <Text type="secondary">{moment(msg.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                              </div>
                            </div>
                          </div>
                        )}
                        style={{ marginBottom: 16 }}
                      />
                      
                      {selectedSearchResult && (
                        <div className="message-context">
                          <div className="context-header">
                            <Text strong>Contexte du message</Text>
                          </div>
                          <List
                            dataSource={contextMessages}
                            renderItem={(msg) => (
                              <div className={`message ${msg.senderId === currentChat.partner.id ? 'received' : 'sent'}`}>
                                <div className="message-content">
                                  <Text>{msg.content}</Text>
                                  {msg.attachments?.length > 0 && (
                                    <div className="message-attachments">
                                      {msg.attachments.map((file, index) => (
                                        <div key={index} className="attachment-item">
                                          <PaperClipOutlined />
                                          <a href={`${API_URL}${file.path}`} target="_blank" rel="noopener noreferrer">
                                            {file.filename}
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="message-meta">
                                    <Text type="secondary">{moment(msg.createdAt).format('HH:mm')}</Text>
                                    {msg.senderId !== currentChat.partner.id && msg.isRead && (
                                      <CheckOutlined style={{ color: '#333333', marginLeft: 4 }} />
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
                        </div>
                      )}
                    </>
                  ) : (
                    <Empty description="Aucun message trouvé" />
                  )}
                </>
              ) : (
                <List
                  dataSource={messages[currentChat.partner.id] || []}
                  renderItem={(msg) => (
                    <div className={`message ${msg.senderId === currentChat.partner.id ? 'received' : 'sent'}`}>
                      <div className="message-content">
                        <Text>{msg.content}</Text>
                        {msg.attachments?.length > 0 && (
                          <div className="message-attachments">
                            {msg.attachments.map((file, index) => (
                              <div key={index} className="attachment-item">
                                <PaperClipOutlined />
                                <a href={`${API_URL}${file.path}`} target="_blank" rel="noopener noreferrer">
                                  {file.filename}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="message-meta">
                          <Text type="secondary">{moment(msg.createdAt).format('HH:mm')}</Text>
                          {msg.senderId !== currentChat.partner.id && msg.isRead && (
                            <CheckOutlined style={{ color: '#333333', marginLeft: 4 }} />
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
          ) : (
            <div className="attachments-container">
              {conversationAttachments.length > 0 ? (
                <List
                  dataSource={conversationAttachments}
                  renderItem={(attachment) => (
                    <div className="attachment-item">
                      <PaperClipOutlined />
                      <a 
                        href={`${API_URL}${attachment.path}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ marginLeft: 8 }}
                      >
                        {attachment.filename}
                      </a>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        {moment(attachment.sentAt).format('DD/MM/YYYY HH:mm')}
                      </Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        {attachment.sender.id === user?.id ? 'Vous' : attachment.sender.username}
                      </Text>
                    </div>
                  )}
                />
              ) : (
                <Empty description="Aucun fichier échangé" />
              )}
            </div>
          )}

          <div className="message-input-container">
            <div className="input-wrapper">
              <input
                type="file"
                id={`file-upload-${currentChat.partner.id}`}
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="*"
              />
              <label htmlFor={`file-upload-${currentChat.partner.id}`} className="attachment-button">
                <PaperClipOutlined style={{ fontSize: 18 }} />
              </label>
              
              <Input.TextArea
                value={messageInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="message-input"
              />
              
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={isSending}
                disabled={!messageInput.trim() && attachments.length === 0}
                className="send-button"
              />
            </div>

            {attachments.length > 0 && (
              <div className="attachment-preview">
                {attachments.map((file, index) => (
                  <div key={index} className="attachment-item">
                    <PaperClipOutlined className="attachment-icon" />
                    <span className="attachment-name">{file.name}</span>
                    <span className="attachment-size">{(file.size / 1024 / 1024).toFixed(2)}MB</span>
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

      <style jsx>{`
        .chat-window-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #fafafa;
        }

        .chat-tabs-header {
          padding: 8px 16px;
          background: #fff;
          border-bottom: 1px solid #f0f0f0;
        }

        .chat-header {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          background: #fff;
        }

        .chat-header-info {
          margin-left: 12px;
          flex: 1;
        }

        .messages-container {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #fafafa;
        }

        .message {
          margin-bottom: 16px;
          max-width: 80%;
          display: flex;
          flex-direction: column;
        }

        .message.received {
          align-self: flex-start;
        }

        .message.sent {
          align-self: flex-end;
        }

        .message-content {
          position: relative;
          padding: 8px 12px;
          border-radius: 6px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .message.sent .message-content {
          background: #e6f7ff;
        }

        .message-meta {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }

        .message-attachments {
          margin-top: 8px;
        }

        .attachment-item {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 4px;
          margin-top: 4px;
          gap: 8px;
        }

        .message-input-container {
          padding: 16px;
          border-top: 1px solid #f0f0f0;
          background: #fff;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .message-input {
          flex: 1;
        }

        .attachment-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.3s;
        }

        .attachment-button:hover {
          background-color: #f0f0f0;
        }

        .send-button {
          background-color: #a8b845;
          border-color: #a8b845;
          height: 32px;
          width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .attachment-preview {
          margin-top: 8px;
          padding: 8px;
          background: #f9f9f9;
          border-radius: 4px;
          border: 1px dashed #d9d9d9;
        }

        .attachment-item {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          margin: 4px 0;
          background: white;
          border-radius: 4px;
          border: 1px solid #f0f0f0;
        }

        .attachment-name {
          margin: 0 8px;
          flex-grow: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .attachment-size {
          color: #888;
          font-size: 12px;
          margin-right: 8px;
        }

        .attachment-remove {
          color: #ff4d4f;
        }

        .empty-chat {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          text-align: center;
        }

        .search-results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: #f0f0f0;
          margin-bottom: 8px;
        }

        .attachments-container {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;