import { useEffect, useState } from "react";
import axios from "axios";
const UseFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormationsAndRatings = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/formations/all`, { withCredentials: true });
        const formationsData = response.data;

        // For each formation, fetch reviews and calculate average rating
        const formationsWithRatings = await Promise.all(
          formationsData.map(async (formation) => {
            try {
              // Fetch reviews for this formation
              const reviewsRes = await axios.get(
                `${import.meta.env.VITE_API_URL}/evaluations/${formation.id}/reviews`,
                { withCredentials: true }
              );
              const reviews = reviewsRes.data || [];

              // Calculate average rating for this formation
              const totalReviews = reviews.length;
              const sumRatings = reviews.reduce((acc, r) => acc + Number(r.nbPoint || 0), 0);
              const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

              return { 
                ...formation, 
                evaluations: reviews,
                averageRating: parseFloat(averageRating.toFixed(1)),
                totalReviews,
              };
            } catch (err) {
              // If error fetching reviews, just keep formation data without rating
              return { ...formation, averageRating: 0, totalReviews: 0 };
            }
          })
        );

        setFormations(formationsWithRatings);
      } catch (err) {
        setError("");
      } finally {
        setLoading(false);
      }
    };

    fetchFormationsAndRatings();
  }, []);

  return {
    formations,
    setFormations,
    loading,
    error,
  };
};

export default UseFormations;
