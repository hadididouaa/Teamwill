// frontend/src/navigation/Navigation.jsx
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import { ChatProvider } from '../contexts/ChatContext';
import MessagingPage from '../pages/MessagingPage';

import ResetPassword from '../pages/ResetPassword';
import QrCodeDisplay from '../pages/QrCodeVerification';
import OTPVerification from '../pages/OtpVerification';
import TotpVerif from '../pages/TotpVerif';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import InstructorDashboard from '../pages/InstructorDashboard';
// import StudentDashboard from '../pages/StudentDashboard';
import InstructorProfile from '../pages/InstructorProfile';
import ChangePassword from '../pages/ChangePassword';
import WelcomePage from '../pages/WelcomePage';
import Course from '../pages/Course';
import MyCourse from '../pages/MyCourse';
import QuestionnaireList from '../pages/QuestionnaireList';
import CreateQuestionnaire from '../pages/CreateQuestionnaire';
import QuestionnaireDetail from '../pages/QuestionnaireDetail';
import EditQuestionnaire from '../pages/EditQuestionnaire';
import QuestionnaireListPage from '../pages/CQuestionnaireListPage';
import QuestionnaireResponsePage from '../pages/CQuestionnaireResponsePage';
import QuestionnaireResults from '../pages/QuestionnaireResults';
 // Dans votre fichier de routes (ex: AppRoutes.js)
import UserResultsPage from '../pages/UserResultsPage';
import AddFormation from '../pages/AddFormation';
import Convert from '../pages/Convert';
import UserSetting from '../pages/UserSetting';
import Lesson from '../pages/Lesson';
import DisplayQuiz from '../components/courses/lesson/displayQuiz';
import SignIn from "../pages/Login";
import Profile from '../pages/Profile.jsx';
import NotFound from '../pages/NotFound';
import Congradulation from '../pages/congradulation';
import Failed from '../pages/Failed';
import PrivateRoute from '../components/PrivateRoute'; 

import Rewards from '../pages/Rewards';
const AppNavigation = () => {
  return (
  
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/signin" replace />} />
        {/* PUBLIC ROUTES */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/otpverification" element={<OTPVerification />} />
        <Route path="/qrcodedisplay" element={<QrCodeDisplay />} />
        <Route path="/verify-qrcode" element={<TotpVerif />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/welcome" element={<WelcomePage />} />
        {/* PRIVATE ROUTES */}
        <Route element={<PrivateRoute />}>
                 <Route 
    path="/dashboard" 
    element={
   
        <InstructorDashboard />
   
    } 
  />
  {/* Other dashboard routes */}


          <Route path="/listUsers" element={<InstructorProfile />} />
          <Route path="/editUser/:id" element={<UserSetting />} />
          <Route path="/Myformations" element={<MyCourse />} />
           <Route path="/QuestionnaireList" element={<QuestionnaireList />} />
            <Route path="/questionnaires/create" element={<CreateQuestionnaire />} />
            
  <Route path="/questionnaires/:id" element={ <QuestionnaireDetail/>} />
 <Route path="/Cquestionnaires" element={<QuestionnaireListPage />} />
        <Route path="/questionnaires/:id/respond" element={<QuestionnaireResponsePage />} />
          <Route path="/questionnaires/:id/edit" element={<EditQuestionnaire />} />
 <Route path="/all-resultss" element={<QuestionnaireResults />} />
 
          {/* Route de messagerie avec son propre Provider */}
          <Route 
            path="/messages" 
            element={
             
                <MessagingPage />
              
            } 
          />


// Ajoutez cette route
<Route path="/results" element={<UserResultsPage />} />
          <Route path="/formations" element={<Course />} />
          <Route path="/stepper" element={<AddFormation />} />
          <Route path="/stepper/:id" element={<AddFormation />} />   
          <Route path="/profile" element={<Profile />} />
          <Route path="/formation/:id" element={<Lesson />} />
          <Route path="/passerQuiz/:id" element={<DisplayQuiz />} />
          <Route path="/convert" element={<Convert />} />
          <Route path="/congratulation" element={<Congradulation />} />
          <Route path="/failed" element={<Failed />} />
         <Route path="/rewards" element={<Rewards />} />
           
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>

  );
};

export default AppNavigation;
