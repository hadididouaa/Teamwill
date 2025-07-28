import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Space, Divider, message, InputNumber, Row, Col } from 'antd';
import { PlusOutlined, MinusOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';

const { TextArea } = Input;

const CreateQuestionnaire = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Initial data for the 3 required analyses
  const initialAnalyses = [
    { title: 'Low Result', minScore: 0, maxScore: 10 },
    { title: 'Average Result', minScore: 11, maxScore: 20 },
    { title: 'High Result', minScore: 21, maxScore: 30 }
  ];

  const validateQuestions = (questions) => {
    return questions.every(q => 
      q.text?.trim() && 
      q.options?.length > 0 &&
      q.options.every(o => o.text?.trim() && o.score !== undefined)
    );
  };
  
  const onFinish = async (values) => {
    if (!validateQuestions(values.questions)) {
      message.error('All questions must have text and at least one valid option');
      return;
    }

    // Score validation
    const scoresValid = values.analyses.every(a => 
      a.minScore !== undefined && 
      a.maxScore !== undefined &&
      a.minScore < a.maxScore
    );
    
    if (!scoresValid) {
      message.error('Scores must be valid (min < max)');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/questionnaires`, values, {
        withCredentials: true
      });
      message.success('Questionnaire created successfully');
      navigate('/QuestionnaireList');
    } catch (error) {
      message.error(error.response?.data?.message || 'Error creating questionnaire');
      console.error('Error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Card 
        title="Create New Questionnaire" 
        style={{ borderColor: '#a8b845', borderWidth: 2 }}
        headStyle={{ backgroundColor: '#a8b845', color: 'white' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          initialValues={{ analyses: initialAnalyses }} // Set initial analyses
        >
          {/* Basic Information Section */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Questionnaire Title"
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

          {/* Questions Section */}
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
                        label="Question Text"
                        rules={[{ required: true, message: 'Please enter the question' }]}
                      >
                        <TextArea rows={2} placeholder="Question text" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'order']}
                        label="Display Order"
                        initialValue={name + 1}
                      >
                        <InputNumber min={1} max={30} />
                      </Form.Item>

                      <Divider orientation="left">Answer Options</Divider>

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

          {/* Analysis and Recommendations Section */}
          <Divider orientation="left">Analysis and Recommendations (3 required)</Divider>
          
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
                        label="Analysis Title"
                        rules={[{ required: true, message: 'Title required' }]}
                      >
                        <Input placeholder="Ex: Low Result" />
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
                            label="Minimum Score"
                            rules={[{ required: true, message: 'Min score required' }]}
                          >
                            <InputNumber min={0} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'maxScore']}
                            label="Maximum Score"
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

export default CreateQuestionnaire;