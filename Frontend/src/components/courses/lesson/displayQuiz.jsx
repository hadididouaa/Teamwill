import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './DisplayQuiz.css';
import QuizLayout from '../../../layouts/QuizLayout';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useLocation } from 'react-router-dom';

const DisplayQuiz = () => {
  const { id: formationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedTitle = location.state?.formationTitle || "";

  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Utility to reorder an array item
  const moveItem = (arr, from, to) => {
    if (to < 0 || to >= arr.length) return arr;
    const newArr = [...arr];
    const [item] = newArr.splice(from, 1);
    newArr.splice(to, 0, item);
    return newArr;
  };

  useEffect(() => {
  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/quiz/${formationId}/getQuiz`);
      if (!response.ok) throw new Error('Quiz not found');
      const data = await response.json();

      if (!data.quiz || !Array.isArray(data.quiz.questions)) {
        throw new Error('Quiz or questions not found in response');
      }

      const initialAnswers = {};
      const transformedQuestions = data.quiz.questions.map((q) => {
        q.reponses = q.reponses || [];

        if (q.optionType === 'match') {
          // Use pairs directly if available, else build from reponses
          const pairs = Array.isArray(q.pairs) && q.pairs.length > 0
            ? q.pairs
            : q.reponses
                .filter(r => r.pairLeft && r.pairRight)
                .map(r => ({
                  pairLeft: r.pairLeft,
                  pairRight: r.pairRight,
                }));

          q.pairs = pairs;

          // Initialize answers mapping left items to empty strings
          const initialMatchAnswers = {};
          pairs.forEach(pair => {
            if (pair.pairLeft != null) {
              initialMatchAnswers[pair.pairLeft] = '';
            }
          });
          initialAnswers[q.id] = initialMatchAnswers;

        } else if (q.optionType === 'reorganize') {
          const reorderList = q.reponses.map(r => r.reponseText);
          q.reorganizeItems = reorderList;
          initialAnswers[q.id] = [...reorderList];
        } else if (q.optionType === 'Multiple_choice') {
          initialAnswers[q.id] = [];
        } else if (q.optionType === 'single_choice') {
          initialAnswers[q.id] = '';
        }

        return q;
      });

      data.quiz.questions = transformedQuestions;
      setQuiz(data.quiz);
      setUserAnswers(initialAnswers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchQuiz();
}, [formationId]);

  // Handlers for single choice questions
  const handleSingleChoiceChange = (questionId, answerId) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerId,
    }));
  };
  // Handlers for multiple choice questions
  const handleMultipleChoiceChange = (questionId, answerId) => {
    setUserAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      return {
        ...prev,
        [questionId]: currentAnswers.includes(answerId)
          ? currentAnswers.filter(a => a !== answerId)
          : [...currentAnswers, answerId],
      };
    });
  };
  // Handler for reorganize questions
  const handleReorganizeChange = (questionId, newOrder) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: newOrder,
    }));
  };
  // Handler for match drag-and-drop end
  const onDragEnd = (result, currentQuestion) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    setUserAnswers(prev => {
      const prevAnswers = prev[currentQuestion.id] || {};
      const newAnswers = { ...prevAnswers };

      // Remove draggableId from any other zone it was assigned to
      for (const zone in newAnswers) {
        if (newAnswers[zone] === draggableId) {
          delete newAnswers[zone];
        }
      }
      // Assign draggableId to the new drop zone
      newAnswers[destination.droppableId] = draggableId;

      return {
        ...prev,
        [currentQuestion.id]: newAnswers,
      };
    });
  };

  // Navigation controls
  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Submit quiz answers
  const handleSubmit = async () => {
  // Validate all answers
  for (const question of quiz.questions) {
    const answer = userAnswers[question.id];
    
    if (question.optionType === 'single_choice') {
      if (!answer) {
        alert(`Veuillez répondre à la question: "${question.questionText}"`);
        return;
      }
    }
    else if (question.optionType === 'Multiple_choice') {
      if (!answer || answer.length === 0) {
        alert(`Veuillez répondre à la question: "${question.questionText}"`);
        return;
      }
    }
    else if (question.optionType === 'match') {
      if (!answer) {
        alert(`Veuillez associer tous les éléments pour la question: "${question.questionText}"`);
        return;
      }
      // Check every left side has a matching right side assigned
      const allMatched = question.pairs.every(pair => answer[pair.pairLeft] && answer[pair.pairLeft].length > 0);
      if (!allMatched) {
        alert(`Veuillez associer tous les éléments pour la question: "${question.questionText}"`);
        return;
      }
    }
    else if (question.optionType === 'reorganize') {
      if (!answer || answer.length !== question.reorganizeItems.length) {
        alert(`Veuillez réorganiser tous les éléments pour la question: "${question.questionText}"`);
        return;
      }
    }
  }
  console.log("Submitting answers:", userAnswers);
  // If all validations passed, submit the quiz
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/quiz/${quiz.id}/passQuiz`,
      { answers: userAnswers }, 
      { withCredentials: true }
    );
    const { score, formationTitle: responseFormationTitle } = response.data;

     // 2. Update UserFormation status to 'completed'
    await axios.patch( `${import.meta.env.VITE_API_URL}/formations/user/completed/${formationId}`,
      {}, { withCredentials: true }
    );
    setIsSubmitted(true);
    if (score >= 70) {
      navigate('/congratulation', {
        state: {
          formationTitle: responseFormationTitle || passedTitle,
          score,
        }
      });
    } else {
      navigate('/failed', {
        state: {
          formationTitle: responseFormationTitle || passedTitle,
          score,
        }
      });
    }
  } catch (error) {
  if (error.response?.status === 403) {
    alert('Vous n\'êtes pas autorisé à passer ce quiz.');
  } else {
    console.error('Erreur lors de la soumission du quiz:', error);
    alert('Une erreur est survenue lors de la soumission du quiz. Veuillez réessayer.');
  }
};
}


  if (loading) return <div className="loading">Chargement du quiz...</div>;
  if (!quiz || !quiz.questions || quiz.questions.length === 0)
    return <div className="error">Aucune question disponible pour ce quiz.</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentReorganizeAnswer =
  userAnswers[currentQuestion?.id] || currentQuestion?.reorganizeItems || [];

  return (
    <QuizLayout>
      <div className="quiz-containera">
        <div className="quiz-header">
          <h1>{quiz.title || "Quiz d'évaluation"}</h1>
        </div>

        <div className="progress-bar">
          <div className="progress-info">
            <span>
              Question {currentQuestionIndex + 1} sur {quiz.questions.length}
            </span>
            <span>
              {Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}% complété
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="question-box">
          <div className="question-display">
            <div className="question-label">Question</div>
            <div className="fixed-question">{currentQuestion.questionText || "Question en cours"}</div>
          </div>

          {/* Multiple choice and single choice */}
          {(currentQuestion.optionType === 'Multiple_choice' || currentQuestion.optionType === 'single_choice') && (
            <div className="options-list">
              {currentQuestion.reponses.map(option => {
                const checked =
                  currentQuestion.optionType === 'Multiple_choice'
                    ? (userAnswers[currentQuestion.id] || []).includes(option.id)
                    : userAnswers[currentQuestion.id] === option.id;

                return (
                  <label key={option.id} className={`option-item ${checked ? 'selected' : ''}`}>
                    <input
                      type={currentQuestion.optionType === 'Multiple_choice' ? 'checkbox' : 'radio'}
                      name={`question-${currentQuestion.id}`}
                      value={option.id}
                      checked={checked}
                      onChange={() =>
                        currentQuestion.optionType === 'Multiple_choice'
                          ? handleMultipleChoiceChange(currentQuestion.id, option.id)
                          : handleSingleChoiceChange(currentQuestion.id, option.id)
                      }
                    />
                    {option.reponseText}
                  </label>
                );
              })}
            </div>
          )}

          {/* Match question */}          
          {currentQuestion.optionType === 'match' && currentQuestion.pairs && (
            <div className="drag-drop-container">
               <p className="drag-drop-instruction">
                Associez les éléments correspondants :</p>
              <DragDropContext onDragEnd={(result) => onDragEnd(result, currentQuestion)}>
                <div
                  className="drop-zones"
                  style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}
                >
                  {currentQuestion.pairs && currentQuestion.pairs.map(pair => (
                    <Droppable droppableId={pair.pairLeft} key={pair.pairLeft}>
                      {(provided, snapshot) => (
                        <div
                          className="drop-zone"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{
                            minWidth: '150px',
                            minHeight: '80px',
                            padding: '10px',
                            border: '2px dashed #2980b9',
                            borderRadius: '5px',
                            backgroundColor: snapshot.isDraggingOver ? '#d0f0fd' : 'white',
                            marginBottom: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',justifyContent: 'center',}}>
                          <div className="drop-zone-label" style={{ marginBottom: '6px', fontWeight: '600' }}>
                            {pair.pairLeft}
                          </div>
                          {userAnswers[currentQuestion.id] &&
                          userAnswers[currentQuestion.id][pair.pairLeft] ? (
                            <Draggable 
                              draggableId={userAnswers[currentQuestion.id][pair.pairLeft]} index={0}>
                              {(providedDraggable, snapshotDraggable) => (
                                <div ref={providedDraggable.innerRef}
                                  {...providedDraggable.draggableProps}{...providedDraggable.dragHandleProps}
                                  style={{padding: '6px 10px', backgroundColor: snapshotDraggable.isDragging ? '#3498db' : '#2980b9', color: 'white', borderRadius: '3px', cursor: 'grab', ...providedDraggable.draggableProps.style,}}>
                                  {userAnswers[currentQuestion.id][pair.pairLeft]}
                                </div>
                              )}
                            </Draggable>
                          ) : (
                            <div style={{ color: '#bbb' }}>Déposez ici</div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  ))}
                </div>
                <Droppable droppableId="pool" direction="horizontal">
                  {(provided) => (
                    <div className="drag-pool" ref={provided.innerRef} {...provided.droppableProps}>
                      {currentQuestion.pairs.map(p => p.pairRight)
                        .filter(
                          pairRight => !Object.values(userAnswers[currentQuestion.id] || {}).includes(pairRight))
                        .map((pairRight, index) => (
                          <Draggable draggableId={pairRight} index={index} key={pairRight}>
                            {(providedDraggable, snapshotDraggable) => (
                              <div ref={providedDraggable.innerRef}
                                {...providedDraggable.draggableProps} {...providedDraggable.dragHandleProps}
                                style={{padding: '8px 12px', backgroundColor: snapshotDraggable.isDragging ? '#3498db' : '#2980b9', color: 'white', borderRadius: '3px', cursor: 'grab', userSelect: 'none', ...providedDraggable.draggableProps.style,
                                }}>
                                {pairRight}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}

          {/* Reorganize question */}
          {currentQuestion.optionType === 'reorganize' && (
            <DragDropContext onDragEnd={(result) => {
                if (!result.destination) return;
                const newOrder = moveItem(
                  currentReorganizeAnswer,
                  result.source.index,
                  result.destination.index);
                handleReorganizeChange(currentQuestion.id, newOrder);
              }}>              
              <Droppable droppableId="reorganize-list">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="reorganize-list"
                  >
                    {currentReorganizeAnswer.map((item, index) => (
                      <Draggable draggableId={item} index={index} key={item}>
                        {(providedDraggable, snapshotDraggable) => (
                          <li
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}
                            {...providedDraggable.dragHandleProps}
                            className={`reorganize-item ${
                              snapshotDraggable.isDragging ? 'dragging' : ''
                            }`}
                          >
                            {item}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          )}          
        </div>

        <div className="quiz-nav">
            <button className="nav-btn prev-btn" onClick={prevQuestion} disabled={currentQuestionIndex === 0}>← Précédent</button>
            <div className="pagination-dots">
              {Array.from({ length: quiz.questions.length || 3 }).map((_, idx) => (
                <button
                  key={idx}
                  className={`dot ${idx === currentQuestionIndex ? 'active' : ''}`}
                  onClick={() => setCurrentQuestionIndex(idx)}
                />
              ))}
            </div>
            <button className="nav-btn next-btn" onClick={nextQuestion} disabled={currentQuestionIndex === quiz.questions.length - 1} > Suivant → </button>
          </div>

          {currentQuestionIndex === quiz.questions.length - 1 && (
            <div className="submit-sectiona">
              <button className="submit-btna" onClick={handleSubmit}>Valider</button>
            </div>
          )}
        </div>

    </QuizLayout>
  );
};

export default DisplayQuiz;