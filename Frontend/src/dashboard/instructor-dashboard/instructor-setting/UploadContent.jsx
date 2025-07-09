import { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
const UploadContent = ({ formationDetailsId, onPrev, onNext }) => {
  const [file, setFile] = useState(null);
  const [existingDoc, setExistingDoc] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !formationDetailsId) {
      toast.error("Fichier ou formationDetailsId manquant !");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("formationDetailsId", formationDetailsId);

    try {
      // Upload the file
      await axios.post(
        `${import.meta.env.VITE_API_URL}/documents/AddDoc`,
        formData,
        { withCredentials: true }
      );

      toast.success("Fichier envoyé avec succès !");
      console.log("✅ Upload successful");

      // Fetch the document using formationDetailsId
      const docDetails = await axios.get(
        `${import.meta.env.VITE_API_URL}/documents/formationDetails/${formationDetailsId}`,
        { withCredentials: true }
      );

      console.log("📄 Document récupéré :", docDetails.data);
      setExistingDoc(docDetails.data);

      onNext(); // Proceed to the next step
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi :", error.response?.data || error.message);
      toast.error("Échec de l'envoi du fichier.");
    }
  };

  return (
    <div className="instructor__profile-form-wrap">
      <form onSubmit={handleSubmit} className="instructor__profile-form">
        <div className="form-grp">
          <label htmlFor="file">Uploader votre fichier de module</label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="form-control"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
          />

          {file ? (
            <div className="mt-2 text-info">
              📄 Fichier sélectionné : <strong>{file.name}</strong>
            </div>
          ) : (
            <div className="mt-2 text-muted">Aucun fichier choisi.</div>
          )}
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button type="button" className="pill-button" onClick={onPrev}>
            Retour
          </button>
          <button type="submit" className="pill-button">
            Uploader et Suivant
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadContent;