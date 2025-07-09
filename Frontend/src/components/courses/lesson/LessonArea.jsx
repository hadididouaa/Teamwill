import { useEffect, useState } from "react";
import axios from "axios";
import FormationDetails from "./FormationDetails";
import File from "./File";
import NoteDigital from "./NoteDigital";
import LessonPDF from "./LessonPDF";
import { useNavigate, Link } from "react-router-dom";
import HeaderFour from "../../../layouts/headers/HeaderFour";
import { useLocation } from "react-router-dom";

const LessonArea = ({ formationId }) => {
   const [documentData, setDocumentData] = useState(null);
   const [formationTitle, setFormationTitle] = useState("");
   const navigate = useNavigate();
   const location = useLocation();
   const passedTitle = location.state?.formationTitle || "";
   useEffect(() => {
      const fetchDocument = async () => {
         try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/documents/${formationId}`, {
               withCredentials: true,
            });
            setDocumentData(res.data); // This includes filename, filetype, etc.
         } catch (err) {
            console.error("Error fetching document details:", err);
         }
      };
    if (formationId) fetchDocument();
  }, [formationId]);
  const handleGoToQuiz = async () => {
    try { await axios.patch(`${import.meta.env.VITE_API_URL}/formations/user/inProgress/${formationId}`,
        {},  { withCredentials: true }
      );
      // Navigate to quiz page
      navigate(`/passerQuiz/${formationId}`, { state: { formationTitle: passedTitle || formationTitle } });
    } catch (err) {
      console.error('Error updating to in_progress:', err);
    }
  };
  // get the formation to pass the title to the child component
  useEffect(() => {
  const fetchFormation = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/formations/${formationId}`, {
        withCredentials: true,
      });
      setFormationTitle(res.data.title);
    } catch (err) {
      console.error("Error fetching formation:", err);
    }
  };
  if (formationId) fetchFormation();
}, [formationId]);


  return (
    <>
      <HeaderFour />
      <section className="lesson__area section-pb-120" style={{ marginTop: 100 }}>
        <div className="container-fluid p-0">
          <div className="row gx-0">
            {/* Left column bigger width - PDF */}
            <div className="col-xl-9 col-lg-8">
              
              <div style={{ width: "100%", height: "100%" }}>
                {documentData?.filetype?.includes("pdf") && (
                  <LessonPDF filename={documentData.filename} />
                )}
              </div>
            </div>
            {/* Right column smaller width - NoteDigital */}
            <div className="col-xl-3 col-lg-4">
              <NoteDigital formationId={formationId} />
            </div>
          </div>

          {/* Button and FormationDetails outside the row but inside container */}
          <div className="pill-button-container mt-4 mb-5" style={{ textAlign: "right" }}  >
            <button onClick={handleGoToQuiz} className="pill-button" style={{ fontSize: "1.5rem", padding: "0.6rem 1.2rem" }}> 
            Voir Quiz
            </button>
          </div>
          <div>
            <FormationDetails formationId={formationId} />
          </div>
        </div>
      </section>
    </>
  );
};

export default LessonArea;