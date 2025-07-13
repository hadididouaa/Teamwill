import React, { useContext, useRef, useState, useEffect } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { Avatar, Input, Button, List, Typography, Spin, message as antdMessage, Badge, Empty, Modal } from 'antd';
import { SendOutlined, UserOutlined, CheckOutlined, PaperClipOutlined, DeleteOutlined, CloseOutlined, VideoCameraOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { JitsiMeeting } from '@jitsi/react-sdk';
import callSound from '../assets/sounds/microsoft_teams_call.mp3';

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
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio
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

  // Handle incoming calls
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      try {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.error('Audio play failed:', e));
        }
        
        setIncomingCall({
          callerId: data.callerId,
          callerName: data.callerName,
          roomName: data.roomName,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error handling incoming call:', error);
      }
    };

    const handleCallAnswered = (data) => {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (data.answer) {
        setActiveCall({
          roomName: data.roomName,
          participants: [data.callerId, user.id],
          isInitiator: false
        });
        setShowVideoCallModal(true);
      } else {
        antdMessage.warning(`${data.callerName} declined the call`);
      }
      setIncomingCall(null);
    };

    const handleCallEnded = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setActiveCall(null);
      setShowVideoCallModal(false);
      setIncomingCall(null);
      antdMessage.info('Call ended');
    };

    socket.on('incoming_video_call', handleIncomingCall);
    socket.on('video_call_answer', handleCallAnswered);
    socket.on('video_call_ended', handleCallEnded);

    return () => {
      socket.off('incoming_video_call', handleIncomingCall);
      socket.off('video_call_answer', handleCallAnswered);
      socket.off('video_call_ended', handleCallEnded);
    };
  }, [socket, user]);

  const startVideoCall = async () => {
    try {
      if (!currentChat || !socket) return;

      const roomName = `video_call_${user.id}_${currentChat.partner.id}_${Date.now()}`;
      
      socket.emit('initiate_video_call', {
        receiverId: currentChat.partner.id,
        callerId: user.id,
        callerName: user.username,
        roomName
      });

      setActiveCall({
        roomName,
        participants: [user.id],
        isInitiator: true
      });
      setShowVideoCallModal(true);
    } catch (error) {
      console.error('Error starting video call:', error);
      antdMessage.error('Failed to start video call');
    }
  };

  const answerCall = (accept) => {
    if (!incomingCall || !socket) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    socket.emit('answer_video_call', {
      callerId: incomingCall.callerId,
      answer: accept,
      roomName: incomingCall.roomName,
      respondentName: user.username
    });

    if (accept) {
      setActiveCall({
        roomName: incomingCall.roomName,
        participants: [incomingCall.callerId, user.id],
        isInitiator: false
      });
      setShowVideoCallModal(true);
    }

    setIncomingCall(null);
  };

  const endCall = () => {
    if (!activeCall || !socket) return;

    socket.emit('end_video_call', {
      roomName: activeCall.roomName
    });

    setActiveCall(null);
    setShowVideoCallModal(false);
  };

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
    } catch (error) {
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
      antdMessage.error('Some files exceed the maximum size of 50MB');
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

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (socket && currentChat) {
      sendTypingStatus(!!e.target.value);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 3000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
  src={
    currentChat?.partner?.photo 
      ? `${axios.defaults.baseURL}/uploads/${currentChat.partner.photo}`
      : '/assets/img/user.png'
  }
  icon={<UserOutlined />}
/>
        </Badge>
        <div className="chat-header-info">
         <Text  strong style={{ paddingLeft: 24, paddingRight: 24 }}>
  {currentChat.partner.username.toUpperCase()}
</Text>
          <Text type="secondary">
            
            {onlineUsers.includes(currentChat.partner.id) ? ' Online' : ' Offline'}
          </Text>
          {typingStatus && (
            <Text type="secondary" style={{ fontStyle: 'italic', marginLeft: 8 }}>
              {typingStatus}
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

      <Modal
        title="Incoming Video Call"
        visible={!!incomingCall}
        onCancel={() => answerCall(false)}
        footer={[
          <Button key="decline" danger onClick={() => answerCall(false)}>
            Decline
          </Button>,
          <Button key="accept" type="primary" onClick={() => answerCall(true)} style={{ backgroundColor: '#a8b845', borderColor: '#a8b845' }}>
            Accept
          </Button>,
        ]}
      >
        {incomingCall && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
           <Avatar
  size="large"
  src={
    currentChat?.partner?.photo 
      ? `${axios.defaults.baseURL}/uploads/${currentChat.partner.photo}`
      : '/assets/img/user.png'
  }
  icon={<UserOutlined />}
/>
            <Text style={{ display: 'block', marginTop: 16, fontSize: 18 }}>
              {incomingCall.callerName} is calling
            </Text>
          </div>
        )}
      </Modal>

      {showVideoCallModal && activeCall && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          backgroundColor: 'white'
        }}>
          <Button 
            danger 
            onClick={endCall}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 1001
            }}
            icon={<CloseOutlined />}
          >
            End Call
          </Button>
          
          <JitsiMeeting
            roomName={activeCall.roomName}
            domain="jitsi.riot.im"
            configOverwrite={{
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableSimulcast: false,
              enableNoisyMicDetection: false,
              enableClosePage: false,
              prejoinPageEnabled: false,
              disableSelfViewSettings: false,
              defaultLanguage: 'en'
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              SHOW_CHROME_EXTENSION_BANNER: false,
              MOBILE_APP_PROMO: false,
              HIDE_INVITE_MORE_HEADER: true,
              TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
                'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
              ],
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              DEFAULT_BACKGROUND: '#f0f2f5',
              DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
              DEFAULT_LOCAL_DISPLAY_NAME: user.username
            }}
            userInfo={{
              displayName: user.username,
              email: user.email || ''
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