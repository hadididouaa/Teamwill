// src/layouts/QuizLayout.jsx
import Wrapper from './Wrapper';
import SEO from '../components/SEO';
import HeaderFour from './headers/HeaderFour';
import Breadcrumb from '../components/common/breadcrumb/DashboardBreadcrumb';
import Footer from './footers/Footer';


const QuizLayout = ({ pageTitle, children }) => {
  return (
    <Wrapper>
      <SEO pageTitle={pageTitle} />
      <HeaderFour />
      <main className="main-area fix">
        <Breadcrumb />
        <section className="dashboard__area section-pb-120">
          
            <div className="dashboard__inner-wrap">
              <div className="row">
                
                  {children}
              </div>
            
          </div>          
         
        </section>
      </main>
      <Footer />
     
    </Wrapper>
  );
};

export default QuizLayout;