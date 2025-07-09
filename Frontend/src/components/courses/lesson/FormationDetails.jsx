import { useState, useEffect } from "react";
import axios from "axios";
import Details from "../course-details/Details";
import Reviews from "../course-details/Reviews";
import StudentReviewArea from "../../../dashboard/student-dashboard/student-review/StudentReviewArea";
import FormateurReviewArea from "../course-details/FormateurReviewArea";

const FormationDetails = ({ formationId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [role, setRole] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get the logged-in user
        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/auth`, {
          withCredentials: true,
        });
        
        const user = userRes.data;
        console.log("🔐 Logged-in user:", user);
        console.log("🧑‍💼 User Role:", user.roleUtilisateur);

        // 2. Get the formation data
        const formationRes = await axios.get(`${import.meta.env.VITE_API_URL}/formations/${formationId}`, {
          withCredentials: true,
        });
        const formation = formationRes.data;
        console.log("📚 Formation data:", formation);
        console.log("🧑‍💼 User Role:", user.roleUtilisateur);
        // 3. Check if user is the formateur and the owner of the formation
        const isSameId = Number(formation.userId) === Number(user.id);
        const isOwnerCheck = user.roleUtilisateur === "Formateur" && isSameId;

        console.log(`👥 Comparing formation.userId (${formation.userId}) with user.id (${user.id}) => Match:`, isSameId);
        console.log(isOwnerCheck
          ? "✅ User is the owner (Formateur) of this formation."
          : "❌ User is NOT the owner of this formation.");

        setRole(user.roleUtilisateur);
        setIsOwner(isOwnerCheck);
        setLoading(false);

      } catch (error) {
        console.error("❗ Erreur lors de la récupération des données:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [formationId]);

  if (loading) return <div>Loading...</div>;

  const renderReviewComponent = () => {
    if (role === "Admin") {
      console.log("🔍 Render: Admin -> Reviews");
      return <Reviews formationId={formationId} />;
    }

    if (role === "Formateur") {
      if (isOwner) {
        console.log("🔍 Render: Formateur (owner) -> FormateurReviewArea");
        return <FormateurReviewArea formationId={formationId} isCreator={true} />;
        console.log("🔍 Render: Formateur (not owner) -> StudentReviewArea");
        return <StudentReviewArea formationId={formationId} />;
      }
    }

    console.log("🔍 Render: Apprenant -> StudentReviewArea");
    return <StudentReviewArea formationId={formationId} />;
  };

  const tabTitles = ["Overview", "Reviews"];

  return (
    <div className="courses__details-content lesson__details-content">
      <ul className="nav nav-tabs" id="myTab" role="tablist">
        {tabTitles.map((tab, index) => (
          <li
            key={index}
            onClick={() => setActiveTab(index)}
            className="nav-item"
            role="presentation"
          >
            <button
              className={`nav-link ${activeTab === index ? "active" : ""}`}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-content" id="myTabContent">
        <div
          className={`tab-pane fade ${activeTab === 0 ? "show active" : ""}`}
          id="overview-tab-pane"
          role="tabpanel"
        >
          <Details formationId={formationId} />
        </div>

        <div
          className={`tab-pane fade ${activeTab === 1 ? "show active" : ""}`}
          id="reviews-tab-pane"
          role="tabpanel"
        >
          {renderReviewComponent()}
        </div>
      </div>
    </div>
  );
};
export default FormationDetails;
