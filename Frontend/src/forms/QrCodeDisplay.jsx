import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const QrCodeDisplay = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(10);
  const [expiredMessage, setExpiredMessage] = useState('');
  const [email, setEmail] = useState('');
  const [showQr, setShowQr] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const [qrCodeUrl, setQrCodeUrl] = useState(location.state?.qrCodeUrl || '');
  const [secret, setSecret] = useState(location.state?.secret || '');

  // Countdown timer for QR expiration
  useEffect(() => {
    if (showQr) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowQr(false);
            setExpiredMessage("🔒 Le QR Code a expiré. Redirection en cours...");
            setTimeout(() => navigate('/signin'), 5000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showQr, navigate]);

  // Check QR code presence on load
  useEffect(() => {
    if (!qrCodeUrl || !secret) {
      setShowQr(false);
      setExpiredMessage("QR Code invalide ou expiré.");
      setTimeout(() => navigate('/signin'), 5000);
    }
  }, [qrCodeUrl, secret, navigate]);

  // Fetch authenticated user's email
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/auth`, {
          withCredentials: true,
        });
        setEmail(response.data.email);
      } catch (err) {
        console.error("Erreur lors de la récupération de l'e-mail:", err);
        setError("Impossible de récupérer l'e-mail.");
      }
    };

    fetchEmail();
  }, []);

  const handleContinue = () => {
    navigate('/verify-qrcode', {
      state: {
        email: email
      }
    });
  };

  return (
    <div className="login-container">
      <img src="assets/img/logo/Image2.png" alt="Logo" width="120" />
      <h2 className="title">Teamwill</h2>
      <h3 className="subtitle">SCANNER LE QR CODE</h3>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p className="instruction" style={{ color: 'white', marginBottom: '20px' }}>
        Veuillez scanner le QR Code avec votre application d’authentification.
      </p>

      {showQr && qrCodeUrl ? (
        <>
          <img src={qrCodeUrl} alt="QR Code" className="qr-img" />
          <p style={{ color: 'white', marginTop: '10px' }}>
            ⏳ Le QR Code expirera dans <strong>{countdown}</strong> secondes.
          </p>
        </>
      ) : (
        <p style={{ color: 'white' }}>{expiredMessage || '⛔ QR Code expiré.'}</p>
      )}

      <div className="buttons">
        {showQr && (
          <button className="submit-btn" onClick={handleContinue}>
            Continuer
          </button>
        )}
        <a href="/signin" className="forgot-password">Retour à la connexion</a>
      </div>
    </div>
  );
};

export default QrCodeDisplay;
