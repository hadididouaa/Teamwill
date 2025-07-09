import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, List, Button, Typography, Spin } from 'antd';
import DashboardLayout from "../layouts/DashboardLayout";

const { Title, Text } = Typography;

const greenTheme = {
  primary: '#a8b845',
  secondary: '#8a9a35',
  light: '#f0f4e8',
  text: '#333'
};

const QuestionnaireListPage = () => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/questionnaires`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setQuestionnaires(data);
      } catch (error) {
        console.error("Erreur de chargement", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div style={{ padding: '24px' }}>
        <Title level={2} style={{ color: greenTheme.primary, marginBottom: '24px' }}>
          Questionnaires Disponibles
        </Title>
        
        {loading ? (
          <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />
        ) : (
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={questionnaires}
            renderItem={(questionnaire) => (
              <List.Item>
                <Card 
                  title={<span style={{ color: greenTheme.primary }}>{questionnaire.title}</span>}
                  headStyle={{ 
                    backgroundColor: greenTheme.light,
                    borderBottom: `2px solid ${greenTheme.primary}`,
                    borderRadius: '8px 8px 0 0'
                  }}
                  style={{ 
                    border: `1px solid ${greenTheme.primary}`,
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  actions={[
                    <Link to={`/questionnaires/${questionnaire.id}/respond`}>
                      <Button 
                        type="primary"
                        style={{
                          backgroundColor: greenTheme.primary,
                          borderColor: greenTheme.secondary,
                          width: '100%'
                        }}
                      >
                        Répondre au questionnaire
                      </Button>
                    </Link>
                  ]}
                >
                  <Text style={{ color: greenTheme.text }}>
                    {questionnaire.description}
                  </Text>
                  <div style={{ marginTop: '16px' }}>
                    <Text strong style={{ color: greenTheme.primary }}>
                      Nombre de questions: 
                    </Text>
                    <Text> {questionnaire.questions?.length || 0}</Text>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuestionnaireListPage;