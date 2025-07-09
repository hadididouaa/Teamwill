import StudentDashboardArea from '../dashboard/student-dashboard/student-dashboard/StudentDashboardArea';
import DashboardLayout from '../layouts/DashboardLayout';

const StudentDashboard = () => {
   return (
      <DashboardLayout pageTitle="apprenant Dashboard">
        <StudentDashboardArea /> 
      </DashboardLayout>

   );
};

export default StudentDashboard;