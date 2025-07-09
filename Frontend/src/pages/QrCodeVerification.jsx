// pages/Login.jsx
import LoginLayout from "../layouts/LoginLayout";
import QrCodeDisplay from "../forms/QrCodeDisplay";


const QrCodeVerification = () => {
   return (

      <LoginLayout pageTitle="chang password page">
         <QrCodeDisplay />
      </LoginLayout>
   );
};

export default QrCodeVerification;