import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Radio, Button, Card, Typography, Spin, Result, message } from 'antd';
import DashboardLayout from "../layouts/DashboardLayout";
import axios from 'axios';

const { Title, Text } = Typography;

const greenTheme = {
  primary: '#a8b845',
  secondary: '#8a9a35',
  light: '#f0f4e8',
  text: '#333'
};

const QuestionnaireResponsePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/questionnaires/${id}`,
          { withCredentials: true }
        );
        setQuestionnaire(response.data);
      } catch (error) {
        console.error("Erreur de chargement", error);
        message.error("Impossible de charger le questionnaire");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [id]);

const handleSubmit = async (values) => {
  setSubmitting(true);
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/questionnaires/${id}/responses`,
      {
        answers: values.answers
      },
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    if (response.data.success) {
      setResult(response.data);
    } else {
      console.error('Server responded with error:', response.data);
      message.error(response.data.message || "Erreur lors du traitement des réponses");
    }
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    const errorMsg = error.response?.data?.message || 
                    error.message || 
                    "Erreur lors de l'envoi des réponses";
    message.error(errorMsg);
  } finally {
    setSubmitting(false);
  }
};
  if (loading) return (
    <DashboardLayout>
      <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
    </DashboardLayout>
  );
  
  if (!questionnaire) return (
    <DashboardLayout>
      <Result
        status="404"
        title="Questionnaire non trouvé"
        subTitle="Le questionnaire que vous cherchez n'existe pas ou a été supprimé."
        extra={
          <Button 
            type="primary" 
            onClick={() => navigate('/questionnaires')}
            style={{
              backgroundColor: greenTheme.primary,
              borderColor: greenTheme.secondary
            }}
          >
            Retour à la liste
          </Button>
        }
      />
    </DashboardLayout>
  );

  if (result) {
    return (
      <DashboardLayout>
        <Card 
          style={{ 
            maxWidth: '800px', 
            margin: '40px auto',
            border: `1px solid ${greenTheme.primary}`,
            borderRadius: '8px'
          }}
          headStyle={{
            backgroundColor: greenTheme.light,
            borderBottom: `2px solid ${greenTheme.primary}`,
            borderRadius: '8px 8px 0 0'
          }}
        >
          <Result
            status="success"
            title="Merci pour vos réponses !"
            subTitle={`Votre score total: ${result.totalScore}`}
            extra={[
              <Button 
                key="back" 
                onClick={() => navigate('/questionnaires')}
                style={{
                  backgroundColor: greenTheme.primary,
                  borderColor: greenTheme.secondary
                }}
              >
                Retour aux questionnaires
              </Button>
            ]}
          />
          
          {result.analysis && (
            <div style={{ marginTop: '24px' }}>
              <Title level={4} style={{ color: greenTheme.primary }}>
                Analyse:
              </Title>
              <Card 
                title={result.analysis.title}
                style={{ border: `1px solid ${greenTheme.primary}` }}
                headStyle={{
                  backgroundColor: greenTheme.light,
                  borderBottom: `1px solid ${greenTheme.primary}`
                }}
              >
                <Text>{result.analysis.description}</Text>
                {result.analysis.recommendations && (
                  <>
                    <Title level={5} style={{ 
                      marginTop: '16px', 
                      color: greenTheme.primary 
                    }}>
                      Recommandations:
                    </Title>
                    <Text>{result.analysis.recommendations}</Text>
                  </>
                )}
              </Card>
            </div>
          )}
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <Card
          title={
            <Title level={2} style={{ color: greenTheme.primary }}>
              {questionnaire.title}
            </Title>
          }
          style={{ 
            border: `1px solid ${greenTheme.primary}`,
            borderRadius: '8px'
          }}
          headStyle={{
            backgroundColor: greenTheme.light,
            borderBottom: `2px solid ${greenTheme.primary}`,
            borderRadius: '8px 8px 0 0'
          }}
        >
          <Text style={{ fontSize: '16px', marginBottom: '24px' }}>
            {questionnaire.description}
          </Text>

          <Form form={form} onFinish={handleSubmit} layout="vertical">
            {questionnaire.questions?.map((question, index) => (
              <Form.Item
                key={question.id}
                name={['answers', question.id]}
                label={
                  <Text strong style={{ color: greenTheme.primary, fontSize: '16px' }}>
                    {`${index + 1}. ${question.text}`}
                  </Text>
                }
                rules={[{ required: true, message: 'Veuillez sélectionner une réponse' }]}
              >
                <Radio.Group>
                  {question.options?.map((option) => (
                    <Radio 
                      key={option.id} 
                      value={option.id}
                      style={{ 
                        display: 'block',
                        marginBottom: '12px',
                        fontSize: '15px'
                      }}
                    >
                      {option.text}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
            ))}

            <Form.Item style={{ marginTop: '32px' }}>
              <Button 
                htmlType="submit" 
                loading={submitting}
                size="large"
                style={{
                  backgroundColor: greenTheme.primary,
                  borderColor: greenTheme.secondary,
                  width: '100%',
                  height: '40px',
                  fontSize: '16px'
                }}
              >
                {submitting ? 'Envoi en cours...' : 'Soumettre mes réponses'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default QuestionnaireResponsePage;