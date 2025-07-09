import Footer from "../../../layouts/footers/Footer"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import ErrorArea from "./ErrorArea"

const NotFound = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <ErrorArea />
         </main>
         <Footer style={false} style_2={false} />
      </>
   )
}

export default NotFound

