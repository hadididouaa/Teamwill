import DashboardBreadcrumb from '../../../components/common/breadcrumb/DashboardBreadcrumb'
import FooterOne from '../../../layouts/footers/FooterOne'
import HeaderFour from '../../../layouts/headers/HeaderFour'
import InstructorProfileArea from './InstructorProfileArea'

const InstructorProfile = () => {
   return (
      <>
         <HeaderFour />
         <main className="main-area fix">
            <DashboardBreadcrumb />
            <InstructorProfileArea />
         </main>
         <FooterOne />
      </>
   )
}

export default InstructorProfile
