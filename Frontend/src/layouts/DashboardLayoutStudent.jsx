// src/layouts/DashboardLayoutStudent.jsx
import BreadcrumbOne from "../components/common/breadcrumb/BreadcrumbOne";
import SEO from "../components/SEO";
import DashboardBanner from "../dashboard/dashboard-common/DashboardBanner";
import DashboardSidebarTwo from "../dashboard/dashboard-common/DashboardSidebarTwo";
import Footer from "./footers/Footer";
import HeaderFour from "./headers/HeaderFour";
import Wrapper from "./Wrapper";
import ChatWidget from '../components/chat/ChatWidget';

const DashboardLayoutStudent = ({ pageTitle, children }) => {
  return (
    <Wrapper>
      <SEO pageTitle={pageTitle} />
      <HeaderFour />
      <main className="main-area fix">
        <BreadcrumbOne />
        <section className="dashboard__area section-pb-120">
         <div className="container">
            <DashboardBanner />
            <div className="dashboard__inner-wrap">
               <div className="row">
                  <DashboardSidebarTwo />
                  <div className="col-lg-9">
                     {children}                    
                  </div>
               </div>
            </div>
          </div>
        </section>
        <ChatWidget />
      </main>
      <Footer />
    </Wrapper>
  );
};

export default DashboardLayoutStudent;
