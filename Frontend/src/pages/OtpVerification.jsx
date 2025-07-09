// pages/Login.jsx

import LoginLayout from "../layouts/LoginLayout";
import OtpVerificationArea from "../forms/OtpVerification";


const OtpVerification = () => {
   return (

      <LoginLayout pageTitle="chang password page">
         <OtpVerificationArea />
      </LoginLayout>
   );
};

export default OtpVerification;