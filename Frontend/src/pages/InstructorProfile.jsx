import InstructorAttemptsConten from '../dashboard/instructor-dashboard/instructor-attempts/listUsers';
import DashboardLayout from '../layouts/DashboardLayout';

const InstructorProfile = () => {
   return (
      <DashboardLayout pageTitle="List Users">
         <InstructorAttemptsConten/>
      </DashboardLayout>
   );
};

export default InstructorProfile;