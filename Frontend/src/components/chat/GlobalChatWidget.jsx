// frontend/src/components/GlobalChatWidget.jsx
import React, { useState, useEffect } from 'react';
import { Button, Badge, Drawer, Avatar, List, Tabs, Typography, Spin, Empty } from 'antd';
import { MessageOutlined, CloseOutlined, UserOutlined, TeamOutlined, CommentOutlined, MinusOutlined } from '@ant-design/icons';
import { useChatContext } from '../../contexts/ChatContext';
import ChatWindow from '../ChatWindow';

const { Text } = Typography;

const GlobalChatWidget = () => {
  const {
    user,
    conversations,
    openChats,
    setOpenChats,
    currentChat,
    setCurrentChat,
    psychologists,
    collaborators,
    onlineUsers,
    fetchMessages,
    startNewChat,
  } = useChatContext();

  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('conversations');
  const [loadingChat, setLoadingChat] = useState(false);
  const [minimizedChats, setMinimizedChats] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const unreadCount = conversations.reduce((count, conv) => count + conv.unreadCount, 0);

  const toggleChat = () => {
    setVisible(!visible);
  };

  const initiateChat = async (partner) => {
    if (!partner) return;

    setLoadingChat(true);
    try {
      const existingConv = conversations.find((conv) => conv.partner.id === partner.id);
      if (existingConv) {
        if (!openChats.some((chat) => chat.partner.id === partner.id)) {
          setOpenChats((prev) => [...prev, existingConv]);
        }
        setCurrentChat(existingConv);
        await fetchMessages(partner.id);
      } else {
        const newChat = await startNewChat(partner.id);
        setOpenChats((prev) => [...prev, newChat]);
        setCurrentChat(newChat);
      }
    } catch (error) {
      console.error('Error initiating chat:', error);
    } finally {
      setLoadingChat(false);
    }
  };

  const closeChat = (partnerId) => {
    setOpenChats((prev) => prev.filter((chat) => chat.partner.id !== partnerId));
    setMinimizedChats((prev) => prev.filter((chat) => chat.partner.id !== partnerId));
    if (currentChat?.partner.id === partnerId) {
      setCurrentChat(null);
    }
  };

  const minimizeChat = (chat) => {
    setOpenChats((prev) => prev.filter((c) => c.partner.id !== chat.partner.id));
    setMinimizedChats((prev) => [...prev, chat]);
    if (currentChat?.partner.id === chat.partner.id) {
      setCurrentChat(null);
    }
  };

  const restoreChat = (chat) => {
    setMinimizedChats((prev) => prev.filter((c) => c.partner.id !== chat.partner.id));
    setOpenChats((prev) => [...prev, chat]);
    setCurrentChat(chat);
  };

  const renderContactItem = (item, isConversation = false) => {
    const contact = isConversation ? item.partner : item;
    const isOnline = onlineUsers.includes(contact.id);

    return (
      <List.Item
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          backgroundColor: currentChat?.partner?.id === contact.id ? '#f5f5f5' : 'transparent',
          borderBottom: '1px solid #f0f0f0',
        }}
        onClick={() => initiateChat(contact)}
      >
        <List.Item.Meta
          avatar={
         // Remplacer les avatars existants par ceci :
<Badge dot color={isOnline ? '#52c41a' : '#f5222d'} offset={[-5, 20]}>
  <Avatar
    src={contact.photo ? `${API_URL}/Uploads/${contact.photo}` : '/assets/img/user.png'}
    icon={<UserOutlined />}
    size="small" // Changé de "default" à "small"
    style={{ width: 30, height: 30 }} // Réduction de la taille
    className="avatar-img"
  />
</Badge>
          }
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text strong>{contact.username}</Text>
              <Text type={isOnline ? 'success' : 'secondary'} style={{ fontSize: 12, marginLeft: 8 }}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </div>
          }
          description={
            isConversation ? (
              <Text ellipsis>{item.lastMessage?.content || 'No messages'}</Text>
            ) : (
              <Text type="secondary">{contact.roleUtilisateur}</Text>
            )
          }
        />
        {isConversation && item.unreadCount > 0 && <Badge count={item.unreadCount} />}
      </List.Item>
    );
  };

  const tabItems = [
    {
      key: 'conversations',
      label: (
        <>
          <CommentOutlined /> Conversations
        </>
      ),
      children: conversations.length > 0 ? (
        <List dataSource={conversations} renderItem={(item) => renderContactItem(item, true)} />
      ) : (
        <Empty description="No conversations" />
      ),
    },
    ...(user?.roleUtilisateur === 'Collaborateur'
      ? [
          {
            key: 'psychologists',
            label: (
              <>
                <TeamOutlined /> Psychologues
              </>
            ),
            children: psychologists.length > 0 ? (
              <List dataSource={psychologists} renderItem={(item) => renderContactItem(item)} />
            ) : (
              <Empty description="No psychologists available" />
            ),
          },
        ]
      : []),
    ...(user?.roleUtilisateur === 'Psychologue'
      ? [
          {
            key: 'collaborators',
            label: (
              <>
                <UserOutlined /> Collaborateurs
              </>
            ),
            children: collaborators.length > 0 ? (
              <List dataSource={collaborators} renderItem={(item) => renderContactItem(item)} />
            ) : (
              <Empty description="No collaborators available" />
            ),
          },
        ]
      : []),
  ];

  const renderMinimizedChats = () => {
    return minimizedChats.map((chat) => (
      <div
        key={chat.partner.id}
        className="minimized-chat-tab"
        style={{
          position: 'fixed',
          bottom: 24 + minimizedChats.indexOf(chat) * 60,
          right: 300,
          zIndex: 1001,
          width: 200,
          backgroundColor: '#fff',
          border: '1px solid #d9d9d9',
          borderRadius: '4px 4px 0 0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
        onClick={() => restoreChat(chat)}
      >
       
        <Text style={{ marginLeft: 8, flex: 1 }} ellipsis>
          {chat.partner.username}
        </Text>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            closeChat(chat.partner.id);
          }}
        />
      </div>
    ));
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Badge count={unreadCount} overflowCount={9}>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={visible ? <CloseOutlined /> : <MessageOutlined />}
            onClick={toggleChat}
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              backgroundColor: '#a8b845',
              borderColor: '#a8b845',
            }}
          />
        </Badge>
      </div>

      {renderMinimizedChats()}

      <Drawer
        title="Messagerie"
        placement="right"
        onClose={toggleChat}
        open={visible}
        width={350}
        styles={{
          header: { padding: '16px 24px' },
          body: {
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        closable={true}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} tabBarStyle={{ padding: '0 16px' }} />
      </Drawer>

      {openChats.map((chat, index) => (
        <div
          key={chat.partner.id}
          className="floating-chat-window"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 400 + index * 20,
            width: 350,
            height: 500,
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1001 + index,
            transform: `translateX(${index * -20}px)`,
            transition: 'all 0.3s ease',
          }}
          onClick={() => setCurrentChat(chat)}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#fafafa',
            }}
          >
            <Avatar
              src={chat.partner.photo ? `${API_URL}/Uploads/${chat.partner.photo}` : '/assets/img/user.png'}
              icon={<UserOutlined />}
              size="small"
              className="avatar-img"
            />
            <Text strong style={{ marginLeft: 8, flex: 1 }}>
              {chat.partner.username}
            </Text>
            <Button
              type="text"
              icon={<MinusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                minimizeChat(chat);
              }}
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                closeChat(chat.partner.id);
              }}
            />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ChatWindow currentChat={chat} embedded />
          </div>
        </div>
      ))}
    </>
  );
};

export default GlobalChatWidget;