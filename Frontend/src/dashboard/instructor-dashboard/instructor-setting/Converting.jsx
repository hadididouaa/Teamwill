import { useState, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const Converting = ({ onPrev, onNext }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState(null);
  const [markdownText, setMarkdownText] = useState(null);
  const [labeledData, setLabeledData] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setConvertedPdfUrl(null);
      setMarkdownText(null);
      setLabeledData(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setConvertedPdfUrl(null);
      setMarkdownText(null);
      setLabeledData(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleConvertAll = async () => {
    if (!file) {
      toast.error("Veuillez choisir un fichier à convertir.");
      return;
    }
    setIsLoading(true);
    try {
      let pdfFile = file;
      if (file.type !== "application/pdf") {
        // Convert to PDF first
        const formData = new FormData();
        formData.append("file", file);
        const pdfResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/convertor/convert-to-pdf`,
          formData,
          { responseType: "blob" }
        );
        pdfFile = new File([pdfResponse.data], "converted.pdf", { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfFile);
        setConvertedPdfUrl(pdfUrl);
        toast.success("Conversion en PDF réussie !");
      } else {
        const pdfUrl = URL.createObjectURL(pdfFile);
        setConvertedPdfUrl(pdfUrl);
      }

      // Convert PDF to Markdown
      const formDataMd = new FormData();
      formDataMd.append("file", pdfFile);
      const mdResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/convertor/convert-pdf-to-markdown`,
        formDataMd
      );
      setMarkdownText(mdResponse.data.markdown);
      toast.success("Conversion PDF vers Markdown réussie !");

      // Extract labeled data
      const extractResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/convertor/extract-labeled-data`,
        { markdown: mdResponse.data.markdown }
      );
      setLabeledData(extractResponse.data.labeled_data);
      toast.success("Extraction des données labellisées réussie !");
    } catch (error) {
      console.error("Erreur lors de la conversion complète", error);
      toast.error("Erreur lors de la conversion complète.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="col-lg-9">
      <div className="dashboard__content-wrap p-4 rounded shadow-sm bg-white">
        <h3 className="mb-3 text-primary">Convertisseur de documents</h3>
        <p className="text-muted mb-4">
          Téléversez un fichier et cliquez sur "Convertir" pour lancer la conversion complète en PDF, Markdown, et extraction des données labellisées.
        </p>

        <div
          className="form-grp mb-3 border border-2 rounded p-4 text-center bg-light"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={triggerFileInput}
          style={{ cursor: "pointer" }}
        >
          <input
            type="file"
            ref={fileInputRef}
            id="file"
            className="form-control d-none"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <p className="fw-semibold">
            {file ? `✅ Fichier sélectionné : ${file.name}` : "Glissez-déposez un fichier ici ou cliquez pour sélectionner"}
          </p>
        </div>

        <div className="d-flex gap-3 mb-3">
          <button className="btn btn-primary" onClick={handleConvertAll} disabled={isLoading || !file}>
            Convertir
          </button>
        </div>

        {isLoading && (
          <div className="my-3 text-center">
            <div className="spinner-border text-primary mb-2" role="status"></div>
            <p className="text-muted">Traitement en cours...</p>
          </div>
        )}

        {convertedPdfUrl && (
          <div className="my-4">
            <h5 className="text-success mb-2">PDF converti :</h5>
            <iframe src={convertedPdfUrl} width="100%" height="600px" title="PDF converti"></iframe>
          </div>
        )}

        {markdownText && (
          <div className="my-4">
            <h5 className="text-success mb-2">Markdown extrait :</h5>
            <pre style={{ whiteSpace: "pre-wrap", maxHeight: "300px", overflowY: "auto" }}>{markdownText}</pre>
          </div>
        )}

        {labeledData && (
          <div className="my-4">
            <h5 className="text-success mb-2">Données labellisées extraites :</h5>
            <pre style={{ whiteSpace: "pre-wrap", maxHeight: "300px", overflowY: "auto" }}>
              {JSON.stringify(labeledData, null, 2)}
            </pre>
          </div>
        )}

        <div className="d-flex justify-content-between mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={onPrev} disabled={isLoading}>
            Retour
          </button>
          <button type="button" className="btn btn-primary" onClick={onNext} disabled={isLoading}>
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default Converting;
