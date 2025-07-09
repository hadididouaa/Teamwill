import { useState } from "react"
import NavMenuOne from "./menu/NavMenu"
import MobileSidebar from "./menu/MobileSidebar"
import UseSticky from "../../hooks/UseSticky"
import { Link } from "react-router-dom"
import InjectableSvg from "../../hooks/InjectableSvg"
import TotalCart from "../../components/common/TotalCart"
import HeaderTopOne from "./menu/HeaderTopOne"
import TotalWishlist from "../../components/common/TotalWishlist"
import BtnArrow from "../../svg/BtnArrow"
import HeaderSearch from "./menu/HeaderSearch"

const HeaderThree = () => {

   const [isSearch, setIsSearch] = useState(false);
   const { sticky } = UseSticky();
   const [isActive, setIsActive] = useState(false);

   return (
      <>
         <header>
            <div id="header-fixed-height"></div>
            <div id="sticky-header" className={`tg-header__area tg-header__style-three ${sticky ? "sticky-menu" : ""}`}>
               <div className="container">
                  <div className="row">
                     <div className="col-12">
                        <div className="tgmenu__wrap">
                           <nav className="tgmenu__nav">
                              <div className="logo">
                                 <Link to="/"><img src="/assets/img/logo/logo.svg" alt="Logo" /></Link>
                              </div>
                              <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-xl-flex">
                                 <NavMenuOne />
                              </div>
                              <div className="tgmenu__action tgmenu__action-three">
                                 <ul className="list-wrap">
                                    <li className="header-search">
                                       <a href onClick={() => setIsSearch(true)} style={{ cursor:"pointer" }} className="search-open-btn">
                                          <i className="flaticon-search"></i>
                                       </a>
                                    </li>    
                                    <li className="header-btn login-btn">
                                       <Link to="/login" className="btn arrow-btn">Logout</Link>
                                    </li>
                                 </ul>
                                 
                              </div>                              
                              <div onClick={() => setIsActive(true)} className="mobile-nav-toggler"><i className="tg-flaticon-menu-1"></i></div>
                           </nav>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </header>
         <HeaderSearch isSearch={isSearch} setIsSearch={setIsSearch} />
      </>
   )
}

export default HeaderThree
