import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import axios from 'axios';
import RainEffect from '../components/WelcomePopup/RainEffect'; // your custom rain
import styles from '../components/WelcomePopup/failed.module.css'; // styles

const Failed = () => {
  const [animationData, setAnimationData] = useState(null);
  const [username, setUsername] = useState('');
  const [formationTitle, setFormationTitle] = useState('');
  const [score, setScore] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch('/assets/img/lotti/sad_face.json') 
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

        if (location.state?.formationTitle) {
          setFormationTitle(location.state.formationTitle);
        }
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
    navigate('/dashboard');
  };

  return (
    <>
      {/* ✅ Custom Rain Effect Replaces RainAnimation */}
      <RainEffect />

      <motion.div 
        className={styles.overlay}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}      
      >
        <div className={styles.container} style={{ position: 'relative', zIndex: 20 }}>
          <button className={styles.close} onClick={handleContinue}>×</button>

          <div className={styles.curve}>
            <span>😞O H NON ! TU N'AS PAS RÉUSSI😞</span>
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
            Don't give up, <span className={styles.username}><strong>{username}!</strong></span>
          </div>

          <div className={styles.subtext}>
            Vous avez obtenu un score de <strong>{score}%</strong> à ce quiz.
          </div>

          {formationTitle && (
            <div className={styles.subtext}>
              Continuez à vous entraîner pour maîtriser la formation : <strong>{formationTitle}</strong>
            </div>
          )}

          <div className={styles.subtext} style={{ marginTop: '1rem', fontStyle: 'italic' }}>
            N'oubliez pas : l'échec n'est qu'une étape vers la réussite. Réessayez !
          </div>

          <button className={styles.button} onClick={handleContinue}>
            Retour au tableau de bord
          </button>
        </div>
      </motion.div>
    </>
  );
};
export default Failed;

