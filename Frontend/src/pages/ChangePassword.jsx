// pages/Login.jsx

import LoginLayout from "../layouts/LoginLayout";
import ChangePasswordArea from "../dashboard/instructor-dashboard/instructor-setting/ChangePassword";


const ChangePassword = () => {
   return (

      <LoginLayout pageTitle="chang password page">
         <ChangePasswordArea />
      </LoginLayout>
   );
};

export default ChangePassword;