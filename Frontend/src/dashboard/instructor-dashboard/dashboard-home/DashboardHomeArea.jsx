import Stats from "./Stats";
import MiniCourseArea from "../../../components/courses/course/MiniCourseArea";
import Graphics from "./Graphics";
import QuestionnaireResults from '../../../pages/QuestionnaireResults';
import UserResultsPage from '../../../pages/UserResultsPage';
import { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardHomeArea = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/getonce`, {
          withCredentials: true,
        });
        setUserRole(res.data.roleUtilisateur);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user role:", error.message);
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="dashboard__count-wrap">
          <div className="dashboard__content-title">
            <h4 className="title">Dashboard</h4>
          </div>
          <div className="row">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-9">                     
      <div className="dashboard__count-wrap">
        <div className="dashboard__content-title">
          <h4 className="title">Dashboard</h4>
        </div>
        <div className="row">
          {(userRole === "Psychologue" || userRole === "Admin" || userRole === "RH") && <QuestionnaireResults />}
          {userRole === "Collaborateur" && <UserResultsPage />}
          {/* Ajoutez d'autres rôles si nécessaire */}
        </div>
      </div>         
    </div>
  );
};

export default DashboardHomeArea;