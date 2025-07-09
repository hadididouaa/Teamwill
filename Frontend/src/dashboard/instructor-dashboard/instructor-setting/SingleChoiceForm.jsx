import { useState } from "react";

const SingleChoiceForm = () => {
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState([{ text: "", isCorrect: false }]);

  const handleAddAnswer = () => {
    setAnswers([...answers, { text: "", isCorrect: false }]);
  };

  const setSingleCorrect = (index) => {
    const newAnswers = answers.map((a, idx) => ({
      ...a,
      isCorrect: idx === index,
    }));
    setAnswers(newAnswers);
  };

  return (
    <div>
      <label>Question (choix unique)</label>
      <input
        type="text"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Entrez la question"
      />

      <h5>Réponses</h5>
      {answers.map((a, idx) => (
        <div key={idx}>
          <input
            type="text"
            value={a.text}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[idx].text = e.target.value;
              setAnswers(newAnswers);
            }}
          />
          <label>
            <input
              type="radio"
              name="correctAnswer"
              checked={a.isCorrect}
              onChange={() => setSingleCorrect(idx)}
            />
            Bonne réponse
          </label>
        </div>
      ))}

      <button onClick={handleAddAnswer}>Ajouter une réponse</button>
    </div>
  );
};

export default SingleChoiceForm;
