import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  question: yup.string().required("La question est requise"),
  answers: yup
    .array()
    .of(
      yup.object().shape({
        text: yup.string().required("Le texte de la réponse est requis"),
        isCorrect: yup.boolean(),
      })
    )
    .min(2, "Deux réponses minimum"),
  score: yup.number().min(1, "Le score doit être supérieur ou égal à 1"),
});

const MultipleChoiceForm = ({ onSave, shouldReset }) => {
  const {
    register,
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      question: "",
      score: 1,
      answers: [{ text: "", isCorrect: false }],
    },
  });

  const { fields, append } = useFieldArray({ control, name: "answers" });

  useEffect(() => {
    if (shouldReset) {
      resetForm({
        question: "",
        answers: [{ text: "", isCorrect: false }],
        score: 1,
      });
    }
  }, [shouldReset]);

  const onSubmit = (data) => {
  // Ensure questionData is structured correctly before calling onSave
  onSave({
    questionText: data.question,
    reponses: data.answers.map((a) => ({
      reponseText: a.text,
      isCorrect: a.isCorrect,
      points: a.points,
    })),
    score: data.score,
  });
};


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>Question</label>
      <input type="text" {...register("question")} />
      {errors.question && <p className="text-danger">{errors.question.message}</p>}

      <h5>Réponses</h5>
      {fields.map((item, index) => (
        <div key={item.id}>
          <input {...register(`answers.${index}.text`)} placeholder={`Réponse ${index + 1}`} />
          <input type="checkbox" {...register(`answers.${index}.isCorrect`)} />
          <label>Correcte</label>
          {errors.answers?.[index]?.text && (
            <p className="text-danger">{errors.answers[index].text.message}</p>
          )}
        </div>
      ))}
      {typeof errors.answers === "string" && (
        <p className="text-danger">{errors.answers}</p>
      )}

      <label>Score</label>
      <input type="number" {...register("score")} />
      {errors.score && <p className="text-danger">{errors.score.message}</p>}

      <button type="button" onClick={() => append({ text: "", isCorrect: false })}>
        Ajouter une réponse
      </button>
      <button type="submit">Ajouter la question</button>
    </form>
  );
};
export default MultipleChoiceForm;
