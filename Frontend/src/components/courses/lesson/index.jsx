import Footer from "../../../layouts/footers/Footer";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import LessonArea from "./LessonArea";

const Lesson = ({ lessonId, filename }) => { // Accept filename as a prop
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
<<<<<<< HEAD
<<<<<<< HEAD
            <LessonArea lessonId={lessonId} filename={filename} /> {/* Pass filename prop here */}
=======
            <LessonArea lessonId={lessonId} filname={filename} /> {/* Pass filename prop here */}
>>>>>>> 0ba544aabdf93e3d14484ec8d06e1fa5099fef33
=======
            <LessonArea lessonId={lessonId} filname={filename} /> {/* Pass filename prop here */}
>>>>>>> 8f6f99e9b575afce53dd0ea23def142b60c98229
         </main>
         <Footer />
      </>
   );
};

export default Lesson;
