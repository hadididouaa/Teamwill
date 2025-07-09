import { Link } from "react-router-dom";
import UseSticky from "../../hooks/UseSticky";

const HeaderOne = () => {
   const { sticky } = UseSticky();

   return (
      <header>
         <div id="header-fixed-height"></div>

         <div id="sticky-header" className={`tg-header__area ${sticky ? "sticky-menu" : ""}`}>
            <nav className="tgmenu__nav container custom-container">
               <div className="tgmenu__wrap">
                  <div className="logo">
                     <Link to="/">
                        <img src="/assets/img/logo/Logoo.png" alt="Logo" />
                     </Link>
                  </div>
               </div>
            </nav>
         </div>
      </header>
   );
};

export default HeaderOne;
