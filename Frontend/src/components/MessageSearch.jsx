// src/components/MessageSearch.jsx
import React, { useState, useEffect } from 'react';
import { Input, List, Typography, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useChatContext } from '../contexts/ChatContext';

const { Text } = Typography;

const MessageSearch = ({ onSelectMessage }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { searchMessages } = useChatContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const messages = await searchMessages(query);
      setResults(messages);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="message-search">
      <Input
        placeholder="Rechercher des messages..."
        prefix={<SearchOutlined />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        allowClear
      />
      
      {loading ? (
        <Spin style={{ marginTop: 16 }} />
      ) : results.length > 0 ? (
        <List
          dataSource={results}
          renderItem={(message) => (
            <List.Item 
              onClick={() => onSelectMessage(message)}
              style={{ cursor: 'pointer', padding: '12px 16px' }}
            >
              <List.Item.Meta
                title={
                  <Text>
                    {message.sender.id === message.receiverId ? 'Vous' : message.sender.username} → 
                    {message.receiver.id === message.senderId ? 'Vous' : message.receiver.username}
                  </Text>
                }
                description={
                  <>
                    <Text ellipsis>{message.content}</Text>
                    <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                      {new Date(message.createdAt).toLocaleString()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
          style={{ marginTop: 16 }}
        />
      ) : query ? (
        <Empty description="Aucun résultat trouvé" style={{ marginTop: 16 }} />
      ) : null}
    </div>
  );
};

export default MessageSearch;