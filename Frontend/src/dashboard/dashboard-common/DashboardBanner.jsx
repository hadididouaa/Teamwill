import BtnArrow from "../../svg/BtnArrow";
import { useEffect, useState } from "react";
import axios from "axios";
import RegistrationArea from "../../components/inner-pages/registration/RegistrationArea"

const DashboardBanner = ({ style }) => {
   const [user, setUser] = useState(null);
   const [showModal, setShowModal] = useState(false);

   useEffect(() => {
      const fetchUser = async () => {
         try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/getOnce`, {
               withCredentials: true,
            });
   
            setUser(response.data);
         } catch (error) {
            console.error("Failed to fetch user:", error);
         }
      };
   
      fetchUser();
   }, []);
   

   return (
      <>
         <div className="dashboard__top-wrap">
            <div
               className="dashboard__top-bg"
               style={{
                  backgroundImage: `url("/assets/img/bg/cover_photo.jpg")`,
               }}
            ></div>

            <div className="dashboard__instructor-info">
               <div className="dashboard__instructor-info-left">
                  <div className="thumb">
                     <img src={user?.photo || "/assets/img/user.png"} alt="User" />
                  </div>
                  <div className="content">
                     <h4 className="title" >{user?.username || user?.email || "Loading..."}</h4>
                     <div className="review__wrap review__wrap-two">
                     <span style={{
                           padding: "4px 10px",
                           borderRadius: "12px",
                           backgroundColor:
                              user?.roleUtilisateur === "Admin"
                                 ? "#a8b845"       // Red for Admin
                                 : user?.roleUtilisateur === "Formateur"
                                 ? "#a8b845"       // Blue for Formateur
                                 : "#a8b845",      // Green for Apprenant (default)
                           color: "#fff",
                           fontWeight: "600",
                           fontSize: "0.75rem",
                           textTransform: "uppercase",
                           display: "inline-block",
                        }}
                     >
                        {user?.roleUtilisateur || "Loading..."}
                     </span>
                  </div>
               </div>
            </div>
               {/* Role-based button */}
               {(user?.roleUtilisateur === "Admin" || user?.roleUtilisateur === "Formateur") && (
                  <div className="dashboard__instructor-info-right">
                     <button className="pill-button" onClick={() => setShowModal(true)}>
                        {user?.roleUtilisateur === "Admin" ? "ajouter un utilisateur" : "Ajouter une formation"} <BtnArrow />
                     </button>
                  </div>
               )}
            </div>
         </div>

         {/* Modal */}
         {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
               <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                  
                 {/* Show RegistrationArea only for Admin */}
                  {user?.roleUtilisateur === "Admin" && <RegistrationArea />}
                  </div>
            </div>
         )}
      </>
   );
};

export default DashboardBanner;
