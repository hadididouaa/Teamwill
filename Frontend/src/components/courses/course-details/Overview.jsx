import { useEffect, useState } from 'react';
import axios from 'axios';

const Overview = ({ formationId }) => {
   const [description, setDescription] = useState('');
   const [plan, setPlan] = useState([]);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchData = async () => {
         const API = import.meta.env.VITE_API_URL;

         try {
            const [descRes, planRes] = await Promise.all([
               axios.get(`${API}/module/${formationId}/description`, {
                  withCredentials: true,
               }),
               axios.get(`${API}/module/${formationId}/plan`, {
                  withCredentials: true,
               }),
            ]);

            console.log("✅ Response Data:", descRes.data, planRes.data);

            setDescription(descRes.data.description);

            // If plan is stored as a string (e.g., "step1, step2, step3"), convert it to array
            const planData = planRes.data.plan;
            const planArray = Array.isArray(planData)
               ? planData
               : typeof planData === 'string'
               ? planData.split(',').map(p => p.trim())
               : [];

            setPlan(planArray);
         } catch (err) {
            setError("Erreur lors du chargement des détails de la formation.");
            console.error(err);
         }
      };

<<<<<<< HEAD
      if (formationId) {
         console.log("📌 formationId received in Overview:", formationId);
         fetchData();
      }
   }, [formationId]);
=======
     
   if (formationId) {
      console.log("📌 formationId received in Overview:", formationId);
      fetchData();
   } else {
      console.warn("❌ formationId is undefined or null");
   }
}, [formationId]);
>>>>>>> 8f6f99e9b575afce53dd0ea23def142b60c98229

   return (
      <div className="courses__overview-wrap">
         {error && <p style={{ color: 'red' }}>{error}</p>}

         <h3 className="title">Course Description</h3>
         <p>{description || 'Chargement de la description...'}</p>

         <h3 className="title">What you'll learn in this course?</h3>
         <ul className="about__info-list list-wrap">
            {plan.length > 0 ? (
               plan.map((item, index) => (
                  <li className="about__info-list-item" key={index}>
                     <i className="flaticon-angle-right"></i>
                     <p className="content">{item}</p>
                  </li>
               ))
            ) : (
               <p>Chargement du plan...</p>
            )}
         </ul>
      </div>
   );
};

export default Overview;
