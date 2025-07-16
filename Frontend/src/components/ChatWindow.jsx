// frontend/src/components/ChatWindow.jsx
import React, { useContext, useRef, useState, useEffect } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { Avatar, Input, Button, List, Typography, Spin, notification, Badge, Empty } from 'antd';
import { SendOutlined, UserOutlined, CheckOutlined, PaperClipOutlined, DeleteOutlined, CloseOutlined, VideoCameraOutlined } from '@ant-design/icons';
import moment from 'moment';
import { JitsiMeeting } from '@jitsi/react-sdk';
import callSound from '../assets/sounds/microsoft_teams_call.mp3';

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
    setMessages,
  } = useContext(ChatContext);

  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const audioRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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
const startVideoCall = async () => {
  try {
    if (!currentChat || !socket || !isConnected) {
      notification.error({ message: 'Cannot start call: Missing data or socket not connected' });
      return;
    }

    const roomName = `video_call_${user.id}_${currentChat.partner.id}_${Date.now()}`;
    const callTimeout = 30000; // 30 seconds timeout

    // Start the call
    socket.emit('initiate_video_call', {
      receiverId: currentChat.partner.id,
      callerName: user.username,
      callerPhoto: user.photo || null,
      roomName,
    });

    // Set timeout for unanswered call
    const timeoutId = setTimeout(() => {
      if (!currentChat.activeCall?.roomName === roomName) {
        notification.warning({ message: 'Call not answered' });
        socket.emit('end_video_call', { roomName });
      }
    }, callTimeout);

    // Update chat with call info
    setCurrentChat(prev => ({
      ...prev,
      activeCall: { 
        roomName, 
        isInitiator: true,
        timeoutId 
      },
    }));

  } catch (error) {
    console.error('Error starting video call:', error);
    notification.error({ message: 'Failed to start video call' });
  }
};
console.log('Current chat active call:', currentChat.activeCall);
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

    unreadMessages.forEach((msg) => {
      markAsRead(msg.id);
    });
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
        <Badge dot color={onlineUsers.includes(currentChat.partner.id) ? '#52c41a' : '#f5222d'} offset={[-5, 20]}>
  <Avatar
    size="default" // Changé de "large" à "default"
    src={currentChat.partner.photo ? `${API_URL}/Uploads/${currentChat.partner.photo}` : '/assets/img/user.png'}
    icon={<UserOutlined />}
    style={{ width: 32, height: 32 }} // Réduction de la taille
    className="avatar-img"
  />
</Badge>
        <div className="chat-header-info">
          <Text strong style={{ paddingLeft: 24, paddingRight: 24 }}>
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
            onClick={startVideoCall}
            style={{ marginLeft: 'auto', backgroundColor: '#a8b845', borderColor: '#a8b845' }}
          >
            Video Call
          </Button>
        )}
      </div>

      {currentChat.activeCall && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: 'white',
          }}
        >
          <Button
            danger
            onClick={() => {
              socket.emit('end_video_call', { roomName: currentChat.activeCall.roomName });
            }}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 1001,
            }}
            icon={<CloseOutlined />}
          >
            End Call
          </Button>
          <JitsiMeeting
            roomName={currentChat.activeCall.roomName}
         domain="jitsi.riot.im"
configOverwrite={{
  startWithAudioMuted: false,
  startWithVideoMuted: false,
  disableSimulcast: false,
  enableNoisyMicDetection: false,
  enableClosePage: false,
  prejoinPageEnabled: false,
  disableSelfViewSettings: false,
  defaultLanguage: 'en',
}}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              SHOW_CHROME_EXTENSION_BANNER: false,
              MOBILE_APP_PROMO: false,
              HIDE_INVITE_MORE_HEADER: true,
              TOOLBAR_BUTTONS: [
                'microphone',
                'camera',
                'closedcaptions',
                'desktop',
                'fullscreen',
                'fodeviceselection',
                'hangup',
                'profile',
                'info',
                'chat',
                'recording',
                'livestreaming',
                'etherpad',
                'sharedvideo',
                'settings',
                'raisehand',
                'videoquality',
                'filmstrip',
                'invite',
                'feedback',
                'stats',
                'shortcuts',
                'tileview',
                'videobackgroundblur',
                'download',
                'help',
                'mute-everyone',
              ],
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              DEFAULT_BACKGROUND: '#f0f2f5',
              DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
              DEFAULT_LOCAL_DISPLAY_NAME: user.username,
            }}
            userInfo={{
              displayName: user.username,
              email: user.email || '',
            }}
            onApiReady={(externalApi) => {
              console.log('Jitsi API ready', externalApi);
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = '100vh';
              iframeRef.style.width = '100%';
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="messages-container">
            {messages[currentChat.partner.id]?.length === 0 ? (
              <Empty description="No messages in this conversation" />
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
                id={`file-upload-${currentChat.partner.id}`}
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="*"
              />
              <label htmlFor={`file-upload-${currentChat.partner.id}`} className="attachment-button">
                <PaperClipOutlined />
              </label>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={isSending}
                disabled={!messageInput.trim() && attachments.length === 0}
                style={{ backgroundColor: '#a8b845', borderColor: '#a8b845' }}
              >
                Send
              </Button>
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
    </div>
  );
};

export default ChatWindow;