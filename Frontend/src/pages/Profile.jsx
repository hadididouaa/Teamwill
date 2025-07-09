import ProfileContent from '../dashboard/student-dashboard/student-profile/ProfileContent';
import DashboardLayout from '../layouts/DashboardLayout';

const Profile = () => {
   return (
      <DashboardLayout pageTitle="edit profile">
         <ProfileContent style={true} />
      </DashboardLayout>
   );
};

export default Profile;