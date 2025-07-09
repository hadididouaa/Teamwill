import StudentProfileContent from '../dashboard/student-dashboard/student-profile/StudentProfileContent';
import DashboardLayoutStudent from '../layouts/DashboardLayoutStudent';

const StudentProfile = () => {
   return (
      <DashboardLayoutStudent pageTitle="edit profile">
         <StudentProfileContent style={true} />
      </DashboardLayoutStudent>
   );
};

export default StudentProfile;