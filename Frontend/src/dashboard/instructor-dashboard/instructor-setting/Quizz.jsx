import { useState, useEffect } from "react";
import axios from "axios";
import * as yup from "yup";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import './QuizStyles.css';
import { OPTION_TYPE } from '../../../constants/optionType';
import { DIFFICULTY } from '../../../constants/difficulty';

// Validation schema
const schema = yup.object({
  totalScore: yup.number().min(1).required(),
  tentatives: yup.number().min(1).required(),
  difficulty: yup.string().oneOf(DIFFICULTY).required(),
  questions: yup.array().of(
    yup.object({
      questionText: yup.string().required(),
      optionType: yup.string().oneOf(OPTION_TYPE).required(),
      reponses: yup.array().when('optionType', {
        is: (val) => val !== 'match',
        then: () => yup.array().of(
          yup.object({
            reponseText: yup.string().required(),
            isCorrect: yup.boolean().default(false),
            points: yup.number().min(0).required(),
            orderIndex: yup.number().nullable(),
          })
        ).min(1).required(),
        otherwise: () => yup.array().notRequired()
      }),
      pairs: yup.array().when('optionType', {
        is: 'match',
        then: () => yup.array().of(
          yup.object({
            left: yup.string().required(),   
            right: yup.string().required(), 
            points: yup.number().min(0).required()
          })
        ).min(1).required(),
        otherwise: () => yup.array().notRequired()
      })

    })
  ).min(1).required()
});



