// src/pages/Congradulation.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import Lottie from 'lottie-react';
import axios from 'axios';
import styles from '../components/WelcomePopup/WelcomePopup.module.css'; // reuse styles

const Congratulation = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [width, height] = useWindowSize();
  const [animationData, setAnimationData] = useState(null);
  const [username, setUsername] = useState('');
  const [formationTitle, setFormationTitle] = useState('');
  const [score, setScore] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch('/assets/img/lotti/certif.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Erreur chargement Lottie:', err));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/getOnce`, {
          withCredentials: true,
        });
        setUsername(userRes.data.username);

        // If formation title was passed from DisplayQuiz.jsx
        if (location.state?.formationTitle) {
          setFormationTitle(location.state.formationTitle);
        }
         // You can do similarly for score:
        if (location.state?.score !== undefined) {
          setScore(location.state.score);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des infos:', error);
      }
    };
    fetchData();
  }, [location]);

  const handleContinue = () => {
    setShowConfetti(false);
    navigate('/dashboard');
  };

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} />}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.overlay}
      >
        <div className={styles.container}>
          <button className={styles.close} onClick={handleContinue}>×</button>

          <div className={styles.curve}>
            <span>🎉 C O N G R A T U L A T I O N S 🎉</span>
          </div>

          <div className={styles.lottieWrapper}>
            {animationData && (
              <Lottie
                animationData={animationData}
                loop
                className={styles.lottieSmall}
              />
            )}
          </div>

          <div className={styles.user}>
            Bravo <span className={styles.username}><strong>{username} 🎓</strong></span>
          </div>

          <div className={styles.subtext}>
            You passed your quiz successfully! with score of <strong>{score}%</strong>
          </div>

          {formationTitle && (
            <div className={styles.subtext}>
              You've been awarded a certificate in the formation: <strong>{formationTitle}</strong>
            </div>
          )}

          <button className={styles.button} onClick={handleContinue}>
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Congratulation;
