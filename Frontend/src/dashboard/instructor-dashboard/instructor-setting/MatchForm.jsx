import { useState } from "react";

const MatchForm = () => {
  const [questionText, setQuestionText] = useState("");
  const [pairs, setPairs] = useState([{ left: "", right: "" }]);

  const handleAddPair = () => {
    setPairs([...pairs, { left: "", right: "" }]);
  };

  return (
    <div>
      <label>Question (appariement)</label>
      <input
        type="text"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Entrez l'instruction"
      />

      <h5>Paires à apparier</h5>
      {pairs.map((p, idx) => (
        <div key={idx}>
          <input
            type="text"
            placeholder="Gauche"
            value={p.left}
            onChange={(e) => {
              const newPairs = [...pairs];
              newPairs[idx].left = e.target.value;
              setPairs(newPairs);
            }}
          />
          <span> — </span>
          <input
            type="text"
            placeholder="Droite"
            value={p.right}
            onChange={(e) => {
              const newPairs = [...pairs];
              newPairs[idx].right = e.target.value;
              setPairs(newPairs);
            }}
          />
        </div>
      ))}

      <button onClick={handleAddPair}>Ajouter une paire</button>
    </div>
  );
};

export default MatchForm;
