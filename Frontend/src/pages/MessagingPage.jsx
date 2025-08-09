import React, { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { Layout, List, Avatar, Typography, Badge, Spin, Tabs, Empty, Button } from 'antd';
import { UserOutlined, CommentOutlined, TeamOutlined, CloseOutlined } from '@ant-design/icons';
import ChatWindow from '../components/ChatWindow';
import DashboardLayout from '../layouts/DashboardLayout';
import './MessagingPage.css';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

import MessageSearch from '../components/MessageSearch';
import MessageAttachments from '../components/MessageAttachments';

const MessagingPage = () => {
  const {
    user,
    conversations,
    openChats,
    setOpenChats,
    currentChat,
    setCurrentChat,
    loading,
    psychologists,
    collaborators,
    onlineUsers,
    fetchConversations,
    fetchMessages,
    startNewChat,
    getPsychologists,
    getCollaborators, // Ajouté depuis le contexte
  } = useContext(ChatContext);

  const [activeTab, setActiveTab] = useState('conversations');
  const [initialLoad, setInitialLoad] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setInitialLoad(true);
        
        // Charger les conversations en premier
        await fetchConversations();
        
        // Déterminer l'onglet actif et charger les données correspondantes
        const tab = user.roleUtilisateur === 'Collaborateur' ? 'psychologists' : 'collaborators';
        setActiveTab(tab);
        
        if (tab === 'psychologists') {
          await getPsychologists();
        } else {
          await getCollaborators();
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setInitialLoad(false);
      }
    };

    loadData();
  }, [user, fetchConversations, getPsychologists, getCollaborators]);

  const initiateChat = async (partner) => {
    if (!partner) return;

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
    }
  };

  const renderContactItem = (item, isConversation = false) => {
    const contact = isConversation ? item.partner : item;
    const isOnline = onlineUsers.includes(contact.id);

    return (
      <List.Item
        className={`contact-item ${currentChat?.partner?.id === contact.id ? 'active' : ''}`}
        onClick={() => initiateChat(contact)}
      >
        <List.Item.Meta
          avatar={
            <Badge dot color={isOnline ? '#52c41a' : '#f5222d'} offset={[-5, 20]}>
              <Avatar
                src={contact.photo ? `${API_URL}/Uploads/${contact.photo}` : '/assets/img/user.png'}
                icon={<UserOutlined />}
                size="default"
                style={{ width: 32, height: 32 }}
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
      label: <><CommentOutlined /> Conversations</>,
      children: initialLoad ? (
        <Spin tip="Loading conversations..." />
      ) : conversations.length > 0 ? (
        <List 
          dataSource={conversations} 
          renderItem={(item) => renderContactItem(item, true)} 
        />
      ) : (
        <Empty description="No conversations" />
      ),
    },
    ...(user?.roleUtilisateur === 'Collaborateur'
      ? [{
          key: 'psychologists',
          label: <><TeamOutlined /> Psychologists</>,
          children: initialLoad ? (
            <Spin tip="Loading psychologists..." />
          ) : psychologists.length > 0 ? (
            <List 
              dataSource={psychologists} 
              renderItem={(item) => renderContactItem(item)} 
            />
          ) : (
            <Empty description="No psychologists available" />
          ),
        }]
      : []),
    ...(user?.roleUtilisateur === 'Psychologue'
      ? [{
          key: 'collaborators',
          label: <><UserOutlined /> Collaborators</>,
          children: initialLoad ? (
            <Spin tip="Loading collaborators..." />
          ) : collaborators.length > 0 ? (
            <List 
              dataSource={collaborators} 
              renderItem={(item) => renderContactItem(item)} 
            />
          ) : (
            <Empty description="No collaborators available" />
          ),
        }]
      : []),
       {
      key: 'search',
      label: 'Recherche',
      children: <MessageSearch onSelectMessage={handleMessageSelect} />,
    },
    {
      key: 'attachments',
      label: 'Pièces jointes',
      children: <MessageAttachments />,
    }
  ];

  const handleMessageSelect = (message) => {
    // Trouver ou créer la conversation
    const partnerId = message.senderId === user.id ? message.receiverId : message.senderId;
    initiateChat({ id: partnerId });
    // Vous pourriez aussi vouloir faire défiler jusqu'au message sélectionné
    // ou afficher un aperçu du message dans la fenêtre de chat   
  };

  return (
    <DashboardLayout>
      <Layout className="messaging-layout">
        <Sider width={300} className="messaging-sider">
          <div className="messaging-header">
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              Messaging
            </Title>
          </div>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            items={tabItems} 
            className="messaging-tabs" 
          />
        </Sider>
        <Content className="messaging-content">
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
                <Text strong>{chat.partner.username}</Text>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenChats((prev) => prev.filter((c) => c.partner.id !== chat.partner.id));
                    if (currentChat?.partner.id === chat.partner.id) {
                      setCurrentChat(null);
                    }
                  }}
                  style={{ marginLeft: 'auto' }}
                />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <ChatWindow currentChat={chat} embedded />
              </div>
            </div>
          ))}
          {!currentChat && (
            <div className="empty-chat">
              <Title level={3}>Select a conversation</Title>
              <Text type="secondary">
                {user?.roleUtilisateur === 'Collaborateur'
                  ? 'Choose a psychologist to chat with'
                  : 'Choose a collaborator to chat with'}
              </Text>
            </div>
          )}
        </Content>
      </Layout>
    </DashboardLayout>
  );
};

export default MessagingPage;