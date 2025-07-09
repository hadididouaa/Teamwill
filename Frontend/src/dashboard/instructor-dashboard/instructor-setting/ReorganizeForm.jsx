import { useState } from "react";

const ReorganizeForm = () => {
  const [questionText, setQuestionText] = useState("");
  const [steps, setSteps] = useState([""]);

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  return (
    <div>
      <label>Question (réorganisation)</label>
      <input
        type="text"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Entrez la consigne"
      />

      <h5>Étapes (ordre correct)</h5>
      {steps.map((s, idx) => (
        <div key={idx}>
          <input
            type="text"
            placeholder={`Étape ${idx + 1}`}
            value={s}
            onChange={(e) => {
              const newSteps = [...steps];
              newSteps[idx] = e.target.value;
              setSteps(newSteps);
            }}
          />
        </div>
      ))}

      <button onClick={handleAddStep}>Ajouter une étape</button>
    </div>
  );
};

export default ReorganizeForm;
