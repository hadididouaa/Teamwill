// Frontend: QuestionnaireResults.jsx
import React, { useEffect, useState } from 'react';
import { 
  Table, Tag, Typography, Card, Spin, message, 
  Descriptions, Divider, Statistic, Row, Col, Button, Tabs 
} from 'antd';
import { 
  UserOutlined, 
  BarChartOutlined, 
  ArrowLeftOutlined,
  PieChartOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import axios from 'axios';
import DashboardLayout from "../layouts/DashboardLayout";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(...registerables);

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const colors = {
  primary: '#a8b845',
  secondary: '#6c757d',
  dark: '#343a40',
  light: '#f8f9fa',
  pastels: ['#FFD1DC', '#FFECB8', '#B5EAD7', '#C7CEEA', '#E2F0CB']
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const AllQuestionnaireResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/questionnaires/results/all`,
          {
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid data format from server');
        }

        const validatedData = response.data.map(item => ({
          ...item,
          createdAt: item.createdAt || new Date().toISOString(),
          totalScore: item.totalScore || 0,
          analysis: item.analysis || null
        }));

        setResults(validatedData);
        setStats(calculateStats(validatedData));
        
      } catch (error) {
        console.error('Fetch error:', error);
        message.error({
          content: error.response?.data?.message || 'Failed to load results',
          duration: 5
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const calculateStats = (data) => {
    const stats = {
      totalUsers: new Set(data.map(r => r.user.id)).size,
      totalTests: data.length,
      averageScore: data.reduce((sum, r) => sum + r.totalScore, 0) / data.length || 0,
      byQuestionnaire: {},
      scoreDistribution: Array(10).fill(0).map((_, i) => ({
        range: `${i*10}-${(i+1)*10}`,
        count: data.filter(r => r.totalScore >= i*10 && r.totalScore < (i+1)*10).length
      }))
    };

    data.forEach(result => {
      if (!stats.byQuestionnaire[result.questionnaire.id]) {
        stats.byQuestionnaire[result.questionnaire.id] = {
          title: result.questionnaire.title,
          count: 0,
          average: 0
        };
      }
      stats.byQuestionnaire[result.questionnaire.id].count++;
      stats.byQuestionnaire[result.questionnaire.id].average += result.totalScore;
    });

    Object.keys(stats.byQuestionnaire).forEach(key => {
      stats.byQuestionnaire[key].average = 
        Math.round(stats.byQuestionnaire[key].average / stats.byQuestionnaire[key].count);
    });

    return stats;
  };

  const handleViewUser = (userId) => {
    const userResults = results.filter(r => r.user.id === userId);
    setSelectedUser(userResults[0].user);
    setUserResults(userResults);
  };

  const getScoreColor = (score) => {
    if (score > 70) return 'green';
    if (score > 40) return 'orange';
    return 'red';
  };

  if (loading) {
    return (
      <div className="center-spinner">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="results-container"
        style={{ padding: '24px' }}
      >
        <Title level={2} style={{ color: colors.dark }}>
          <BarChartOutlined /> Questionnaire Results
        </Title>

        {selectedUser ? (
          <UserResultsView 
            user={selectedUser} 
            results={userResults}
            onBack={() => setSelectedUser(null)}
            colors={colors}
          />
        ) : (
          <>
            <Tabs defaultActiveKey="1">
              <TabPane
                tab={
                  <span>
                    <BarChartOutlined /> Overview
                  </span>
                }
                key="1"
              >
                <SummaryStatistics stats={stats} colors={colors} />
                <Divider />
                <Card title="Score Distribution" bordered={false}>
                  <Bar
                    data={{
                      labels: stats?.scoreDistribution.map(s => s.range),
                      datasets: [{
                        label: 'Number of Users',
                        data: stats?.scoreDistribution.map(s => s.count),
                        backgroundColor: colors.pastels,
                        borderColor: colors.dark,
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Score Distribution',
                          font: {
                            size: 16
                          }
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Users'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Score Range'
                          }
                        }
                      },
                      animation: {
                        duration: 2000
                      }
                    }}
                  />
                </Card>
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <PieChartOutlined /> By Questionnaire
                  </span>
                }
                key="2"
              >
                <Card title="Performance by Questionnaire" bordered={false}>
                  <Pie
                    data={{
                      labels: Object.values(stats?.byQuestionnaire || {}).map(q => q.title),
                      datasets: [{
                        data: Object.values(stats?.byQuestionnaire || {}).map(q => q.count),
                        backgroundColor: colors.pastels,
                        borderColor: colors.dark,
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const q = Object.values(stats?.byQuestionnaire || {})[context.dataIndex];
                              return [
                                `Tests: ${q.count}`,
                                `Avg Score: ${q.average}`
                              ];
                            }
                          }
                        }
                      },
                      animation: {
                        animateScale: true,
                        animateRotate: true
                      }
                    }}
                  />
                </Card>
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <LineChartOutlined /> All Results
                  </span>
                }
                key="3"
              >
                <Card title="All Results" bordered={false}>
                  <Table
                    columns={[
                      {
                        title: 'User',
                        dataIndex: ['user', 'username'],
                        key: 'user',
                        render: (text, record) => (
                          <Button type="link" onClick={() => handleViewUser(record.user.id)}>
                            <UserOutlined /> {text}
                          </Button>
                        )
                      },
                      {
                        title: 'Questionnaire',
                        dataIndex: ['questionnaire', 'title'],
                        key: 'questionnaire'
                      },
                      {
                        title: 'Date',
                        dataIndex: 'createdAt',
                        key: 'date',
                        render: date => new Date(date).toLocaleDateString()
                      },
                      {
                        title: 'Score',
                        dataIndex: 'totalScore',
                        key: 'score',
                        render: score => (
                          <Tag color={getScoreColor(score)}>
                            {score}
                          </Tag>
                        )
                      },
                      {
                        title: 'Analysis',
                        key: 'analysis',
                        render: (_, record) => (
                          record.analysis ? (
                            <Tag color="blue">{record.analysis.title}</Tag>
                          ) : 'N/A'
                        )
                      }
                    ]}
                    dataSource={results}
                    rowKey={record => `${record.id}-${record.user.id}`}
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
              </TabPane>
            </Tabs>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

const SummaryStatistics = ({ stats, colors }) => {
  if (!stats) return null;

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card 
        title="Statistics Overview" 
        bordered={false}
        style={{ 
          borderLeft: `4px solid ${colors.primary}`,
          boxShadow: `0 4px 8px ${colors.secondary}20`
        }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Statistic 
              title="Total Users" 
              value={stats.totalUsers} 
              valueStyle={{ color: colors.dark }}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="Total Tests" 
              value={stats.totalTests} 
              valueStyle={{ color: colors.dark }}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="Average Score" 
              value={Math.round(stats.averageScore)} 
              valueStyle={{ color: colors.primary }}
            />
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
};

const UserResultsView = ({ user, results, onBack, colors }) => {
  return (
    <>
      <Button 
        type="link" 
        onClick={onBack}
        icon={<ArrowLeftOutlined />}
        style={{ 
          marginBottom: 16,
          color: colors.primary
        }}
      >
        Back to all results
      </Button>

      <UserProfile user={user} results={results} colors={colors} />

      {results.map((result, i) => (
        <TestResultCard key={i} result={result} colors={colors} />
      ))}
    </>
  );
};

const UserProfile = ({ user, results, colors }) => {
  const avgScore = results.reduce((sum, r) => sum + r.totalScore, 0) / results.length;

  return (
    <motion.div whileHover={{ scale: 1.01 }}>
      <Card 
        title="User Profile" 
        style={{ 
          marginBottom: 16,
          borderLeft: `4px solid ${colors.primary}`
        }}
      >
        <Descriptions bordered>
          <Descriptions.Item label="Name">{user.username}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Role">{user.roleUtilisateur}</Descriptions.Item>
          <Descriptions.Item label="Tests Completed">{results.length}</Descriptions.Item>
          <Descriptions.Item label="Average Score">
            <Tag 
              color={avgScore > 70 ? 'green' : avgScore > 40 ? 'orange' : 'red'}
              style={{ fontSize: '1.1em' }}
            >
              {Math.round(avgScore)}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </motion.div>
  );
};

const TestResultCard = ({ result, colors }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        title={`${result.questionnaire.title} - ${new Date(result.createdAt).toLocaleDateString()}`}
        style={{ 
          marginBottom: 16,
          borderLeft: `4px solid ${colors.secondary}`
        }}
      >
        <Descriptions bordered>
          <Descriptions.Item label="Total Score" span={3}>
            <Tag 
              color="green" 
              style={{ 
                fontSize: 16,
                boxShadow: `0 2px 4px ${colors.secondary}33`
              }}
            >
              {result.totalScore}
            </Tag>
          </Descriptions.Item>

          {result.analysis && (
            <>
              <Descriptions.Item label="Analysis" span={3}>
                <Text strong style={{ color: colors.primary }}>
                  {result.analysis.title}
                </Text>
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

        <Divider orientation="left">Detailed Responses</Divider>
        
        <Table
          columns={[
            { title: 'Question', dataIndex: ['question', 'text'], key: 'question' },
            { title: 'Answer', dataIndex: ['selectedOption', 'text'], key: 'answer' },
            { 
              title: 'Score', 
              key: 'score',
              render: (_, record) => <Tag>{record.selectedOption?.score}</Tag>
            }
          ]}
          dataSource={result.responses}
          rowKey={r => r.id}
          pagination={false}
          size="small"
        />
      </Card>
    </motion.div>
  );
};

export default AllQuestionnaireResults;