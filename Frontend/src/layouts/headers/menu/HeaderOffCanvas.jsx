import { Link } from "react-router-dom"

const HeaderOffCanvas = ({ offcanvas, setOffcamvas }) => {
   return (
      <>
         <div className={`offCanvas__info ${offcanvas ? "active" : ""}`}>
            <div className="offCanvas__close-icon menu-close">
               <button onClick={() => setOffcamvas(false)}><i className="far fa-window-close"></i></button>
            </div>
            
            
         </div>
         <div onClick={() => setOffcamvas(false)} className={`offCanvas__overly ${offcanvas ? "active" : ""}`}></div>
      </>
   )
}

export default HeaderOffCanvas
