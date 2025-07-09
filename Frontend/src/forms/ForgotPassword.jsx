import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = demander mail, 2 = réinitialiser mot de passe
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState({
    temp: false,
    new: false,
    confirm: false,
  });

  const navigate = useNavigate();

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Étape 1: envoyer email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/forgot-password`, { email });
      setMessage(res.data.message);
      setStep(2); // ✅ Passer à l'étape suivante
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de l'envoi de l'email.");
    }
  };

  // Étape 2: changer mot de passe
  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== rePassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/update-password`, {
            email,
            currentPassword: tempPassword,
            newPassword,
            rePassword,
          });

      setMessage(res.data.message);
      setTimeout(() => navigate('/signin'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur serveur.");
    }
  };

  return (
      <div className="login-container">
       <img src="assets/img/logo/Image2.png" alt="Logo" width="120" />
        <h2 className="title">Teamwill</h2>
        <h3 className="subtitle">
          {step === 1 ? 'MOT DE PASSE OUBLIÉ' : 'RÉINITIALISER LE MOT DE PASSE'}
        </h3>

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {message && <p style={{ color: 'red', textAlign: 'center' }}>{message}</p>}
            <button type="submit" className="submit-btn">Envoyer le mot de passe temporaire</button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit}>
            <div className="input-group">
              <input type="email" value={email} readOnly />
            </div>

            <div className="input-group">
              <input
                type={showPassword.temp ? 'text' : 'password'}
                placeholder="Mot de passe temporaire"
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
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
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
                placeholder="Confirmer le mot de passe"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                required
              />
              {showPassword.confirm ? (
                <FaEyeSlash className="icon" onClick={() => togglePasswordVisibility('confirm')} />
              ) : (
                <FaEye className="icon" onClick={() => togglePasswordVisibility('confirm')} />
              )}
            </div>

            {message && (
              <p style={{
                color: message.includes('succès') ? 'green' : 'red',
                textAlign: 'center',
              }}>
                {message}
              </p>
            )}
            <button type="submit" className="submit-btn">Réinitialiser</button>
          </form>
        )}
      </div>

  );
};

export default ForgotPassword;