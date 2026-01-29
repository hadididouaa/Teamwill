import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaQrcode } from 'react-icons/fa';
import axios from 'axios';

const ResetPassword = () => {
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // Fetch authenticated user info from cookies
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/auth`, {
          withCredentials: true,
        });
        setEmail(response.data.email);
        console.log("Email retrieved from cookie token:", response.data.email);
      } catch (error) {
        console.error("Error fetching authenticated user:", error);
        alert("Unable to retrieve user information.");
      }
    };

    fetchUser();
  }, []);

  const handleContinue = async () => {
    const config = {
      withCredentials: true,
    };

      try {
      if (method === 'email') {
        const response = await axios.post( `${import.meta.env.VITE_API_URL}/otp/generate-otp`,
          { email }, config );      

        if (response.status === 200) {
          navigate('/otpverification', { state: { method: 'email' } });
        } else {
          alert("Error sending OTP.");
        }
      } else if (method === 'qrcode') {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/otp/generate-secret`, config);
      
        if (response.status === 200) {
          console.log("QR Code URL:", response.data.qrCodeUrl); // Log the URL
          console.log("Full backend response:", response.data);  
          navigate('/qrcodedisplay', {
            state: {
              method: 'qrcode',
              qrCodeUrl: response.data.qrCodeUrl,
              secret: response.data.secret  
            }
          });
        } else {
          alert("Error generating QR Code.");
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert("Server connection error.");
    }
  };

  return (
    <div className="login-container">
      <img src="assets/img/logo/Image2.png" alt="Logo" width="120" />
  <p className="subtitle">How would you like to receive your code?</p>

      <div className="option-group">
        <label className="option">
          <input
            type="radio"
            name="method"
            value="email"
            checked={method === 'email'}
            onChange={() => setMethod('email')}
          />
          <FaEnvelope className="icon" />
          <span>Use my email</span>
        </label>

        <label className="option">
          <input
            type="radio"
            name="method"
            value="qrcode"
            checked={method === 'qrcode'}
            onChange={() => setMethod('qrcode')}
          />
          <FaQrcode className="icon" />
          <span>Use a QR Code</span>
        </label>
      </div>

      <div className="buttons">
        
  <button className="submit-btn" onClick={handleContinue}>Continue</button>
      </div>
    </div>
  );
};

export default ResetPassword;
