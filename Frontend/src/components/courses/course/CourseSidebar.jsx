import { useState } from "react";
import { useSelector } from "react-redux";
import { Rating } from 'react-simple-star-rating';
import { selectCourses } from "../../../redux/features/courseSlice";

const CourseSidebar = ({ setCourses }) => {

   const [showMoreCategory, setShowMoreCategory] = useState(false);
   const [showMoreLanguage, setShowMoreLanguage] = useState(false);
   const [showMoreInstructor, setShowMoreInstructor] = useState(false);

   const [categorySelected, setCategorySelected] = useState('');
   const [languageSelected, setLanguageSelected] = useState('');
   const [priceSelected, setPriceSelected] = useState('');
   const [skillSelected, setSkillSelected] = useState('');
   const [instructorSelected, setInstructorSelected] = useState('');
   const [ratingSelected, setRatingSelected] = useState(null);

   const categoryFilter = useSelector(selectCourses).map(course => course.category);
   const languageFilter = useSelector(selectCourses).map(course => course.language);
   const priceFilter = useSelector(selectCourses).map(course => course.price_type);
   const skillFilter = useSelector(selectCourses).map(course => course.skill_level);
   const instructorFilter = useSelector(selectCourses).map(course => course.instructors);

   const allCategory = ['All Category', ...new Set(categoryFilter)];
   const allLanguage = ['All Language', ...new Set(languageFilter)];
   const allPrice = ['All Price', ...new Set(priceFilter)];
   const allSkill = ['All Skill', ...new Set(skillFilter)];
   const allInstructor = ['All Instructors', ...new Set(instructorFilter)];

   const allCourses = useSelector(selectCourses);

   // Handle category selection
   const handleCategory = (category) => {
      setCategorySelected(prevCategory => prevCategory === category ? '' : category);
      filterCourses({ category: category === categorySelected ? '' : category });
   };

   // Handle language selection
   const handleLanguage = (language) => {
      setLanguageSelected(prevLanguage => prevLanguage === language ? '' : language);
      filterCourses({ language: language === languageSelected ? '' : language });
   };

   // Handle price selection
   const handlePrice = (price) => {
      setPriceSelected(prevPrice => prevPrice === price ? '' : price);
      filterCourses({ price: price === priceSelected ? '' : price });
   };

   // Handle skill selection
   const handleSkill = (skill) => {
      setSkillSelected(prevSkill => prevSkill === skill ? '' : skill);
      filterCourses({ skill: skill === skillSelected ? '' : skill });
   };

   // Handle Instructor selection
   const handleInstructor = (instructor) => {
      setInstructorSelected(instructor);
      filterCourses({ instructor });
   };

   // Handle rating selection
   const handleRating = (rating) => {
      setRatingSelected(prevRating => prevRating === rating ? null : rating);
      filterCourses({ rating: rating === ratingSelected ? null : rating });
   };

   // Filter courses based on selected criteria
   const filterCourses = ({ category, language, price, rating, skill, instructor }) => {
      let filteredCourses = allCourses;

      if (category && category !== 'All Category') {
         filteredCourses = filteredCourses.filter(course => course.category === category);
      }

      if (language && language !== 'All Language') {
         filteredCourses = filteredCourses.filter(course => course.language === language);
      }

      if (price && price !== 'All Price') {
         filteredCourses = filteredCourses.filter(course => course.price_type === price);
      }

      if (skill && skill !== 'All Skill') {
         filteredCourses = filteredCourses.filter(course => course.skill_level === skill);
      }

      if (instructor && instructor !== 'All Instructors') {
         filteredCourses = filteredCourses.filter(course => course.instructors === instructor);
      }

      if (rating) {
         filteredCourses = filteredCourses.filter(course => course.rating >= rating);
      }

      setCourses(filteredCourses);
   };

   // Determine categories to display based on "Show More" toggle
   const categoriesToShow = showMoreCategory ? allCategory.slice(0, 8) : allCategory;
   const languageToShow = showMoreLanguage ? allLanguage.slice(0, 4) : allLanguage;
   const instructorToShow = showMoreInstructor ? allInstructor.slice(0, 4) : allInstructor;

   return (
      <div className="col-xl-3 col-lg-4">
         <aside className="courses__sidebar">
            <div className="courses-widget">
               <h4 className="widget-title">Categories</h4>
               <div className="courses-cat-list">
                  <ul className="list-wrap">
                     {categoriesToShow.map((category, i) => (
                        <li key={i}>
                           <div onClick={() => handleCategory(category)} className="form-check">
                              <input className="form-check-input" type="checkbox" checked={category === categorySelected} readOnly id={`cat_${i}`} />
                              <label className="form-check-label" htmlFor={`cat_${i}`} onClick={() => handleCategory(category)}>{category}</label>
                           </div>
                        </li>
                     ))}
                  </ul>
                  <div className="show-more">
                     <a className={`show-more-btn ${showMoreCategory ? 'active' : ''}`} style={{ cursor: "pointer" }} onClick={() => setShowMoreCategory(!showMoreCategory)}>
                        {showMoreCategory ? "Show Less -" : "Show More +"}
                     </a>
                  </div>
               </div>
            </div>

            {/* Language Filter */}
            <div className="courses-widget">
               <h4 className="widget-title">Languages</h4>
               <div className="courses-cat-list">
                  <ul className="list-wrap">
                     {languageToShow.map((language, i) => (
                        <li key={i}>
                           <div onClick={() => handleLanguage(language)} className="form-check">
                              <input className="form-check-input" type="checkbox" checked={language === languageSelected} readOnly id={`lang_${i}`} />
                              <label className="form-check-label" htmlFor={`lang_${i}`} onClick={() => handleLanguage(language)}>{language}</label>
                           </div>
                        </li>
                     ))}
                  </ul>
                  <div className="show-more">
                     <a className={`show-more-btn ${showMoreLanguage ? 'active' : ''}`} style={{ cursor: "pointer" }} onClick={() => setShowMoreLanguage(!showMoreLanguage)}>
                        {showMoreLanguage ? "Show Less -" : "Show More +"}
                     </a>
                  </div>
               </div>
            </div>

            {/* Price Filter */}
            <div className="courses-widget">
               <h4 className="widget-title">Price</h4>
               <div className="courses-cat-list">
                  <ul className="list-wrap">
                     {allPrice.map((price, i) => (
                        <li key={i}>
                           <div onClick={() => handlePrice(price)} className="form-check">
                              <input className="form-check-input" type="checkbox" checked={price === priceSelected} readOnly id={`price_${i}`} />
                              <label className="form-check-label" htmlFor={`price_${i}`} onClick={() => handlePrice(price)}>{price}</label>
                           </div>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            {/* Skill Filter */}
            <div className="courses-widget">
               <h4 className="widget-title">Skill level</h4>
               <div className="courses-cat-list">
                  <ul className="list-wrap">
                     {allSkill.map((skill, i) => (
                        <li key={i}>
                           <div onClick={() => handleSkill(skill)} className="form-check">
                              <input className="form-check-input" type="checkbox" checked={skill === skillSelected} readOnly id={`skill_${i}`} />
                              <label className="form-check-label" htmlFor={`skill_${i}`} onClick={() => handleSkill(skill)}>{skill}</label>
                           </div>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            {/* Instructors Filter */}
            <div className="courses-widget">
               <h4 className="widget-title">Instructors</h4>
               <div className="courses-cat-list">
                  <ul className="list-wrap">
                     {instructorToShow.map((instructor, i) => (
                        <li key={i}>
                           <div onClick={() => handleInstructor(instructor)} className="form-check">
                              <input className="form-check-input" type="checkbox" checked={instructor === instructorSelected} readOnly id={`instructor_${i}`} />
                              <label className="form-check-label" htmlFor={`instructor_${i}`} onClick={() => handleInstructor(instructor)}>{instructor}</label>
                           </div>
                        </li>
                     ))}
                  </ul>
                  <div className="show-more">
                     <a className={`show-more-btn ${showMoreInstructor ? 'active' : ''}`} style={{ cursor: "pointer" }} onClick={() => setShowMoreInstructor(!showMoreInstructor)}>
                        {showMoreInstructor ? "Show Less -" : "Show More +"}
                     </a>
                  </div>
               </div>
            </div>

            {/* Rating Filter */}
            <div className="courses-widget">
               <h4 className="widget-title">Ratings</h4>
               <div className="courses-rating-list">
                  <ul className="list-wrap">
                     {[5, 4, 3, 2, 1].map((rating, i) => (
                        <li key={i}>
                           <div className="form-check">
                              <input
                                 className="form-check-input"
                                 type="radio"
                                 id={`rating_${rating}`}
                                 checked={rating === ratingSelected}
                                 onChange={() => handleRating(rating)}
                              />
                              <label className="form-check-label" htmlFor={`rating_${rating}`}>
                                 <Rating initialValue={rating} size={20} readonly />
                              </label>
                           </div>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </aside>
      </div>
   );
};

export default CourseSidebar;
