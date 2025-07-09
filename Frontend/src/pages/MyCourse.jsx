import DashboardLayout from '../layouts/DashboardLayout';
import InstructorCourse from "../components/courses/course/InstructorCourse"


const MyCourse = () => {
  return (

      <DashboardLayout pageTitle="All formations">
          <InstructorCourse />
      </DashboardLayout>
  );
};
export default MyCourse;
