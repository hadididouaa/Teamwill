import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const API = "https://your-api-url.com"; // Replace with your actual API base URL

const LessonFaq = () => {
   const { formationId } = useParams(); // Assumes you're using a route like /formation/:formationId
   const [faqData, setFaqData] = useState([]);

   useEffect(() => {
      const fetchPlan = async () => {
         try {
            const response = await axios.get(`${API}/module/${formationId}/plan`, {
               withCredentials: true,
            });
            setFaqData(response.data); // Adjust according to actual API response structure
         } catch (error) {
            console.error("Failed to fetch plan:", error);
         }
      };

      fetchPlan();
   }, [formationId]);

   return (
      <div className="accordion" id="accordionExample">
         {faqData.map((item) => (
            <div key={item.id} className="accordion-item">
               <h2 className="accordion-header">
                  <button
                     className={`accordion-button`}
                     type="button"
                     data-bs-toggle="collapse"
                     data-bs-target={`#collapseOne${item.id}`}
                     aria-expanded="true"
                     aria-controls={`collapseOne${item.id}`}
                  >
                     {item.title}
                     <span>{item.count}</span>
                  </button>
               </h2>
               <div
                  id={`collapseOne${item.id}`}
                  className="accordion-collapse collapse show"
                  data-bs-parent="#accordionExample"
               >
                  <div className="accordion-body">
                     <ul className="list-wrap">
                        {item.faq_details.map((detail, i) => (
                           <li key={i} className="course-item">
                              <div className="course-item-link">
                                 <span className="item-name">{detail.title}</span>
                                 <div className="course-item-meta">
                                    <span className="item-meta duration">{detail.duration}</span>
                                 </div>
                              </div>
                           </li>
                        ))}
                     </ul>
                     <div className="mt-3">
                        <Link to={`/formation/${formationId}/quiz`} className="btn btn-primary">
                           Take Quiz
                        </Link>
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>
   );
};

export default LessonFaq;
