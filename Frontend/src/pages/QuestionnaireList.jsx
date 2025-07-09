import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from "../layouts/DashboardLayout";
import { Button, Card, Table, Badge, Modal, message, ConfigProvider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

// Style personnalisé avec votre couleur
const customTheme = {
  token: {
    colorPrimary: '#a8b845',
  },
};

const QuestionnaireList = () => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  const fetchQuestionnaires = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/questionnaires`, {
        withCredentials: true
      });
      setQuestionnaires(response.data);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to fetch questionnaires');
      console.error('Fetch error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/questionnaires/${selectedId}`, {
        withCredentials: true
      });
      message.success('Questionnaire deleted successfully');
      setModalVisible(false);
      fetchQuestionnaires();
    } catch (error) {
      message.error('Failed to delete questionnaire');
    }
  };

 const toggleActivation = async (id, currentStatus) => {
  try {
    await axios.patch(
      `${import.meta.env.VITE_API_URL}/questionnaires/${id}/toggle`, 
      {}, // Empty body
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // If using token auth
        }
      }
    );
    message.success(`Questionnaire ${!currentStatus ? 'activated' : 'deactivated'}`);
    fetchQuestionnaires();
  } catch (error) {
    message.error('Failed to toggle questionnaire status');
    console.error('Toggle error:', error);
  }
};

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/questionnaires/${record.id}`} style={{ color: '#a8b845' }}>
          {text}
        </Link>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive) => (
        <Badge 
          color={isActive ? '#a8b845' : '#ff4d4f'}
          text={isActive ? 'Active' : 'Inactive'} 
        />
      )
    },
    {
      title: 'Questions',
      key: 'questionsCount',
      render: (_, record) => record.questions?.length || 0
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => window.location.href = `/questionnaires/${record.id}`}
            style={{ backgroundColor: '#a8b845', borderColor: '#a8b845' }}
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => window.location.href = `/questionnaires/${record.id}/edit`}
            style={{ color: '#a8b845', borderColor: '#a8b845' }}
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => {
              setSelectedId(record.id);
              setModalVisible(true);
            }}
          />
          <Button 
            onClick={() => toggleActivation(record.id, record.isActive)}
            style={{ 
              color: record.isActive ? '#a8b845' : '#ff4d4f',
              borderColor: record.isActive ? '#a8b845' : '#ff4d4f'
            }}
          >
            {record.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      )
    }
  ];

  return (
    <ConfigProvider theme={customTheme}>
      <DashboardLayout>
        <Card 
          title="Questionnaires" 
          headStyle={{ backgroundColor: '#a8b845', color: 'white' }}
          style={{ borderColor: '#a8b845', borderWidth: 2 }}
          extra={
            <Link to="/questionnaires/create">
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                style={{ 
      backgroundColor: '#000000', 
      borderColor: '#000000',
      color: '#fff' // Texte blanc pour meilleur contraste
    }}
              >
                Create Questionnaire
              </Button>
            </Link>
          }
        >
          <Table 
            columns={columns} 
            dataSource={questionnaires} 
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            rowClassName={() => 'custom-row-style'}
          />

          <Modal
            title="Confirm Delete"
            visible={modalVisible}
            onOk={handleDelete}
            onCancel={() => setModalVisible(false)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ 
              danger: true,
              style: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' } 
            }}
            cancelButtonProps={{
              style: { color: '#a8b845', borderColor: '#a8b845' }
            }}
          >
            <p>Are you sure you want to delete this questionnaire?</p>
          </Modal>
        </Card>
      </DashboardLayout>
    </ConfigProvider>
  );
};

export default QuestionnaireList;