import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import styles from './PartnersSection.module.css';

const PartnersSection = () => {
  const partners = [
    {
      id: 1,
      name: "R.O.C.S.",
      country: "Россия",
      description: "Бренд, производящий инновационные средства по уходу за полостью рта с акцентом на натуральные компоненты и безопасность",
      modalDescription: "Инновационные средства по уходу за полостью рта с акцентом на натуральные компоненты. Инновационные средства по уходу за полостью рта с акцентом на натуральные компоненты",
      image: "../images/rocs.png",
      alt: "Логотип компании R.O.C.S."
    },
    {
      id: 2,
      name: "SPLAT",
      country: "Россия",
      description: "Известен производством зубных паст, щёток и ополаскивателей для полости рта",
      modalDescription: "",
      image: "../images/splat.png",
      alt: "Логотип компании SPLAT"
    },
    {
      id: 3,
      name: "Straumann Group",
      country: "Швейцария",
      description: "Ведущий производитель систем имплантации и цифровых решений для стоматологии",
      modalDescription: "",
      image: "../images/straumann.png",
      alt: "Логотип компании Straumann Group"
    },
    {
      id: 4,
      name: "Dentsply Sirona",
      country: "Германия",
      description: "Мировой лидер в производстве стоматологического оборудования и материалов",
      modalDescription: "",
      image: "../images/dentsply.png",
      alt: "Логотип компании Dentsply Sirona"
    },
    {
      id: 5,
      name: "Septodont",
      country: "Франция",
      description: "Известен разработкой и выпуском профессиональных стоматологических материалов",
      modalDescription: "",
      image: "../images/septodont.png",
      alt: "Логотип компании Septodont"
    }
  ];

  const swiperRef = useRef(null);
  const [selectedPartner, setSelectedPartner] = useState(null);

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

  const openModal = (partner) => {
    setSelectedPartner(partner);
    document.body.style.overflow = 'hidden'; 
  };

  const closeModal = () => {
    setSelectedPartner(null);
    document.body.style.overflow = 'auto';
  };

  
  const splitDescription = (desc) => {
    const halfLength = Math.ceil(desc.length / 2);
    return [
      desc.slice(0, halfLength),
      desc.slice(halfLength),
    ];
  };

  return (
    <section className={styles.partners} id="partners">
      <div className={styles.container}>
        <h2 className={styles.titleSection}>Наши партнёры</h2>
        <div className={styles.partnersContainer}>
          <Swiper {...swiperOptions} className={styles.partnersSwiper}>
            {partners.map((partner) => (
              <SwiperSlide key={partner.id}>
                <div className={styles.partnersCard} onClick={() => openModal(partner)}>
                  <div className={styles.partnersImgContainer}>
                    <img
                      className={styles.partnersImg}
                      src={partner.image}
                      width="250"
                      height="150"
                      alt={partner.alt}
                    />
                  </div>
                  <h3 className={styles.partnersName}>{partner.name}</h3>
                  <p className={styles.partnersCountry}>Страна: {partner.country}</p>
                  <div className={styles.partnersDescriptionContainer}>
                    <p className={styles.partnersDescription}>{partner.description}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {selectedPartner && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>
              ×
            </button>
            <div className={styles.modalImgContainer}>
              <img
                src={selectedPartner.image}
                alt={selectedPartner.alt}
                className={styles.modalImg}
              />
            </div>
            <h3 className={styles.modalName}>{selectedPartner.name}</h3>
            <p className={styles.modalCountry}>Страна: {selectedPartner.country}</p>
            <div className={styles.modalDescription}>
              <p>{splitDescription(selectedPartner.modalDescription)[0]}</p>
              <p>{splitDescription(selectedPartner.modalDescription)[1]}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PartnersSection;