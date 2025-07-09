import { useParams } from 'react-router-dom';
import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import LessonArea from '../components/courses/lesson/LessonArea';
import Footer from '../layouts/footers/Footer';
const Lesson = () => {
   const { id } = useParams(); // Get the formation ID from the route

   return (
      <Wrapper>
         <SEO pageTitle="Formation Details" />
         <main className="main-area fix">
            <LessonArea formationId={id} />
         </main>

         <Footer />
      </Wrapper>
   );
};

export default Lesson;