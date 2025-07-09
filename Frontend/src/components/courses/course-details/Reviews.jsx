import { useEffect, useState } from "react";
import axios from "axios";

const Reviews = ({ formationId }) => {
  const [reviews, setReviews] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  // Fetch user role and then reviews if admin
  const fetchUserAndReviews = async () => {
    try {
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/getonce`, {
        withCredentials: true,
      });

      const role = userRes.data.roleUtilisateur;
      setIsAdmin(role === "Admin");

      if (role === "Admin") {
        await fetchReviews(true);
      } else {
        setReviews([]);
        setStats({
          total: 0,
          average: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        });
      }
    } catch (err) {
      console.error("Erreur lors de la récupération de l'utilisateur :", err);
    }
  };
  // Fetch reviews and calculate stats exactly like backend logic
  const fetchReviews = async (includePhoto = false)=> {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluations/admin/reviews/${formationId}?includePhoto=${includePhoto}`,
        { withCredentials: true }
      );

      const reviews = res.data || [];
      setReviews(reviews);

      // Calculate total reviews
      const total = reviews.length;

      // Calculate average rating
      const sum = reviews.reduce((acc, r) => acc + Number(r.nbPoint || 0), 0);
      const average = total > 0 ? parseFloat((sum / total).toFixed(1)) : 0;

      // Calculate rating distribution (1 to 5)
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach((r) => {
        const rating = Math.floor(Number(r.nbPoint));
        if (rating >= 1 && rating <= 5) distribution[rating]++;
      });

      setStats({ total, average, distribution });
    } catch (err) {
      console.error("Erreur lors du chargement des évaluations :", err);
    }
  };

  useEffect(() => {
    if (formationId) {
      fetchUserAndReviews();
    }
  }, [formationId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette évaluation ?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/evaluations/reviews/${id}`, {
        withCredentials: true,
      });
      // Update reviews list and stats after deletion
      const updatedReviews = reviews.filter((r) => r.id !== id);
      setReviews(updatedReviews);

      // Recalculate stats after delete
      const total = updatedReviews.length;
      const sum = updatedReviews.reduce((acc, r) => acc + Number(r.nbPoint || 0), 0);
      const average = total > 0 ? parseFloat((sum / total).toFixed(1)) : 0;
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      updatedReviews.forEach((r) => {
        const rating = Math.floor(Number(r.nbPoint));
        if (rating >= 1 && rating <= 5) distribution[rating]++;
      });
      setStats({ total, average, distribution });
      alert("Évaluation supprimée !");
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      alert("Erreur lors de la suppression.");
    }
  };
  // Render star icons for each review
  const renderStars = (note) => {
    const parsedNote = Number(note);
    if (isNaN(parsedNote) || parsedNote < 0 || parsedNote > 5) {
      return <div className="author-rating">Note invalide</div>;
    }
    const rating = Math.floor(parsedNote);
    return (
      <div className="author-rating">
        {[...Array(rating)].map((_, i) => (
          <i key={`full-${i}`} className="fas fa-star"></i>
        ))}
        {[...Array(5 - rating)].map((_, i) => (
          <i key={`empty-${i}`} className="far fa-star"></i>
        ))}
      </div>
    );
  };
  // Prepare data for rating distribution bar chart
  const review_data = [5, 4, 3, 2, 1].map((star) => {
    const count = stats.distribution[star] || 0;
    const width = stats.total ? Math.round((count / stats.total) * 100) : 0;
    return {
      id: star,
      rating: star,
      width,
      review: count,
    };
  });

  return (
    <div className="courses__rating-wrap">
      <h2 className="title">Avis</h2>

      <div className="course-rate">
        <div className="course-rate__summary">
          <div className="course-rate__summary-value">{stats.average.toFixed(1)}</div>
          <div className="course-rate__summary-stars">
            {[...Array(5)].map((_, i) => (
              <i
                key={i}
                className={i < Math.round(stats.average) ? "fas fa-star" : "far fa-star"}
              ></i>
            ))}
          </div>
          <div className="course-rate__summary-text">{stats.total} Avis</div>
        </div>

        <div className="course-rate__details">
          {review_data.map((item) => (
            <div key={item.id} className="course-rate__details-row">
              <div className="course-rate__details-row-star">
                {item.rating} <i className="fas fa-star"></i>
              </div>
              <div className="course-rate__details-row-value">
                <div className="rating-gray"></div>
                <div
                  className="rating"
                  style={{ width: `${item.width}%` }}
                  title={`${item.width}%`}
                ></div>
                <span className="rating-count">{item.review}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="course-review-list">
        {reviews.length === 0 ? (
          <p>Aucune évaluation disponible.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="course-review-head">
              <div className="review-author-thumb">
                <img
                      src={review.User?.photo ? review.User.photo : "/assets/img/courses/anonyme.png"}
                      alt="img"
                />
              </div>
              <div className="review-author-content">
                <div className="author-name">
                  <h5 className="name">
                    {review.User?.username || "Utilisateur"}{" "}
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </h5>
                  {renderStars(review.nbPoint)}
                </div>
                <h4 className="title">{review.Formation?.title}</h4>
                <p>{review.commentaire}</p>
                {review.reply && (
                <div style={{ marginTop: '10px', padding: '10px', borderLeft: '3px solid #007BFF', backgroundColor: '#f0f8ff' }}>
                  <strong>Réponse de {review.replyBy || "Admin"}:</strong>
                  <p>{review.reply}</p>
                </div>
              )}

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    style={{
                      background: "red",
                      color: "white",
                      padding: "5px 10px",
                      border: "none",
                      borderRadius: "4px",
                      marginTop: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


  
export default Reviews;