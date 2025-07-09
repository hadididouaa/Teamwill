import Stats from "./stats";
import MiniCourseArea from "../../../components/courses/course/MiniCourseArea";
import Graphics from "./Graphics";
const DashboardHomeArea = () => {

   return (
      <div className="col-lg-9">                     
         <div className="dashboard__count-wrap">
            <div className="dashboard__content-title">
               <h4 className="title">Dashboard</h4>
            </div>
            <div className="row">
               <Stats />
               <Graphics />
            </div>
         </div>         
       
      </div>
   );
};

export default DashboardHomeArea;
