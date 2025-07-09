import { useEffect, useState } from "react";
import axios from "axios";

const StarRating = ({ count, onRate, editable }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ cursor: editable ? "pointer" : "default" }}>
      {Array.from({ length: 5 }, (_, idx) => {
        const isFilled = hovered ? idx < hovered : idx < count;
        return (
          <i
            key={idx}
            className={`fas fa-star me-1 ${isFilled ? "text-warning" : "text-secondary"}`}
            onClick={() => editable && onRate(idx + 1)}
            onMouseEnter={() => editable && setHovered(idx + 1)}
            onMouseLeave={() => editable && setHovered(0)}
          ></i>
        );
      })}
    </div>
  );
};
const StudentReviewArea = ({ formationId }) => {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/getonce`, {

        withCredentials: true,
      });
      setUser(res.data.user);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'utilisateur :", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluations/admin/reviews/${formationId}`,
        { withCredentials: true }
      );
      setReviews(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des avis :", err);
    }
  };

  const deleteReview = async (reviewId) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer votre avis ?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/evaluations/reviews/${reviewId}`,
        { withCredentials: true }
      );
      await fetchReviews();
    } catch (err) {
      console.error("Erreur lors de la suppression de l'avis :", err);
      alert("Échec de la suppression de l'avis.");
    }
  };

  const checkIfReviewExists = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluations/reviews/check/${formationId}`,
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      console.error("Échec de la vérification de l'avis existant :", error);
      return { exists: false };
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Veuillez sélectionner une note.");
      return;
    }
    setLoadingSubmit(true);
    try {
      const { exists, review } = await checkIfReviewExists();

      if (exists) {
        const confirmUpdate = window.confirm(
          "Vous avez déjà évalué cette formation. Voulez-vous mettre à jour votre avis ?"
        );
        if (!confirmUpdate) {
          setLoadingSubmit(false);
          return;
        }

        await axios.put(
          `${import.meta.env.VITE_API_URL}/evaluations/reviews/${review.id}`,
          {
            nbPoint: rating,
            commentaire: comment,
          },
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/evaluations/${formationId}/reviews/create`,
          {
            nbPoint: rating,
            commentaire: comment,
          },
          { withCredentials: true }
        );
      }

      await fetchReviews();
      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'avis :", err);
      alert("Échec de l'envoi de l'avis.");
    } finally {
      setLoadingSubmit(false);
    }
  };
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUser();
      await fetchReviews();
      setLoading(false);
    };
    loadData();
  }, [formationId]);

  if (loading) {
    return (
      <section className="dashboard__area section-pb-120 text-center">
        <p>Chargement en cours...</p>
      </section>
    );
  }
  return (
    <div className="courses__overview-wrap">
      <h3 className="title">Avis</h3>

      <form onSubmit={submitReview} className="mb-5">
        <div className="mb-3">
          <label className="form-label">Note :</label>
          <StarRating
            count={rating}
            onRate={(value) => setRating(value)}
            editable={!loadingSubmit}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="comment" className="form-label">
            Commentaire :
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-control"
            placeholder="Écrivez votre avis ici"
            rows={3}
            disabled={loadingSubmit}
          />
        </div>

        <button type="submit" className="pill-button" disabled={loadingSubmit}>
        {loadingSubmit ? "Envoi en cours..." : "Envoyer l'avis"}
        </button>
      </form>
      <ul className="list-group">

        {reviews.map((review) => (
          <li key={review.id} className="list-group-item mb-3">
            <div>
              <strong>Anonyme</strong>
              <div className="d-flex align-items-center">
                <StarRating count={review.nbPoint} editable={false} />
                <span className="ms-2">
                  ({review.nbPoint} étoile{review.nbPoint > 1 ? "s" : ""})
                </span>
              </div>
              <p className="mt-2">{review.commentaire}</p>

              {/* Bouton suppression */}
              {user && review.userId === user.id && (
                <button
                  onClick={() => deleteReview(review.id)}
                  className="btn btn-sm btn-danger"
                  style={{ marginBottom: "10px" }}
                >
                  <img src="../../../assets/img/icons/trash.svg" alt="Supprimer" width={16} />
                </button>
              )}

              {/* Réponses (admin ou autres) */}
              {review.replies?.length > 0 && (
                <ul className="mt-2 ps-3">
                  {review.replies.map((reply) => (
                    <li key={reply.id} className="border-start ps-2 mb-1">
                      <small>
                        <strong>{reply.author || "Admin"} :</strong> {reply.message}
                      </small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default StudentReviewArea;

