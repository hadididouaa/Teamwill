// src/layouts/LoginLayout.jsx
import Wrapper from './Wrapper';
import SEO from '../components/SEO';
import './LoginLayout.css';


const LoginLayout = ({ pageTitle, children }) => {
  return (
    <Wrapper>
      <SEO pageTitle={pageTitle} />
        <div className="login-wrapper">
          {children} 
        </div>    
    </Wrapper>
  );
};

export default LoginLayout;
