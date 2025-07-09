// pages/Login.jsx

import LoginLayout from "../layouts/LoginLayout";
import ResetPasswordform from "../forms/ResetPassword";


const ChangePassword = () => {
   return (

      <LoginLayout pageTitle="type of verification">
         <ResetPasswordform />
      </LoginLayout>
   );
};

export default ChangePassword;