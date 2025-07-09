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
    { title: 'Résultat Faible', minScore: 0, maxScore: 10 },
    { title: 'Résultat Moyen', minScore: 11, maxScore: 20 },
    { title: 'Résultat Élevé', minScore: 21, maxScore: 30 }
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
    message.error('Toutes les questions doivent avoir du texte et au moins une option valide');
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
      await axios.post(`${import.meta.env.VITE_API_URL}/questionnaires`, values, {
        withCredentials: true
      });
      message.success('Questionnaire créé avec succès');
      navigate('/QuestionnaireList');
    } catch (error) {
      message.error(error.response?.data?.message || 'Erreur lors de la création');
      console.error('Error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Card 
        title="Créer un nouveau questionnaire" 
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
          {/* Section Informations de base */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Titre du questionnaire"
                rules={[{ required: true, message: 'Veuillez entrer un titre' }]}
              >
                <Input placeholder="Titre du questionnaire" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea rows={3} placeholder="Description du questionnaire" />
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
                        Supprimer
                      </Button>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'text']}
                        label="Texte de la question"
                        rules={[{ required: true, message: 'Veuillez entrer la question' }]}
                      >
                        <TextArea rows={2} placeholder="Texte de la question" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'order']}
                        label="Ordre d'affichage"
                        initialValue={name + 1}
                      >
                        <InputNumber min={1} max={30} />
                      </Form.Item>

                      <Divider orientation="left">Options de réponse</Divider>

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
                                  rules={[{ required: true, message: 'Texte requis' }]}
                                >
                                  <Input placeholder="Texte de la réponse" />
                                </Form.Item>
                                <Form.Item
                                  {...optRestField}
                                  name={[optName, 'score']}
                                  rules={[{ required: true, message: 'Score requis' }]}
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
                                Ajouter une option (max 3)
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
                    Ajouter une question (max 30)
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* Section Analyses et Recommandations */}
          <Divider orientation="left">Analyses et Recommandations (3 requises)</Divider>
          
          <Form.List name="analyses">
            {(fields) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    title={`Analyse ${name + 1}`}
                    style={{ marginBottom: 16, borderColor: '#d9d9d9' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        label="Titre de l'analyse"
                        rules={[{ required: true, message: 'Titre requis' }]}
                      >
                        <Input placeholder="Ex: Résultat faible" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        label="Description"
                        rules={[{ required: true, message: 'Description requise' }]}
                      >
                        <TextArea rows={3} placeholder="Description de ce résultat" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'recommendations']}
                        label="Recommandations"
                        rules={[{ required: true, message: 'Recommandations requises' }]}
                      >
                        <TextArea rows={3} placeholder="Que recommander pour ce résultat?" />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'minScore']}
                            label="Score minimum"
                            rules={[{ required: true, message: 'Score min requis' }]}
                          >
                            <InputNumber min={0} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'maxScore']}
                            label="Score maximum"
                            rules={[{ 
                              required: true, 
                              message: 'Score max requis',
                              validator: (_, value) => {
                                const minScore = form.getFieldValue(['analyses', name, 'minScore']);
                                if (value <= minScore) {
                                  return Promise.reject('Le score max doit être > au score min');
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
              Enregistrer le questionnaire
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
};

export default CreateQuestionnaire;