import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const testi_data = [
  {
    id: 1,
    desc: "“Manage and streamline operations across multiple locations, sales channels, and employees to improve efficiency.”",
    title: "Brooklyn Simmons",
    designation: "Engineer",
  },
  {
    id: 2,
    desc: "“Manage and streamline operations across multiple locations, sales channels, and employees to improve efficiency.”",
    title: "Leslie Alexander",
    designation: "Product Manager",
  },
  {
    id: 3,
    desc: "“Manage and streamline operations across multiple locations, sales channels, and employees to improve efficiency.”",
    title: "Courtney Henry",
    designation: "UX Designer",
  },
];

const setting = {
  slidesPerView: 1,
  spaceBetween: 30,
  loop: true,
  pagination: {
    el: '.testimonial-pagination',
    clickable: true,
  },
  breakpoints: {
    0: { slidesPerView: 1 },
    576: { slidesPerView: 1 },
    768: { slidesPerView: 2, spaceBetween: 20 },
    992: { slidesPerView: 2, spaceBetween: 30 },
    1200: { slidesPerView: 3 },
    1500: { slidesPerView: 3 },
  },
};

const CommonTestimonial = () => {
  return (
    <Swiper
      {...setting}
      modules={[Pagination]}
      className="swiper-container testimonial-active-four"
    >
      {testi_data.map((item) => (
        <SwiperSlide key={item.id} className="swiper-slide">
          <div className="testimonial__item-four">
            <div className="rating">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <p>{item.desc}</p>
            <div className="testimonial__bottom-two">
              <h4 className="title">{item.title}</h4>
              <span>{item.designation}</span>
            </div>
          </div>
        </SwiperSlide>
      ))}
      <div className="testimonial-pagination testimonial-pagination-two"></div>
    </Swiper>
  );
};

export default CommonTestimonial;
