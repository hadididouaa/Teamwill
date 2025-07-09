import { useState } from "react";
import axios from "axios";

const NoteDigital = ({ formationId }) => {
   const [titre, setTitre] = useState("");
   const [content, setContent] = useState("");
   const [message, setMessage] = useState("");
   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         const response = await axios.post(`${import.meta.env.VITE_API_URL}/Digital/${formationId}/notes`,
         { titre, content },
         { withCredentials: true }
      );
         setMessage("✅ Note ajoutée avec succès.");
         setTitre("");
         setContent("");
      } catch (error) {
         console.error("Erreur lors de l'ajout de la note:", error);
         setMessage("❌ Échec de l'ajout de la note.");
      }
   };

   return (
      <div className="note-digital-form p-4 rounded shadow bg-light">
         <h4 className="mb-4 text-primary">Nouvelle note</h4>
         <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
               <label htmlFor="titre" className="form-label fw-semibold">Titre</label>
               <input
                  type="text"
                  id="titre"
                  className="form-control"
                  placeholder="Ex: Introduction à Ekip360"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  required
               />
            </div>

            <div className="form-group mb-3">
               <label htmlFor="content" className="form-label fw-semibold">Contenu</label>
               <textarea
                  id="content"
                  className="form-control"
                  rows="12"
                  placeholder="Écrivez ici votre note détaillée..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
               ></textarea>
            </div>
            <button type="submit" className="pill-button w-100">
               💾 Enregistrer la note
            </button>
         </form>
         {message && (
            <div className={`alert mt-3 ${message.includes("✅") ? "alert-success" : "alert-danger"}`}>
               {message}
            </div>
         )}
      </div>
   );
};

export default NoteDigital;
