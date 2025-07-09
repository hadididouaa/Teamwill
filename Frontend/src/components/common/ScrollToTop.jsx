import { useState, useEffect } from "react";
import UseSticky from "../../hooks/UseSticky";

const ScrollToTop = () => {
   const { sticky }= UseSticky();

   const [showScroll, setShowScroll] = useState(false);

   const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) {
         setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 400) {
         setShowScroll(false);
      }
   };

   const scrollTop = () => { 
      window.scrollTo({ top:"smooth" });
   };

   useEffect(() => {
      const checkScrollTop = () => {
         if (!showScroll && window.pageYOffset > 400) {
            setShowScroll(true);
         } else if (showScroll && window.pageYOffset <= 400) {
            setShowScroll(false);
         }
      };
   
      window.addEventListener("scroll", checkScrollTop);
      return () => window.removeEventListener("scroll", checkScrollTop);
   }, [showScroll]);  // Add showScroll as a dependency
   

   return (
      <>
         <button onClick={scrollTop} className={`scroll__top scroll-to-target ${sticky ? "open": ""}`} data-target="html">
            <i className="tg-flaticon-arrowhead-up"></i>
         </button>
      </>
   )
}

export default ScrollToTop;
