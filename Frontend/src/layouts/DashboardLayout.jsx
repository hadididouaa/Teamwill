// src/layouts/DashboardLayout.jsx
import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderFour from '../layouts/headers/HeaderFour';
import Breadcrumb from '../components/common/breadcrumb/DashboardBreadcrumb';
import Footer from '../layouts/footers/Footer';
import DashboardBanner from "../dashboard/dashboard-common/DashboardBanner";
import DashboardSidebar from "../dashboard/dashboard-common/DashboardSidebar";
import ChatWidget from '../components/chat/ChatWidget';
import GlobalChatWidget from '../components/chat/GlobalChatWidget';


const DashboardLayout = ({ pageTitle, children }) => {
  return ( 
    <Wrapper>
      
      <SEO pageTitle={pageTitle} />
      <HeaderFour />
          <GlobalChatWidget /> 
      <main className="main-area fix">
        <Breadcrumb />
        <section className="dashboard__area section-pb-120">
          <div className="container">
            <DashboardBanner />
           <div className="dashboard__inner-wrap">
  <div className="row">
    <DashboardSidebar />
    <div className="col-lg-9">
      <div className="dashboard__main-content">
        {children}
      </div>
    </div>
  </div>
</div>
          </div>        
          <ChatWidget/>
          
        </section>
      </main>
      <Footer />  
    
    </Wrapper>
  );
};

export default DashboardLayout;