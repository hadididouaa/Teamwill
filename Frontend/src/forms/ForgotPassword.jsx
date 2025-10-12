import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = email step, 2 = reset step
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false); // Add loading state
  const [showPassword, setShowPassword] = useState({
    temp: false,
    new: false,
    confirm: false,
  });

  const navigate = useNavigate();

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Step 1: Send email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/forgot-password`, { email });
      setMessage({ text: res.data.message, type: 'success' });
      setStep(2);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                     "Failed to send reset email. Please try again later.";
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (newPassword !== rePassword) {
      setMessage({ text: "Passwords don't match", type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/update-password`, {
        email,
        currentPassword: tempPassword,
        newPassword,
        rePassword,
      });

      setMessage({ text: res.data.message, type: 'success' });
      setTimeout(() => navigate('/signin'), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                     "Failed to reset password. Please try again.";
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img src="/assets/img/logo/Image2.png" alt="Logo" className="logo" />
      <h2 className="title">Teamwill</h2>
      <h3 className="subtitle">
        {step === 1 ? 'FORGOT PASSWORD' : 'RESET PASSWORD'}
      </h3>

      {message.text && (
        <p style={{ 
          color: message.type === 'success' ? 'green' : 'red', 
          textAlign: 'center' 
        }}>
          {message.text}
        </p>
      )}

      {step === 1 ? (
        <form onSubmit={handleEmailSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit}>
          <div className="input-group">
            <input type="email" value={email} readOnly />
          </div>

          <div className="input-group">
            <input
              type={showPassword.temp ? 'text' : 'password'}
              placeholder="Temporary password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              required
            />
            {showPassword.temp ? (
              <FaEyeSlash className="icon" onClick={() => togglePasswordVisibility('temp')} />
            ) : (
              <FaEye className="icon" onClick={() => togglePasswordVisibility('temp')} />
            )}
          </div>

          <div className="input-group">
            <input
              type={showPassword.new ? 'text' : 'password'}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="8"
            />
            {showPassword.new ? (
              <FaEyeSlash className="icon" onClick={() => togglePasswordVisibility('new')} />
            ) : (
              <FaEye className="icon" onClick={() => togglePasswordVisibility('new')} />
            )}
          </div>

          <div className="input-group">
            <input
              type={showPassword.confirm ? 'text' : 'password'}
              placeholder="Confirm password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              required
              minLength="8"
            />
            {showPassword.confirm ? (
              <FaEyeSlash className="icon" onClick={() => togglePasswordVisibility('confirm')} />
            ) : (
              <FaEye className="icon" onClick={() => togglePasswordVisibility('confirm')} />
            )}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;