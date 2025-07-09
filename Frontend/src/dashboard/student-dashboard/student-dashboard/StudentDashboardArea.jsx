import StudentFormations from "../../../components/courses/course/StudentFormations"
import Stats from "../../instructor-dashboard/dashboard-home/stats"

const StudentDashboardArea = () => {
   return (
      <>
      <div className="dashboard__count-wrap">
         <div className="dashboard__content-title">
            <h4 className="title">Dashboard</h4>
         </div>
         <div className="row">
            <Stats />
         </div>
      </div>        
      <StudentFormations/>
</>
   )
}

export default StudentDashboardArea
