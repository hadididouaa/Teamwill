import { useState, useEffect } from "react";
import axios from 'axios';
import FormationStatusPie from "./FormationStatusPie"; 
import UserRolePie from "./UserRolePie";
import MockEnrollmentData from './MockEnrollmentData';

const Graphics = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/auth`, {
          withCredentials: true,
        });
        setUserRole(res.data.roleUtilisateur);
      } catch (err) {
        console.error("Erreur lors de la récupération du rôle de l'utilisateur :", err);
      }
    };

    fetchUserRole();
  }, []);
  return (
    <div className="container">
      {/* First Row: Two Cards Side-by-Side */}
      <div className="row">
        {/* for the Admin role */}
        {/* User Pie Chart  */}
          {userRole === "Admin" && (
          <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
            <div className="dashboard__counter-item" style={{ minHeight: 280, height: 370 }}>
              <p style={{ textAlign: "center" }}>nombre d'utilisateur</p>
              <UserRolePie />
            </div>
          </div>
        )}
        {/* Formation Status Pie */}
        <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
          <div className="dashboard__counter-item" style={{ minHeight: 280 }}>
           <p style={{ textAlign: "center" }}>Répartition des Formations</p>
            <div style={{ width: "100%", height: 270 }}>
              <FormationStatusPie />
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Bar Chart */}
      <div className="row">
        <div className="col-12">
          <div className="dashboard__counter-item" style={{ minHeight: 280 }}>
           <MockEnrollmentData />

            <p style={{ textAlign: "center" }}>Inscriptions par Formation</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Graphics;
