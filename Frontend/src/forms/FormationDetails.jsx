import { toast } from 'react-toastify';
import * as yup from "yup";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import BtnArrow from '../svg/BtnArrow';
import axios from 'axios';
import './style.css';

// Validation schema
const schema = yup.object({
  description: yup.string().required("La description est requise"),
  duree: yup.number().required("La durée est requise").positive().integer(),
  plan: yup.array().of(
    yup.string().required("Une ligne du plan est vide")
  ).min(1, "Le plan est requis"),
}).required();

const FormationDetails = ({ formationId, onNext, onPrev }) => {
  const {
    register,
    handleSubmit,
    control,
    reset,

    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "plan"
  });
  // Fetch existing formation details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/module/${formationId}/details`, {
          withCredentials: true,
        });
        const data = response.data;

        if (data) {
          // Fill form with fetched data
         reset({
            description: data.description || '',
            duree: data.duree !== undefined && data.duree !== null ? Number(data.duree) : '',
            plan: data.plan && data.plan.length ? data.plan : ['']
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails :", error.response?.data || error.message);
        
      }
    };

    if (formationId) {
      fetchDetails();
    }
  }, [formationId, reset]);

  // Submit form
  const onSubmit = async (data) => {
    if (!formationId) {
      toast.error("ID de la formation manquant.");
      return;
    }

    try {
      const payload = { ...data, formationId };
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/module/addDetail`, payload, {
        withCredentials: true
      });

      toast.success("Détails enregistrés avec succès !", { position: 'top-center' });
      const createdFormationDetailsId = response.data.formationDetails?.id;
      onNext(createdFormationDetailsId);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error.response?.data || error.message);
      toast.error("Erreur lors de la soumission des détails", { position: 'top-center' });
    }
  };

  return (
    <div className="instructor__profile-form-wrap">
      <form onSubmit={handleSubmit(onSubmit)} className="instructor__profile-form">
        {/* Description */}
        <div className="form-grp col-md-4">
          <label htmlFor="description">Description</label>
          <textarea {...register("description")} placeholder="Description ou objectif de la formation" />
          <p className="form_error">{errors.description?.message}</p>
        </div>

        {/* Durée */}
        <div className="duree">
          <label htmlFor="duree">Durée (en heures)</label>
          <input type="number" {...register("duree")} placeholder="Heures" />
          <p className="form_error">{errors.duree?.message}</p>
        </div>

        {/* Plan */}
        <div className="form-grp col-md-4">
          <label>Plan du module (chaque ligne représente un point)</label>
          {fields.map((field, index) => (
            <div key={field.id} className="form-plan-row">

              <input
                type="text"
                {...register(`plan.${index}`)}
                placeholder={`Chapitre ${index + 1}`}
              />
              <button type="button" onClick={() => remove(index)} className="pill-button">Supprimer</button>
            </div>
          ))}
          <button type="button" onClick={() => append("")} className="pill-button">Ajouter un chapitre</button>
          <p className="form_error">{errors.plan?.message}</p>
        </div>

        {/* Navigation */}
        <button type="submit" className="pill-button">
          Suivant <BtnArrow />
        </button>
      </form>
    </div>
  );
};
export default FormationDetails;

