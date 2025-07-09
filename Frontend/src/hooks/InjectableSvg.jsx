// src/hooks/InjectableSvg.jsx
import React, { useEffect, useRef } from 'react';
import Vivus from 'vivus';

const InjectableSvg = ({ src, alt = '', className = '' }) => {
   const imgRef = useRef(null);

   useEffect(() => {
      const fetchAndInjectSvg = async () => {
         if (imgRef.current) {
            try {
               const response = await fetch(src);
               const svgText = await response.text();
               const div = document.createElement('div');
               div.innerHTML = svgText;
               const svgElement = div.querySelector('svg');

               if (svgElement) {
                  svgElement.setAttribute('class', imgRef.current.getAttribute('class') || '');
                  imgRef.current.replaceWith(svgElement);

                  const vivusInstance = new Vivus(svgElement, {
                     duration: 200, // or adjust as needed
                     type: 'sync'   // or 'delayed', 'oneByOne', etc.
                  });

                  vivusInstance.finish();

                  svgElement.addEventListener('mouseenter', () => {
                     vivusInstance.reset().play();
                  });
               }
            } catch (error) {
               console.error('Error fetching and injecting SVG:', error);
            }
         }
      };

      fetchAndInjectSvg();
   }, [src]);

   return <img ref={imgRef} src={src} alt={alt} className={`injectable ${className}`} />;
};

export default InjectableSvg;
