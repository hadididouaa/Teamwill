import BtnArrow from "../../svg/BtnArrow";
import { useEffect, useState } from "react";
import axios from "axios";
import RegistrationArea from "../../components/inner-pages/registration/RegistrationArea";

const DashboardBanner = ({ style }) => {
   const [user, setUser] = useState(null);
   const [showModal, setShowModal] = useState(false);

   useEffect(() => {
      const fetchCurrentUser = async () => {
         try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/getOnce`, {
               withCredentials: true,
            });
            setUser(response.data);
         } catch (error) {
            console.error("Failed to fetch current user:", error);
         }
      };

      fetchCurrentUser();
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
                     <h4 className="title">{user?.username || user?.email || "Loading..."}</h4>
                     <div className="review__wrap review__wrap-two" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <span
                           style={{
                              padding: "4px 10px",
                              borderRadius: "12px",
                              backgroundColor:
                                 user?.roleUtilisateur === "Admin"
                                    ? "#ff4d4f"
                                    : user?.roleUtilisateur === "Psychologue"
                                    ? "#1890ff"
                                    : "#52c41a",
                              color: "#fff",
                              fontWeight: "600",
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              display: "inline-block",
                           }}
                        >
                           {user?.roleUtilisateur || "Loading..."}
                        </span>

                        {/* optional extra info line if available */}
                        {(user?.Grade?.name || user?.Profil?.name || user?.PracticeSolution?.name) && (
                           <div
                              style={{
                                 marginTop: "8px",
                                 fontSize: "0.85rem",
                                 color: "#ffffff",
                                 fontWeight: "400",
                              }}
                           >
                              {`${user?.Grade?.name || "-"}`} / {`${user?.Profil?.name || "-"}`} / {`${user?.PracticeSolution?.name || "-"}`}
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {user?.roleUtilisateur === "Admin" && (
                  <div className="dashboard__instructor-info-right">
                     <button className="pill-button" onClick={() => setShowModal(true)}>
                        Add new user <BtnArrow />
                     </button>
                  </div>
               )}
            </div>
         </div>

         {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
               <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="close-btn" onClick={() => setShowModal(false)}>
                     ✕
                  </button>
                  {user?.roleUtilisateur === "Admin" && <RegistrationArea />}
               </div>
            </div>
         )}
      </>
   );
};

export default DashboardBanner;