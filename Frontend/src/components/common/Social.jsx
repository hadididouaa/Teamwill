import { Link } from "react-router-dom"
import InjectableSvg from "../../hooks/InjectableSvg"

const Social = () => {
   return (
      <>
         <li>
            <Link to="https://www.teamwillgroup.com/en/" target="_blank">
               <InjectableSvg src="/assets/img/icons/globe.svg" alt="img" className="injectable" />
            </Link>
         </li>
         <li>
            <Link to="https://www.instagram.com/teamwillgroup/" target="_blank">
               <InjectableSvg src="/assets/img/icons/instagram.svg" alt="img" className="injectable" />
            </Link>
         </li>
         <li>
            <Link to="https://www.youtube.com/channel/UCaLs6ZwJce-qcoKKztUklFQ" target="_blank">
               <InjectableSvg src="/assets/img/icons/youtube.svg" alt="img" className="injectable" />
            </Link>
         </li>
         <li>
            <Link to="https://www.linkedin.com/company/teamwill/posts/?feedView=all" target="_blank">
               <InjectableSvg src="/assets/img/icons/linkedin.svg" alt="img" className="injectable" />
            </Link>
         </li>
      </>
   )
}

export default Social