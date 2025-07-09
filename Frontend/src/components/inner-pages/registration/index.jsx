import Footer from "../../../layouts/footers/Footer"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import RegistrationArea from "./RegistrationArea"

const Registration = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title="Student SingUp" sub_title="SingUp" />
            <RegistrationArea />
         </main>
         <Footer style={false} style_2={false} />
      </>
   )
}

export default Registration

