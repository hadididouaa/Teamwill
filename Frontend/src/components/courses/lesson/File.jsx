import { useEffect, useState } from "react";
import Plyr from 'plyr';
import axios from "axios";

const File = ({ formationId }) => {
   const [videoFilename, setVideoFilename] = useState(null);
   const [documentUrl, setDocumentUrl] = useState('');
   useEffect(() => {
      const fetchDocument = async () => {
         try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/documents/${formationId}`, {
               withCredentials: true,
            });

            console.log("Document response:", response.data);

            // Ensure the document URL is constructed correctly
            const fullDocumentUrl = `${import.meta.env.VITE_API_URL}${response.data.documentUrl}`;
            if (response.data && response.data.documentUrl) {
               setDocumentUrl(fullDocumentUrl); // Set the full document URL here
               setVideoFilename(response.data.filename);            }
         } catch (error) {
            console.error("Error fetching document:", error);
         }
      };

      if (formationId) {
         fetchDocument();
      }
   }, [formationId]);
   useEffect(() => {
      if (videoFilename && documentUrl) {
         // Initialize the player only if videoFilename and documentUrl are valid
         const player = new Plyr('#player');
         return () => {
            player.destroy();
         };
      }
   }, [videoFilename, documentUrl]);

   return (
      <div>
         {documentUrl ? (
            <video id="player" playsInline controls data-poster="/assets/img/bg/video_bg.webp">
               <source src={documentUrl} type="video/mp4" />
               Your browser does not support the video tag.
            </video>
         ) : (
            <p>Loading video...</p>
         )}
      </div>
   );
};

export default File;
