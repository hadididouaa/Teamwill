// pages/Login.jsx
import SignIn from '../forms/SignIn';
import LoginLayout from '../layouts/LoginLayout';

const Login = () => {
   return (
         <LoginLayout pageTitle="login page">
            <SignIn />
         </LoginLayout>
   );
};

export default Login;