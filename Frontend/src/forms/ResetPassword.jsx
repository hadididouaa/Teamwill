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
        console.log("Email récupéré du token cookie:", response.data.email);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        alert("Impossible de récupérer les informations de l'utilisateur.");
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
          alert("Erreur lors de l'envoi de l'OTP.");
        }
      } else if (method === 'qrcode') {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/otp/generate-secret`, config);
      
        if (response.status === 200) {
          console.log("QR Code URL:", response.data.qrCodeUrl); // Log the URL
          console.log("Réponse complète backend:", response.data);  
          navigate('/qrcodedisplay', {
            state: {
              method: 'qrcode',
              qrCodeUrl: response.data.qrCodeUrl,
              secret: response.data.secret  
            }
          });
        } else {
          alert("Erreur lors de la génération du QR Code.");
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="login-container">
      <img src="assets/img/logo/Image2.png" alt="Logo" width="120" />
      <p className="subtitle">Comment voulez-vous recevoir votre code ?</p>

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
          <span>Utiliser mon e-mail</span>
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
          <span>Utiliser un QR Code</span>
        </label>
      </div>

      <div className="buttons">
        <a href="#" className="forgot-password">Vous n’avez plus accès à ces éléments ?</a>
        <button className="submit-btn" onClick={handleContinue}>Continuer</button>
      </div>
    </div>
  );
};

export default ResetPassword;
