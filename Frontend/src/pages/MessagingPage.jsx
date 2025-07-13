import React, { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { Layout, List, Avatar, Typography, Badge, Spin, Tabs, Empty } from 'antd';
import { UserOutlined, CommentOutlined, TeamOutlined } from '@ant-design/icons';
import ChatWindow from '../components/ChatWindow';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import './MessagingPage.css';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const MessagingPage = () => {
  const {
    user,
    conversations,
    currentChat,
    loading,
    psychologists,
    collaborators,
    onlineUsers,
    fetchConversations,
    fetchMessages,
    setCurrentChat,
    sendMessage,
    deleteMessage,
    markAsRead,
    startNewChat
  } = useContext(ChatContext);

  const [activeTab, setActiveTab] = useState('conversations');

  useEffect(() => {
    if (user) {
      setActiveTab(user.roleUtilisateur === 'Collaborateur' ? 'psychologists' : 'collaborators');
    }
  }, [user]);

  const initiateChat = async (partner) => {
    if (!partner) return;
    
    try {
      const existingConv = conversations.find(conv => conv.partner.id === partner.id);
      if (existingConv) {
        setCurrentChat(existingConv);
        await fetchMessages(partner.id);
      } else {
        await startNewChat(partner.id);
      }
      console.log('Initiated chat with:', partner.id);
    } catch (error) {
      console.error('Erreur initiation chat:', error);
      antdMessage.error('Erreur lors du démarrage de la conversation');
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
            <Badge 
              dot 
              color={isOnline ? '#52c41a' : '#f5222d'} 
              offset={[-5, 30]}
            >
              <Avatar 
  src={
    contact.photo 
      ? `${axios.defaults.baseURL}/uploads/${contact.photo}`
      : '/assets/img/user.png'
  } 
  icon={<UserOutlined />} 
/>
            </Badge>
          }
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text strong>{contact.username}</Text>
              <Text 
                type={isOnline ? 'success' : 'secondary'} 
                style={{ fontSize: 12, marginLeft: 8 }}
              >
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </div>
          }
          description={
            isConversation ? (
              <Text ellipsis>{item.lastMessage?.content || 'Aucun message'}</Text>
            ) : (
              <Text type="secondary">{contact.roleUtilisateur}</Text>
            )
          }
        />
        {isConversation && item.unreadCount > 0 && (
          <Badge count={item.unreadCount} />
        )}
      </List.Item>
    );
  };

  const tabItems = [
    {
      key: 'conversations',
      label: <><CommentOutlined /> Conversations</>,
      children: loading ? <Spin /> : (
        conversations.length > 0 ? (
          <List
            dataSource={conversations}
            renderItem={(item) => renderContactItem(item, true)}
          />
        ) : (
          <Empty description="No conversations" />
        )
      )
    },
    ...(user?.roleUtilisateur === 'Collaborateur' ? [{
      key: 'psychologists',
      label: <><TeamOutlined /> Psychologues</>,
      children: (
        psychologists.length > 0 ? (
          <List
            dataSource={psychologists}
            renderItem={(item) => renderContactItem(item)}
          />
        ) : (
          <Empty description="No psychologists available" />
        )
      )
    }] : []),
    ...(user?.roleUtilisateur === 'Psychologue' ? [{
      key: 'collaborators',
      label: <><UserOutlined /> Collaborateurs</>,
      children: (
        collaborators.length > 0 ? (
          <List
            dataSource={collaborators}
            renderItem={(item) => renderContactItem(item)}
          />
        ) : (
          <Empty description="No collaborators available" />
        )
      )
    }] : [])
  ];

  return (
    <DashboardLayout>
      <Layout className="messaging-layout">
        <Sider width={300} className="messaging-sider">
          <div className="messaging-header">
            <Title level={4} style={{ color: 'white', margin: 0 }}>Messaging</Title>
          </div>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="messaging-tabs"
          />
        </Sider>
        <Content className="messaging-content">
          {currentChat ? (
            <ChatWindow 
              currentChat={currentChat}
              onSendMessage={sendMessage}
              onDeleteMessage={deleteMessage}
              onMarkAsRead={markAsRead}
            />
          ) : (
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