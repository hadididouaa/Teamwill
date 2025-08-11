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
   
   // Function to translate roles to English
   const translateRole = (role) => {
      switch(role) {
         case 'Admin': return 'Admin';
         case 'Psychologue': return 'Psychologist';
         case 'RH': return 'HR';
         case 'Collaborateur': return 'Collaborator';
         default: return role;
      }
   };

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
                                 ? "#a8b845"
                                 : user?.roleUtilisateur === "Psychologue"
                                 ? "#a8b845"
                                 : user?.roleUtilisateur === "RH"
                                 ? "#a8b845"
                                 : "#a8b845", // Default color for Collaborator
                           color: "#fff",
                           fontWeight: "600",
                           fontSize: "0.75rem",
                           textTransform: "uppercase",
                           display: "inline-block",
                        }}
                     >
                        {translateRole(user?.roleUtilisateur) || "Loading..."}
                     </span>
                  </div>
               </div>
            </div>
               {/* Role-based button */}
               {(user?.roleUtilisateur === "Admin" || user?.roleUtilisateur === "Psychologue") && (
                  <div className="dashboard__instructor-info-right">
                     
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