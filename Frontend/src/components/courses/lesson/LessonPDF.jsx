import { Worker, Viewer } from "@react-pdf-viewer/core";
import '@react-pdf-viewer/core/lib/styles/index.css';
import { useEffect, useState } from "react";
import axios from 'axios';

const LessonPDF = ({ filename }) => {
   const [pdfBlobUrl, setPdfBlobUrl] = useState('');

   useEffect(() => {
   if (!filename) return;

   const url = `${import.meta.env.VITE_API_URL}/documents/view/${filename}`;

   let isMounted = true;
   let blobUrl;

   axios.get(url, {
      responseType: 'blob',
      withCredentials: true,
   })
   .then(res => {
      if (!isMounted) return;

      blobUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      setPdfBlobUrl(blobUrl);
   })
   .catch(err => {
      console.error("Error fetching PDF:", err);
   });

   return () => {
      isMounted = false;
      if (blobUrl) {
         URL.revokeObjectURL(blobUrl);
      }
   };
}, [filename]);


   return (
      <div style={{ height: '600px', width: '100%' }}>
         <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
            {pdfBlobUrl && <Viewer fileUrl={pdfBlobUrl} />}
         </Worker>
      </div>
   );
};

export default LessonPDF;
