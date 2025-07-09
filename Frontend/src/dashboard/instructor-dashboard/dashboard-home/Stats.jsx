
import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import axios from 'axios';

const Stats = () => {
  const [nombreStreak, setNombreStreak] = useState(null);
  const [nombreCertificats, setNombreCertificats] = useState(null);
  const [enrolledCount, setEnrolledCount] = useState(null);
  const [flameIcon, setFlameIcon] = useState(null);
  const [certifIcon, setCertifIcon] = useState(null);
  const [enrolledIcon, setEnrolledIcon] = useState(null);

  // Load Lottie animations
  useEffect(() => {

    const loadIcons = async () => {
      try {
        const [flameRes, certifRes, enrolledRes] = await Promise.all([
          fetch('/assets/img/lotti/flame.json'),
          fetch('/assets/img/lotti/certificat.json'),
          fetch('/assets/img/lotti/enrolled.json'),
        ]);
        const [flameData, certifData, enrolledData] = await Promise.all([
          flameRes.json(),
          certifRes.json(),
          enrolledRes.json(),
        ]);
        setFlameIcon(flameData);
        setCertifIcon(certifData);
        setEnrolledIcon(enrolledData);
      } catch (err) {
        console.error('Failed to load icons:', err);
      }
    };

    loadIcons();
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [streakRes, certifRes, enrolledRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/streak/get`, {
            withCredentials: true,
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/certificat/count`, {
            withCredentials: true,
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/formations/count`, {
            withCredentials: true,
          }),
        ]);

        setNombreStreak(streakRes.data.nombreStreak);
        setNombreCertificats(certifRes.data.nombreCertificats);
        setEnrolledCount(enrolledRes.data.enrolledCount);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
           <>
      {/* Streak Card */}
      <div className="col-lg-4 col-md-4 col-sm-6">
        <div className="dashboard__counter-item text-center">
          {flameIcon && (
            <Lottie
              animationData={flameIcon}
              loop
              autoplay
              style={{ width: 220, height: 130, margin: '0 auto' }}
            />
          )}
          <div className="content">
            <span className="count">{nombreStreak ?? '...'}</span>
            <p style={{ marginTop: '4px' }}>Nombre de Streaks</p>
          </div>
        </div>
      </div>

      {/* Certification Card */}
      <div className="col-lg-4 col-md-4 col-sm-6">
        <div className="dashboard__counter-item text-center">
          {certifIcon && (
            <Lottie
              animationData={certifIcon}
              loop
              autoplay
              style={{ width: 220, height: 130, margin: '0 auto' }}
            />
          )}
          <div className="content">
            <span className="count">{nombreCertificats ?? '...'}</span>
            <p style={{ marginTop: '4px' }}>Certificats Obtenus</p>
          </div>
        </div>
      </div>

      {/* Enrolled Formation Card */}
      <div className="col-lg-4 col-md-4 col-sm-6">
        <div className="dashboard__counter-item text-center">
          {enrolledIcon && (
            <Lottie
              animationData={enrolledIcon}
              loop
              autoplay
              style={{ width: 220, height: 130, margin: '0 auto' }}
            />
          )}
          <div className="content">
            <span className="count">{enrolledCount ?? '...'}</span>
            <p style={{ marginTop: '4px' }}>Formations Inscrites</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Stats;