const Quizz = ({ formationDetailsId, onPrev }) => {
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState({
    totalScore: 0,
    tentatives: 1,
    difficulty: 'easy',
    formationDetailsId,
  });

  const [questions, setQuestions] = useState([{
    questionText: '',
    optionType: 'single_choice',
    reponses: [{ reponseText: '', isCorrect: false, points: 0, orderIndex: null }],
    pairs: [{ left: '', right: '', points: 0 }],  
    }]);

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuiz({ ...quiz, [name]: name === 'totalScore' || name === 'tentatives' ? parseInt(value) || 0 : value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;

    // Reset responses if option type changes
    if (field === 'optionType') {
      if (value === 'match') {
        updated[index].pairs = [{ left: '', right: '', points: 0 }];  // <-- change here
        updated[index].reponses = [];
      } else {
        updated[index].reponses = [{ reponseText: '', isCorrect: false, points: 0, orderIndex: null }];
        updated[index].pairs = [];
      }
    }
    setQuestions(updated);
  };

  const handleResponseChange = (qIndex, rIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex].reponses[rIndex][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      optionType: 'single_choice',
      reponses: [{ reponseText: '', isCorrect: false, points: 0, orderIndex: null }],
      pairs: [{ pairLeft: '', pairRight: '', points: 0 }]

    }]);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const addResponse = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].reponses.push({
      reponseText: '', isCorrect: false, points: 0, orderIndex: null
    });
    setQuestions(updated);
  };

  const removeResponse = (qIndex, rIndex) => {
    const updated = [...questions];
    updated[qIndex].reponses.splice(rIndex, 1);
    setQuestions(updated);
  };

  useEffect(() => {
    setQuiz(prev => ({ ...prev, formationDetailsId }));
  }, [formationDetailsId]);

 useEffect(() => {
  const score = questions.reduce((acc, q) => {
    const reponseScore = q.reponses?.reduce((sum, r) => sum + (r.points || 0), 0) || 0;
    const matchScore = q.optionType === 'match'
      ? q.pairs?.reduce((sum, p) => sum + (p.points || 0), 0) || 0
      : 0;
    return acc + reponseScore + matchScore;
  }, 0);

  setQuiz(prev => ({ ...prev, totalScore: score }));
}, [questions]);


  const onSubmit = async () => {
    try {
      await schema.validate({ ...quiz, questions }, { abortEarly: false });
      await axios.post(`${import.meta.env.VITE_API_URL}/quiz/create`, { ...quiz, questions }, { withCredentials: true });
      toast.success("Quiz created successfully");
      navigate('/dashboard');
    } catch (error) {
      if (error.name === 'ValidationError') {
        toast.error(error.errors[0]);
      } else {
        toast.error("Error creating quiz");
      }
    }
  };

  return (
    <form className="customer__form-wrap" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <span className="title">Create Quiz</span>
      <div className="row">
        <div className="col-md-4">
          <div className="form-grp">
            <label>Total Score</label>
            <input type="number" name="totalScore" value={quiz.totalScore} onChange={handleQuizChange} />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-grp">
            <label>Number of Attempts</label>
            <input type="number" name="tentatives" value={quiz.tentatives} onChange={handleQuizChange} />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-grp select-grp">
            <label>Difficulty</label>
            <select name="difficulty" value={quiz.difficulty} onChange={handleQuizChange}>
              {DIFFICULTY.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
        </div>
      </div>
      <hr />
      {questions.map((question, qIndex) => (
        <div key={qIndex} className="card question-section mb-4 p-3 shadow-sm rounded bg-light">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold text-primary">Question {qIndex + 1}</h6>
            <button type="button" className="btn btn-remove-question" onClick={() => removeQuestion(qIndex)}>Supprimer Question</button>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Question Text</label>
            <input type="text" className="form-control" value={question.questionText} onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)} />
          </div>
          

          <div className="mb-3">
            <label className="form-label fw-semibold">Type De Question</label>
            <select className="form-select" value={question.optionType} onChange={(e) => handleQuestionChange(qIndex, "optionType", e.target.value)}>
              {OPTION_TYPE.filter(type => type !== "drag_drop").map(type => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {question.optionType === 'match' ? (
            <div className="match-pairs-section">
              <label className="fw-semibold">Match Pairs</label>
              {question.pairs?.map((pair, pairIndex) => (
                <div key={pairIndex} className="row g-2 align-items-center mb-2">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Left item"
                      value={pair.left}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIndex].pairs[pairIndex].left = e.target.value; 
                        setQuestions(updated);
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Right item"
                      value={pair.right}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIndex].pairs[pairIndex].right = e.target.value;
                        setQuestions(updated);
                      }}
                    />
                  </div>
                  <div className="col-md-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Points"
                      value={pair.points ?? ''}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIndex].pairs[pairIndex].points = parseFloat(e.target.value) || 0;
                        setQuestions(updated);
                      }}
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        const updated = [...questions];
                        updated[qIndex].pairs.splice(pairIndex, 1);
                        setQuestions(updated);
                      }}
                    >
                      supprimer
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() => {
                  const updated = [...questions];
                  updated[qIndex].pairs.push({ left: '', right: '', points: 0 });
                  setQuestions(updated);
                }}
              >
                Add Pair
              </button>
            </div>
          ) : (
            question.reponses.map((reponse, rIndex) => (
              <div key={rIndex} className="border p-3 mb-2 rounded bg-white">
                <div className="row g-2 align-items-center">
                  <div className="col-md-4">
                    <label className="form-label">Réponse </label>
                    <input type="text" className="form-control" value={reponse.reponseText} onChange={(e) => handleResponseChange(qIndex, rIndex, "reponseText", e.target.value)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Points</label>
                    <input type="number" className="form-control" value={reponse.points ?? 0} onChange={(e) => handleResponseChange(qIndex, rIndex, "points", parseFloat(e.target.value))} />
                  </div>
                  {question.optionType === 'reorganize' && (
                    <div className="col-md-2">
                      <label className="form-label">Ordre</label>

                      <input type="number" className="form-control" value={reponse.orderIndex ?? ''} onChange={(e) => handleResponseChange(qIndex, rIndex, "orderIndex", parseInt(e.target.value))} />
                    </div>
                  )}
                  <div className="col-md-2">
                    <label className="form-check-label d-block">Correcte</label>
                    <input type="checkbox" className="form-check-input" checked={reponse.isCorrect} onChange={(e) => handleResponseChange(qIndex, rIndex, "isCorrect", e.target.checked)} />
                  </div>
                  <div className="col-md-2">
                    <button type="button" className="btn btn-remove-response" onClick={() => removeResponse(qIndex, rIndex)}>Supprimer</button>

                  </div>
                </div>
              </div>
            ))
          )}

          {question.optionType !== 'match' && (
            <button type="button" className="btn btn-add-response mt-2" onClick={() => addResponse(qIndex)}>Ajouter réponse</button>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-add-question" onClick={addQuestion}>Ajouter Question</button>
      <div className="button-group">
        <button type="button" className="pill-button" onClick={onPrev}>Previous</button>
        <button type="submit" className="pill-button">Enregistrer Quiz</button>
      </div>
    </form>
  );
};
export default Quizz;

