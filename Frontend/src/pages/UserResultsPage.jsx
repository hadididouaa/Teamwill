import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, Table, Tag, Typography, Spin, Descriptions, 
  Divider, Statistic, Row, Col, Button, message 
} from 'antd';
import { 
  UserOutlined, BarChartOutlined, ArrowLeftOutlined,
  CheckCircleOutlined, ClockCircleOutlined 
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';


ChartJS.register(...registerables);

const { Title, Text } = Typography;

const themeColor = '#a8b845';

const getScoreColor = (score) => {
  if (score >= 70) return 'green';
  if (score >= 40) return 'orange';
  return 'red';
};

const UserResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/auth`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data || !response.data.roleUtilisateur) {
        throw new Error('Incomplete user data');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login?session_expired=true';
      }
      return null;
    }
  }, []);

  const calculateStats = (data) => {
    if (!Array.isArray(data)) {
      console.error('Data is not an array:', data);
      return null;
    }

    const validData = data.filter(r => typeof r?.totalScore === 'number');
    const totalTests = validData.length;
    
    if (totalTests === 0) {
      return null;
    }

    const totalScore = validData.reduce((sum, r) => sum + r.totalScore, 0);
    const averageScore = totalScore / totalTests;
    
    const scoreDistribution = Array(10).fill(0).map((_, i) => ({
      range: `${i*10}-${(i+1)*10}`,
      count: validData.filter(r => r.totalScore >= i*10 && r.totalScore < (i+1)*10).length
    }));

    return {
      totalTests,
      averageScore,
      scoreDistribution,
      lastTestDate: validData[0]?.createdAt,
      bestScore: Math.max(...validData.map(r => r.totalScore))
    };
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const userData = await fetchCurrentUser();
      if (!userData) {
        throw new Error('User not authenticated');
      }

      setUserInfo({
        name: userData.username || 'User',
        email: userData.email || '',
        role: userData.roleUtilisateur || 'user'
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/questionnaires/results/user`, 
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const resultData = Array.isArray(response.data) ? response.data : [];
      setResults(resultData);
      
      const calculatedStats = calculateStats(resultData);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching results:', error);
      message.error(error.response?.data?.message || 'An error occurred while loading results');
      setResults([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <Card style={{ margin: '20px' }}>
          <Title level={4}>No results found</Title>
          <Text>You haven't completed any questionnaires yet.</Text>
          <Button 
            type="primary" 
            onClick={() => navigate('/Cquestionnaires')}
            style={{ marginTop: '16px' }}
          >
            Take a questionnaire
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Button 
        type="link" 
        onClick={() => navigate(-1)} 
        icon={<ArrowLeftOutlined />}
        style={{ color: themeColor, marginBottom: '16px' }}
      >
        Back
      </Button>

      <Title level={2} style={{ color: themeColor }}>
        <UserOutlined /> My Results
      </Title>

 

      {stats && (
        <>
          <Card style={{ marginBottom: '24px', borderLeft: `4px solid ${themeColor}` }}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Statistic 
                  title="Completed tests" 
                  value={stats.totalTests} 
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic 
                  title="Average score" 
                  value={stats.averageScore.toFixed(1)} 
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: themeColor }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic 
                  title="Best score" 
                  value={stats.bestScore} 
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>

          <Card title="My Score Distribution" style={{ marginBottom: '24px' }}>
            <Bar
              data={{
                labels: stats.scoreDistribution.map(s => s.range),
                datasets: [{
                  label: 'My tests',
                  data: stats.scoreDistribution.map(s => s.count),
                  backgroundColor: themeColor,
                  borderColor: '#8a9a5b',
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </Card>
        </>
      )}

      <Title level={4}>Test Details</Title>
      {results.map((result, index) => (
        <Card 
          key={index} 
          style={{ marginBottom: '16px', borderLeft: `3px solid ${themeColor}` }}
          title={`${result.questionnaire?.title || 'Questionnaire'}`}
        >
          <Descriptions bordered size="small">
            <Descriptions.Item label="Total score" span={3}>
              <Tag color={getScoreColor(result.totalScore)} style={{ fontSize: '16px' }}>
                {result.totalScore}
              </Tag>
            </Descriptions.Item>
            {result.analysis && (
              <>
                <Descriptions.Item label="Analysis" span={3}>
                  <Text strong>{result.analysis.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={3}>
                  {result.analysis.description}
                </Descriptions.Item>
                {result.analysis.recommendations && (
                  <Descriptions.Item label="Recommendations" span={3}>
                    {result.analysis.recommendations}
                  </Descriptions.Item>
                )}
              </>
            )}
          </Descriptions>
        </Card>
      ))} 
    </div>
  );
};

export default UserResultsPage;