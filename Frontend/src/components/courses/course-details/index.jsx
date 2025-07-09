import Footer from "../../../layouts/footers/Footer";
import HeaderFour from "../../../layouts/headers/HeaderFour";

import BreadcrumbTwo from "../../common/breadcrumb/BreadcrumbTwo";
import CourseDetailsArea from "./CourseDetailsArea";

const CourseDetails = () => {

   return (
      <>
         <HeaderFour />
         <main className="main-area fix">
            <BreadcrumbTwo title="Resolving Conflicts Between Designers And Engineers" sub_title="Courses" />
            <CourseDetailsArea />
         </main>
         <Footer />
      </>
   );
};

export default CourseDetails;
