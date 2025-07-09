import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';


const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== rePassword) {
      setMessage("Le nouveau mot de passe ne correspond pas.");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/change-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );

      setMessage("Mot de passe mis à jour avec succès !");
      setCurrentPassword('');
      setNewPassword('');
      setRePassword('');

      await axios.post(`${import.meta.env.VITE_API_URL}/users/logout`, {}, { withCredentials: true });
      navigate('/signin');
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Erreur serveur."
      );
    }
  };

  return (
    <div className="login-container">
     <img src="assets/img/logo/Image2.png" alt="Logo" width="120" />
      <h2 className="title">Teamwill</h2>
      <h3 className="subtitle">CHANGEMENT DE MOT DE PASSE</h3>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          {showPassword.current ? (
            <FaEyeSlash className="icon" onClick={() => togglePasswordVisibility('current')} />
          ) : (
            <FaEye className="icon" onClick={() => togglePasswordVisibility('current')} />
          )}
          <input
            type={showPassword.current ? 'text' : 'password'}
            placeholder="Mot de passe actuel"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          {showPassword.new ? (
            <FaEyeSlash className="icon" onClick={() => togglePasswordVisibility('new')} />
          ) : (
            <FaEye className="icon" onClick={() => togglePasswordVisibility('new')} />
          )}
          <input
            type={showPassword.new ? 'text' : 'password'}
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          {showPassword.confirm ? (
            <FaEyeSlash className="icon" onClick={() => togglePasswordVisibility('confirm')} />
          ) : (
            <FaEye className="icon" onClick={() => togglePasswordVisibility('confirm')} />
          )}
          <input
            type={showPassword.confirm ? 'text' : 'password'}
            placeholder="Confirmez le nouveau mot de passe"
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
          />
        </div>

        {message && (
          <p style={{ color: message.includes("succès") ? "green" : "red", textAlign: 'center' }}>{message}</p>
        )}

        <button type="submit" className="submit-btn">Mettre à jour</button>
      </form>
    </div>
  );
};

export default ChangePassword;
