import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import testimonial_data from '../../data/home-data/TestimonialData';

const CommonTestimonialtwo = ({ class_name }) => {

   const setting = {
      // Optional parameters
      slidesPerView: 1,  // Example value, replace with your actual value
      spaceBetween: 10,  // Example value, replace with your actual value
      observer: true,    // Example value, replace with your actual value
      observeParents: true,  // Example value, replace with your actual value
      loop: true,        // Example value, replace with your actual value
      breakpoints: {
         '1500': {
            slidesPerView: 3,  // Example value, replace with your actual value
         },
         '1200': {
            slidesPerView: 3,  // Example value, replace with your actual value
         },
         '992': {
            slidesPerView: 2,  // Example value, replace with your actual value
            spaceBetween: 10,  // Example value, replace with your actual value
         },
         '768': {
            slidesPerView: 2,  // Example value, replace with your actual value
            spaceBetween: 10,  // Example value, replace with your actual value
         },
         '576': {
            slidesPerView: 1,  // Example value, replace with your actual value
         },
         '0': {
            slidesPerView: 1,  // Example value, replace with your actual value
         },
      },
      // Navigation arrows
      navigation: {
         nextEl: ".testimonial-button-next",
         prevEl: ".testimonial-button-prev",
      },
   };

   return (
      <Swiper {...setting} modules={[Navigation]} className="swiper-container testimonial-swiper-active-two">
         {testimonial_data.filter((items) => items.page === "home_3").map((item) => (
            <SwiperSlide key={item.id} className="swiper-slide">
               <div className={`testimonial__item-two ${class_name}`}>
                  <div className="testimonial__content-two">
                     <h2 className="title">Great Quality!</h2>
                     <div className="rating">
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                     </div>
                     <p>{item.desc}</p>
                  </div>
                  <div className="testimonial__author testimonial__author-two">
                     <div className="testimonial__author-thumb testimonial__author-thumb-two">
                        <img src={item.avatar} alt="img" />
                     </div>
                     <div className="testimonial__author-content testimonial__author-content-two">
                        <h2 className="title">{item.title}</h2>
                        <span>{item.designation}</span>
                     </div>
                  </div>
               </div>
            </SwiperSlide>
         ))}
      </Swiper>
   );
}

export default CommonTestimonialtwo;
