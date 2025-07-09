
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AddRewards from "../components/courses/course/AddRewards"

const InstructorDashboard = () => {
   
   return (
      <DashboardLayout pageTitle="Dashboard">      
      <AddRewards />           
      </DashboardLayout>
   );
};

export default InstructorDashboard;