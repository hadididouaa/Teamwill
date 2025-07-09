// pages/ResetPassword.jsx

import { useParams } from 'react-router-dom';
import LoginLayout from "../layouts/LoginLayout";
import ForgotPasswordArea from '../forms/ForgotPassword';

const ForgotPassword = () => {
  const { token } = useParams();

  return (
    <LoginLayout pageTitle="Réinitialiser le mot de passe">
      <ForgotPasswordArea  />
    </LoginLayout>
  );
};

export default ForgotPassword;