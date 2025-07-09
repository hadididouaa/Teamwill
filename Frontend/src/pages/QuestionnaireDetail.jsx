import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { Button, Card, Descriptions, Divider, List, Badge, Space, Typography, message } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const QuestionnaireDetail = () => {
  const { id } = useParams();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/questionnaires/${id}`, {
          withCredentials: true
        });
        setQuestionnaire(response.data);
      } catch (error) {
        message.error(error.response?.data?.message || 'Failed to fetch questionnaire');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [id]);

  if (loading) {
    return <DashboardLayout>Loading...</DashboardLayout>;
  }

  if (!questionnaire) {
    return <DashboardLayout>Questionnaire not found</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <Card 
        title={
          <Space>
            <Link to="/QuestionnaireList">
              <Button icon={<ArrowLeftOutlined />} />
            </Link>
            <Title level={4} style={{ margin: 0 }}>{questionnaire.title}</Title>
          </Space>
        }
        extra={
        <Link to={`/questionnaires/${id}/edit`}>
  <Button type="primary" icon={<EditOutlined />}  style={{ 
      backgroundColor: '#000000', 
      borderColor: '#000000',
      color: '#fff' // Texte blanc pour meilleur contraste
    }}>
    Edit
  </Button>
</Link>
        }
        style={{ borderColor: '#a8b845', borderWidth: 2 }}
        headStyle={{ backgroundColor: '#a8b845', color: 'white' }}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Description">
            {questionnaire.description || 'No description'}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Badge 
              status={questionnaire.isActive ? 'success' : 'error'} 
              text={questionnaire.isActive ? 'Active' : 'Inactive'} 
            />
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            {questionnaire.createdBy}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(questionnaire.createdAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Questions ({questionnaire.questions?.length || 0})</Divider>

        <List
          itemLayout="vertical"
          dataSource={questionnaire.questions || []}
          renderItem={(question, qIndex) => (
            <List.Item key={question.id}>
              <Card title={`Question ${qIndex + 1}`} size="small">
                <Text strong>{question.text}</Text>
                <Divider orientation="left" plain>Options</Divider>
                <List
                  dataSource={question.options || []}
                  renderItem={(option) => (
                    <List.Item>
                      <Space>
                        <Text>{option.text}</Text>
                        <Text type="secondary">(Score: {option.score})</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </List.Item>
          )}
        />

        <Divider orientation="left">Analyses</Divider>

        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={questionnaire.analyses || []}
          renderItem={(analysis) => (
            <List.Item>
              <Card title={analysis.title}>
                <Text strong>Score Range:</Text> {analysis.minScore} - {analysis.maxScore}
                <Divider />
                <Text strong>Description:</Text>
                <p>{analysis.description}</p>
                <Divider />
                <Text strong>Recommendations:</Text>
                <p>{analysis.recommendations}</p>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </DashboardLayout>
  );
};

export default QuestionnaireDetail;
