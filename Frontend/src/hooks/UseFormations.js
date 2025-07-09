import { useEffect, useState } from "react";
import axios from "axios";

const UseFormations = () => {
  
   const [formations, setFormations] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   
   useEffect(() => {
      const fetchFormations = async () => {
         try {

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/formations/all`, { withCredentials: true });
            setFormations(response.data);
         } catch (err) {
            setError("Erreur lors du chargement des formations.");
         } finally {
            setLoading(false);
         }
      };
      fetchFormations();
   }, []);

   return {
      formations,
      setFormations,
      loading,
      error
   }
}

export default UseFormations