import BtnArrow from "../../svg/BtnArrow";
import { useEffect, useState } from "react";
import axios from "axios";
import RegistrationArea from "../../components/inner-pages/registration/RegistrationArea";

const DashboardBanner = ({ style }) => {
   const [user, setUser] = useState(null);
   const [showModal, setShowModal] = useState(false);

   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

   const getPhotoUrl = (photo) => {
      if (!photo) return null;
      if (typeof photo !== 'string') return null;
      if (photo.startsWith('http')) return photo;
      if (photo.startsWith('/')) return `${API_URL}${photo}`;
      return `${API_URL}/uploads/${photo}`;
   };

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
                     {/* avatar: use background-image for consistent cover behaviour and show initials fallback */}
                     {getPhotoUrl(user?.photo) ? (
                        <div
                           className="avatar"
                           role="img"
                           aria-label={user?.username || user?.email || 'User avatar'}
                           style={{
                              backgroundImage: `url(${getPhotoUrl(user?.photo)})`,
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              border: '2px solid var(--tg-common-color-white)',
                              padding: '4px',
                              boxSizing: 'border-box',
                           }}
                        />
                     ) : (
                        <div className="avatar avatar--fallback">
                           <img src="/assets/img/user.png" alt="User" />
                        </div>
                     )}
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
                                    ? "#a8b845"
                                    : user?.roleUtilisateur === "Psychologue"
                                    ? "#a8b845"
                                    : "#a8b845",
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