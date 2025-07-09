import { useState } from 'react';
import UseFormations from '../../../hooks/UseFinishedFormations';
import { Link } from 'react-router-dom';

const MiniCourseArea = () => {
  const { formations, loading, error } = UseFormations();
  const itemsToShow = 6;

  // Only take the first 6 items
  const currentItems = formations.slice(0, itemsToShow);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="mini-course-area">
     

      <div className="row courses__grid-wrap row-cols-1 row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-sm-1">
        {currentItems.map((item) => {
          const randomIndex = Math.floor(Math.random() * 10) + 1;
          const imagePath = `/assets/img/formations/thumb${randomIndex}.jpg`;

          const avgRating = (item.averageRating || 0).toFixed(1);
          const reviewCount = item.totalReviews || 0;
          const isRated = parseFloat(avgRating) > 0;

          return (
            <div key={item.id} className="col">
              <div className="courses_item shine_animate-item">
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
                    <li>
                      <i className={`fas ${isRated ? "fa-star" : "fa-star-o"}`}></i>{" "}
                      {avgRating} / 5 ({reviewCount} avis)
                    </li>
                  </ul>
                  <h5 className="title">
                    <Link to={`/course-details/${item.id}`}>{item.titre}</Link>
                  </h5>
                  <p className="author">
                    By <Link to="#">{item.creator?.username || 'Unknown'}</Link>
                  </p>
                  <div className="courses__item-bottom">
                    <div className="button">
                      <Link to={`/formation/${item.id}`}>
                        <span className="text">S'inscrire</span>
                        <i className="flaticon-arrow-right"></i>
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

export default MiniCourseArea;
