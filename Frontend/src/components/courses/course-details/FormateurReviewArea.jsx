import { useEffect, useState } from "react";
import axios from "axios";
const FormateurReviewArea = ({ formationId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  // State to track reply inputs keyed by review id
  const [replyTexts, setReplyTexts] = useState({});

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluations/admin/reviews/${formationId}`,
        { withCredentials: true }
      );

      const reviews = res.data || [];
      setReviews(reviews);

      const total = reviews.length;
      const sum = reviews.reduce((acc, r) => acc + Number(r.nbPoint || 0), 0);
      const average = total > 0 ? parseFloat((sum / total).toFixed(1)) : 0;

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
    const fetchIdentity = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_URL}/users/getonce`, {
          withCredentials: true,
        });
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur :", err);
      }
    };

    if (formationId) {
      fetchIdentity();
      fetchReviews();
    }
  }, [formationId]);

  // Handle reply input change
  const handleReplyChange = (id, value) => {
    setReplyTexts((prev) => ({ ...prev, [id]: value }));
  };

  // Submit reply to backend
  const handleReplySubmit = async (id) => {
    const reply = replyTexts[id];
    if (!reply || reply.trim() === "") {
      alert("Le message de réponse ne peut pas être vide.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/evaluations/reviews/${id}/reply`,
        { reply },
        { withCredentials: true }
      );

      // Update the specific review in the state with the new reply info
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === id
            ? { ...review, reply: res.data.review.reply, replyBy: res.data.review.replyBy }
            : review
        )
      );

      // Clear reply input for this review
      setReplyTexts((prev) => ({ ...prev, [id]: "" }));

      alert("Réponse enregistrée !");
    } catch (err) {
      console.error("Erreur lors de la réponse :", err);
      alert("Erreur lors de la réponse.");
    }
  };

  // Render stars function
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
                <img src="/assets/img/courses/anonyme.png" alt="img" />
              </div>
              <div className="review-author-content">
                <div className="author-name">
                  <h5 className="name">
                    {"Utilisateur Anonyme"}{" "}
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </h5>
                  {renderStars(review.nbPoint)}
                </div>
                <h4 className="title">{review.Formation?.title}</h4>
                <p>{review.commentaire}</p>

                {/* Show reply if exists */}
                {review.reply && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "5px",
                      fontStyle: "italic",
                    }}
                  >
                    <strong>Réponse de {review.replyBy}:</strong> {review.reply}
                  </div>
                )}

                {/* Reply input and button */}
                <textarea
                  value={replyTexts[review.id] || ""}
                  onChange={(e) => handleReplyChange(review.id, e.target.value)}
                  placeholder="Écrire une réponse..."
                  style={{ width: "100%", marginTop: "10px", minHeight: "60px", resize: "vertical" }}
                />
                <button
                  onClick={() => handleReplySubmit(review.id)}
                  style={{
                    background: "#007bff",
                    color: "white",
                    padding: "5px 10px",
                    border: "none",
                    borderRadius: "4px",
                    marginTop: "5px",
                    cursor: "pointer",
                  }}
                >
                  Répondre
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default FormateurReviewArea;



