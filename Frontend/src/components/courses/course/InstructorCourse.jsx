import { useState } from 'react';
import axios from 'axios';
import UseFormationsByUser from '../../../hooks/UseFormationsByUser';
import { Link, useNavigate } from 'react-router-dom';
import BtnArrow from '../../../svg/BtnArrow';

const InstructorCourse = () => {
  const navigate = useNavigate();
  const { formations, loading, error, setFormations } = UseFormationsByUser();
  const itemsToShow = 6;
  const currentItems = formations.slice(0, itemsToShow);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la formation "${title}" ?`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/formations/${id}`, {
          withCredentials: true,
        });
        console.log(`Suppression de la formation ID: ${id}`);
        // Remove deleted formation from state
        setFormations((prev) => prev.filter((formation) => formation.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Une erreur est survenue lors de la suppression.');
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (formations.length === 0) {
    return <p>Vous n'avez encore créé aucune formation.</p>;
  }

  return (
    <div className="col">
      <div className="dashboard__content-title">
        <h4 className="title">Mes dernières formations</h4>
      </div>

      <div className="row">
        {currentItems.map((item) => {
          const randomIndex = Math.floor(Math.random() * 10) + 1;
          const imagePath = `/assets/img/formations/thumb${randomIndex}.jpg`;
          const avgRating = (item.averageRating || 0).toFixed(1);
          const reviewCount = item.totalReviews || 0;

          return (
            <div key={item.id} className="col">
              <div className="courses__item shine__animate-item">
                <div className="courses__item-thumb">
                  <Link to={`/course-details/${item.id}`} className="shine__animate-link">
                    <img src={imagePath} alt="Formation Thumbnail" />
                  </Link>
                </div>

                <div className="courses__item-content">
                  <ul className="courses__item-meta list-wrap">
                    <li className="courses__item-tag">
                      <Link to="/course">{item.thematique}</Link>
                    </li>
                    <li className="avg-rating">
                      <i className="fas fa-star"></i> {avgRating} / 5 ({reviewCount} avis)
                    </li>
                    <li>
                      <span
                        className={`badge ${
                          item.statusFormation === 'finished' ? 'bg-success' : 'bg-danger'
                        }`}
                        style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '0.8rem' }}
                      >
                        {item.statusFormation === 'finished' ? 'Terminée' : 'Créée'}
                      </span>
                    </li>
                  </ul>

                  <h5 className="title">
                    <Link to={`/course-details/${item.id}`}>{item.titre}</Link>
                  </h5>

                  <p className="author">
                    By <Link to="#">{item.creator?.username || 'Unknown'}</Link>
                  </p>

                  <div className="courses__item-bottom d-flex justify-content-between align-items-center">
                    <div className="button">
                      <Link className="link-btn" to={`/formation/${item.id}`}>
                       Voir plus <BtnArrow />
                      </Link>
                    </div>

                    <div className="icon-buttons d-flex gap-2">
                      <Link to={`/stepper/${item.id}`} title="Modifier">
                        <img
                          src="/assets/img/icons/edit.svg"
                          alt="Modifier"
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                      </Link>

                      <Link to="#" onClick={() => handleDelete(item.id, item.titre)} title="Supprimer">
                        <img
                          src="/assets/img/icons/trash.svg"
                          alt="Supprimer"
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstructorCourse; 
