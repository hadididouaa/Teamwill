// pages/Login.jsx
import LoginLayout from "../layouts/LoginLayout";
import QrCodeVerification from "../forms/QrCodeVerification";


const TotpVerif = () => {
   return (

      <LoginLayout pageTitle="chang password page">
         <QrCodeVerification />
      </LoginLayout>
   );
};

export default TotpVerif;