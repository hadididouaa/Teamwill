import React, { useEffect } from 'react';
import './rain.css';

const RainEffect = () => {
  useEffect(() => {
    const drops = [];
    for (let i = 0; i < 100; i++) {
      const drop = document.createElement('div');
      drop.className = 'drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${0.5 + Math.random()}s`;
      drop.style.opacity = `${0.2 + Math.random() * 0.3}`;
      drops.push(drop);
    }

    const container = document.getElementById('rain-container');
    drops.forEach(drop => container.appendChild(drop));

    return () => {
      drops.forEach(drop => drop.remove());
    };
  }, []);

  return <div id="rain-container" style={{ position: 'absolute', inset: 0, zIndex: 10 }} />;
};

export default RainEffect;
