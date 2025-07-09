import { useState } from 'react';
import ReactPaginate from 'react-paginate';
import CourseTop from './CourseTop';
import UseFinishedFormations from '../../../hooks/UseFinishedFormations';
import { Link, useNavigate } from 'react-router-dom';
import BtnArrow from '../../../svg/BtnArrow';
import axios from 'axios';

const StudentFormations = () => {
  const { formations, setFormations, loading, error } = UseFinishedFormations();
  const navigate = useNavigate();  // To redirect after enrollment
  const itemsPerPage = 6;
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = formations.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(formations.length / itemsPerPage);

  const startOffset = itemOffset + 1;
  const totalItems = formations.length;

  const handlePageClick = ({ selected }) => {
    const newOffset = (selected * itemsPerPage) % formations.length;
    setItemOffset(newOffset);
  };

  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const handleEnroll = async (formationId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/formations/${formationId}/status`, null, { withCredentials: true });
      navigate(`/formation/${formationId}`);
    } catch (err) {
      console.error('Error enrolling in formation:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  if (formations.length === 0) {
    return (
      <div className="col-xl-9 col-lg-8">
        <p>There’s no formation right now, wait until it’s been created, or call your administrator.</p>
      </div>
    );
  }

  return (
    <div className="progress__courses-wrap">
      <div className="dashboard__content-title">
        <h4 className="title">Available Formations</h4>
      </div>
      <div className="tab-content" id="myTabContent">
        <div className={`tab-pane fade ${activeTab === 0 ? 'show active' : ''}`} id="grid" role="tabpanel" aria-labelledby="grid-tab">
          <div className="row courses__grid-wrap row-cols-1 row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-sm-1">
            {currentItems.map((item) => {
              const randomIndex = Math.floor(Math.random() * 10) + 1;
              const imagePath = `/assets/img/formations/thumb${randomIndex}.jpg`;

              return (
                <div key={item.id} className="col">
                  <div className="courses__item shine__animate-item">
                    <div className="courses__item-thumb">
                      <Link to={`#/formation/${item.id}`} className="shine__animate-link">
                        <img src={imagePath} alt="img" />
                      </Link>
                    </div>
                    <div className="courses__item-content">
                      <ul className="courses__item-meta list-wrap">
                        <li className="courses__item-tag">
                          <Link to="#">{item.thematique}</Link>
                        </li>
                        <li className="avg-rating">
                          <i className="fas fa-star"></i> ({item.rating || 0} Reviews)
                        </li>
                      </ul>
                      <h5 className="title">
                        <Link to={`#/formation/${item.id}`}>{item.titre}</Link>
                      </h5>
                      <p className="author">
                        By <Link to="#">{item.User?.username || 'Unknown'}</Link>
                      </p>
                      <div className="progress-bar-container mt-2">
                        <div className="progress" style={{ height: '8px', backgroundColor: '#f1f1f1', borderRadius: '4px' }}>
                          <div
                            className="progress-bar"
                            style={{
                              width: `${item.progress || 0}%`,
                              backgroundColor: item.progress === 100 ? '#28a745' : '#ffc107',
                              height: '100%',
                              borderRadius: '4px',
                              transition: 'width 0.3s ease',
                            }}
                          ></div>
                        </div>
                        <small>{item.progress || 0}% completed</small>
                      </div>
                      <div className="courses__item-bottom">
                        <div className="button">
                          {item.progress === 100 ? (
                            <Link to={`/formation/${item.id}`}>
                              <span className="text">certificate attributed</span>
                              <i className="flaticon-arrow-right"></i>
                            </Link>
                          ) : (
                            <div className="load-more-btn text-center mt-20">
                              <button onClick={() => handleEnroll(item.id)} className="link-btn">
                                Enroll <BtnArrow />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <nav className="pagination__wrap mt-30">
            <ReactPaginate
              breakLabel="..."
              onPageChange={handlePageClick}
              pageRangeDisplayed={3}
              pageCount={pageCount}
              renderOnZeroPageCount={null}
              className="list-wrap"
            />
          </nav>
        </div>
      </div>
    </div>
  );
};

export default StudentFormations;
