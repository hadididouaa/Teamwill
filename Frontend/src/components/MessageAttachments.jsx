// src/components/MessageAttachments.jsx
import React, { useState, useEffect } from 'react';
import { List, Typography, Spin, Empty, Tabs, Button } from 'antd';
import { PaperClipOutlined, DownloadOutlined } from '@ant-design/icons';
import { useChatContext } from '../contexts/ChatContext';

const { Text } = Typography;
const { TabPane } = Tabs;

const MessageAttachments = () => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { getAllAttachments } = useChatContext();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        setLoading(true);
        const data = await getAllAttachments();
        setAttachments(data);
      } catch (error) {
        console.error('Error fetching attachments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttachments();
  }, []);

  const filteredAttachments = attachments.filter(attachment => {
    if (activeTab === 'images') {
      return attachment.mimetype.startsWith('image/');
    } else if (activeTab === 'documents') {
      return attachment.mimetype.includes('pdf') || 
             attachment.mimetype.includes('word') || 
             attachment.mimetype.includes('excel');
    }
    return true;
  });

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = `${API_URL}${url}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="message-attachments">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Tous" key="all" />
        <TabPane tab="Images" key="images" />
        <TabPane tab="Documents" key="documents" />
      </Tabs>

      {loading ? (
        <Spin style={{ marginTop: 16 }} />
      ) : filteredAttachments.length > 0 ? (
        <List
          dataSource={filteredAttachments}
          renderItem={(attachment) => (
            <List.Item>
              <List.Item.Meta
                avatar={<PaperClipOutlined style={{ fontSize: 24 }} />}
                title={
                  <a 
                    href={`${API_URL}${attachment.path}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {attachment.filename}
                  </a>
                }
                description={
                  <>
                    <Text type="secondary">
                      {attachment.sender.username} → {attachment.receiver.username}
                    </Text>
                    <Text type="secondary" style={{ display: 'block' }}>
                      {new Date(attachment.sentAt).toLocaleString()}
                    </Text>
                  </>
                }
              />
              <Button
                icon={<DownloadOutlined />}
                onClick={() => downloadFile(attachment.path, attachment.filename)}
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Aucune pièce jointe trouvée" />
      )}
    </div>
  );
};

export default MessageAttachments;