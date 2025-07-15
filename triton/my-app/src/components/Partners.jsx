import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const PartnersSection = () => {
  const partners = [
    {
      id: 1,
      name: "R.O.C.S.",
      country: "Россия",
      description: "Бренд, производящий инновационные средства по уходу за полостью рта с акцентом на натуральные компоненты и безопасность",
      image: "../images/rocs.png",
      alt: "Логотип компании R.O.C.S."
    },
    {
      id: 2,
      name: "SPLAT",
      country: "Россия",
      description: "Известен производством зубных паст, щёток и ополаскивателей для полости рта",
      image: "../images/splat.png",
      alt: "Логотип компании SPLAT"
    },
    {
      id: 3,
      name: "Straumann Group",
      country: "Швейцария",
      description: "Ведущий производитель систем имплантации и цифровых решений для стоматологии",
      image: "../images/straumann.png",
      alt: "Логотип компании Straumann Group"
    },
    {
      id: 4,
      name: "Dentsply Sirona",
      country: "Германия",
      description: "Мировой лидер в производстве стоматологического оборудования и материалов",
      image: "../images/dentsply.png",
      alt: "Логотип компании Dentsply Sirona"
    },
    {
      id: 5,
      name: "Septodont",
      country: "Франция",
      description: "Известен разработкой и выпуском профессиональных стоматологических материалов",
      image: "../images/septodont.png",
      alt: "Логотип компании Septodont"
    }
  ];

  const swiperRef = useRef(null);

  const swiperOptions = {
    modules: [Autoplay, Navigation],
    spaceBetween: 20,
    slidesPerView: 4,
    loop: true,
    navigation: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    breakpoints: {
      320: { slidesPerView: 1, spaceBetween: 10 },
      576: { slidesPerView: 2, spaceBetween: 15 },
      768: { slidesPerView: 3, spaceBetween: 15 },
      992: { slidesPerView: 4, spaceBetween: 20 },
    },
    centeredSlides: false,
    onInit: (swiper) => {
      swiperRef.current = swiper;
    },
  };

  useEffect(() => {
    const handleResize = () => {
      if (swiperRef.current) {
        swiperRef.current.update();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="partners indent" id="partners">
      <div className="container">
        <h2 className="title-section">Наши партнёры</h2>
        <div className="partners__container">
          <Swiper {...swiperOptions} className="partners__swiper">
            {partners.map((partner) => (
              <SwiperSlide key={partner.id}>
                <div className="partners__card">
                  <div className="partners__img-container">
                    <img
                      className="partners__img"
                      src={partner.image}
                      width="250"
                      height="150"
                      alt={partner.alt}
                    />
                  </div>
                  <h3 className="partners__name">{partner.name}</h3>
                  <p className="partners__country">Страна: {partner.country}</p>
                  <div className="partners__description-container">
                    <p className="partners__description">{partner.description}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;