import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Space, Divider, message, InputNumber, Row, Col } from 'antd';
import { PlusOutlined, MinusOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';

const { TextArea } = Input;

const EditQuestionnaire = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/questionnaires/${id}`, {
          withCredentials: true
        });
        
        // Format data for form
        const formattedData = {
          ...response.data,
          questions: response.data.questions?.map(q => ({
            ...q,
            options: q.options || []
          })) || [],
          analyses: response.data.analyses || [
            { title: 'Résultat Faible', minScore: 0, maxScore: 10 },
            { title: 'Résultat Moyen', minScore: 11, maxScore: 20 },
            { title: 'Résultat Élevé', minScore: 21, maxScore: 30 }
          ]
        };

        form.setFieldsValue(formattedData);
      } catch (error) {
        message.error(error.response?.data?.message || 'Failed to fetch questionnaire');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [id, form]);

  const onFinish = async (values) => {
    // Validation des analyses
    if (!values.analyses || values.analyses.length !== 3) {
      message.error('Vous devez définir exactement 3 analyses');
      return;
    }

    // Validation des scores
    const scoresValid = values.analyses.every(a => 
      a.minScore !== undefined && 
      a.maxScore !== undefined &&
      a.minScore < a.maxScore
    );
    
    if (!scoresValid) {
      message.error('Les scores doivent être valides (min < max)');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/questionnaires/${id}`, values, {
        withCredentials: true
      });
      message.success('Questionnaire updated successfully');
      navigate(`/questionnaires/${id}`);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update questionnaire');
      console.error('Error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <DashboardLayout>Loading...</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <Card 
        title={
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(`/questionnaires/${id}`)}
            />
            <span>Edit Questionnaire</span>
          </Space>
        }
        style={{ borderColor: '#a8b845', borderWidth: 2 }}
        headStyle={{ backgroundColor: '#a8b845', color: 'white' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          {/* Section Informations de base */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please enter a title' }]}
              >
                <Input placeholder="Questionnaire title" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea rows={3} placeholder="Questionnaire description" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Questions</Divider>

          {/* Section Questions */}
          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    title={`Question ${name + 1}`}
                    style={{ marginBottom: 16, borderColor: '#d9d9d9' }}
                    extra={
                      <Button
                        danger
                        onClick={() => remove(name)}
                        icon={<MinusOutlined />}
                        size="small"
                      >
                        Remove
                      </Button>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'text']}
                        label="Question text"
                        rules={[{ required: true, message: 'Please enter the question' }]}
                      >
                        <TextArea rows={2} placeholder="Question text" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'order']}
                        label="Display order"
                      >
                        <InputNumber min={1} max={30} />
                      </Form.Item>

                      <Divider orientation="left">Answer options</Divider>

                      <Form.List
                        {...restField}
                        name={[name, 'options']}
                      >
                        {(optionFields, { add: addOption, remove: removeOption }) => (
                          <>
                            {optionFields.map(({ key: optKey, name: optName, ...optRestField }) => (
                              <Space key={optKey} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                <Form.Item
                                  {...optRestField}
                                  name={[optName, 'text']}
                                  rules={[{ required: true, message: 'Text required' }]}
                                >
                                  <Input placeholder="Option text" />
                                </Form.Item>
                                <Form.Item
                                  {...optRestField}
                                  name={[optName, 'score']}
                                  rules={[{ required: true, message: 'Score required' }]}
                                >
                                  <InputNumber placeholder="Score" min={0} max={10} />
                                </Form.Item>
                                <MinusOutlined 
                                  onClick={() => removeOption(optName)} 
                                  style={{ color: 'red', cursor: 'pointer' }}
                                />
                              </Space>
                            ))}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => addOption()}
                                block
                                icon={<PlusOutlined />}
                                disabled={optionFields.length >= 3}
                              >
                                Add option (max 3)
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Space>
                  </Card>
                ))}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    disabled={fields.length >= 30}
                    style={{ borderColor: '#a8b845', color: '#a8b845' }}
                  >
                    Add question (max 30)
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* Section Analyses et Recommandations */}
          <Divider orientation="left">Analyses and Recommendations (3 required)</Divider>
          
          <Form.List name="analyses">
            {(fields) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    title={`Analysis ${name + 1}`}
                    style={{ marginBottom: 16, borderColor: '#d9d9d9' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        label="Analysis title"
                        rules={[{ required: true, message: 'Title required' }]}
                      >
                        <Input placeholder="Ex: Low result" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        label="Description"
                        rules={[{ required: true, message: 'Description required' }]}
                      >
                        <TextArea rows={3} placeholder="Description of this result" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'recommendations']}
                        label="Recommendations"
                        rules={[{ required: true, message: 'Recommendations required' }]}
                      >
                        <TextArea rows={3} placeholder="What to recommend for this result?" />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'minScore']}
                            label="Minimum score"
                            rules={[{ required: true, message: 'Min score required' }]}
                          >
                            <InputNumber min={0} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'maxScore']}
                            label="Maximum score"
                            rules={[{ 
                              required: true, 
                              message: 'Max score required',
                              validator: (_, value) => {
                                const minScore = form.getFieldValue(['analyses', name, 'minScore']);
                                if (value <= minScore) {
                                  return Promise.reject('Max score must be > min score');
                                }
                                return Promise.resolve();
                              }
                            }]}
                          >
                            <InputNumber min={0} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                ))}
              </>
            )}
          </Form.List>

          <Form.Item style={{ marginTop: 24 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
              style={{ backgroundColor: '#a8b845', borderColor: '#a8b845' }}
              size="large"
            >
              Save Questionnaire
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
};

export default EditQuestionnaire;