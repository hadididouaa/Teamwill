// EmailOTPVerification.jsx
import React, { useState, useEffect } from 'react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/auth`, {
          withCredentials: true,
        });
        setEmail(response.data.email);
      } catch (error) {
        console.error("Error fetching email:", error);
        alert("Unable to retrieve email.");
      }
    };

    fetchEmail();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert('Please enter the OTP code');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/otp/verify-otp`, {
        email,
        otp
      }, {
        withCredentials: true
      });

      if (response.status === 200) {
        navigate('/welcome');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error verifying code';
      alert(message);
    }
  };

  return (
    <div className="login-container">
      <img src="assets/img/logo/Image2.png" alt="Logo" width="120" />
      <h2 className="title">Teamwill</h2>
      <h3 className="subtitle">Email Verification</h3>

      <p className="text-white text-sm mb-4">
        A code has been sent to <strong>{email}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <FaLock className="icon" />
          <input
            type={showOtp ? 'text' : 'password'}
            placeholder="Enter the OTP code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <span
            onClick={() => setShowOtp(!showOtp)}
            className="icon toggle-icon"
            style={{ cursor: 'pointer' }}
          >
            {showOtp ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit" className="submit-btn">Verify</button>
      </form>

      <a href="/signin" className="forgot-password">Back to sign in</a>
    </div>
  );
};

export default OTPVerification;