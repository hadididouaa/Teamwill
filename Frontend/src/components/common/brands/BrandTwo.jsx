import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const brand_data = [
  "/assets/img/brand/h7_brand01.png",
  "/assets/img/brand/h7_brand02.png",
  "/assets/img/brand/h7_brand03.png",
  "/assets/img/brand/h7_brand04.png",
  "/assets/img/brand/h7_brand05.png",
  "/assets/img/brand/h7_brand06.png",
  "/assets/img/brand/h7_brand04.png"
];

const setting = {
  slidesPerView: 5,
  spaceBetween: 30,
  observer: true,
  observeParents: true,
  loop: true,
  breakpoints: {
    1500: {
      slidesPerView: 5
    },
    1200: {
      slidesPerView: 4
    },
    992: {
      slidesPerView: 3,
      spaceBetween: 20
    },
    768: {
      slidesPerView: 2,
      spaceBetween: 20
    },
    576: {
      slidesPerView: 2
    },
    0: {
      slidesPerView: 1
    }
  }
};

const BrandTwo = () => {
  return (
    <div className="brand-area-three section-pb-120">
      <div className="container">
        <Swiper {...setting} className="swiper-container brand-swiper-active">
          {brand_data.map((item, i) => (
            <SwiperSlide key={i} className="swiper-slide">
              <div className="brand__item-two">
                <img src={item} alt="img" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default BrandTwo;
