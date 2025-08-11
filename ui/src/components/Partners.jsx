import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import styles from "./PartnersSection.module.css";
import { api } from "../api";
import { byPosition, chooseImage, isNull, nonNull } from "./admin/Utils";

const PartnersSection = () => {
  const [partners, setPartners] = useState([]);
  const [images, setImages] = useState([]);

  const swiperRef = useRef(null);
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    api.getPartners().then((res) => {
      if (res.error) {
        console.error("Could not load partners", res.error);
        return;
      }
      const newPartners = (res.data ?? []).sort(byPosition);
      setPartners(newPartners);
      return Promise.all(
        newPartners.map((p) => {
          const imageId = chooseImage(p);
          if (isNull(imageId)) {
            return Promise.resolve(undefined);
          }
          return api.getPartnerImage(imageId).then((res) => res.data);
        })
      ).then((newImages) => setImages(newImages.filter(nonNull)));
    });
  }, []);

  const swiperOptions = {
    modules: [Autoplay, Navigation],
    spaceBetween: 20,
    slidesPerView: 4,
    loop: true,
    navigation: true,
    autoplay: {
      delay: 30000,
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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openModal = (partner) => {
    setSelectedPartner(partner);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedPartner(null);
    document.body.style.overflow = "auto";
  };

  return (
    <section className={styles.partners} id="partners">
      <div className={styles.container}>
        <h2 className={styles.titleSection}>Наши партнёры</h2>
        <div className={styles.partnersContainer}>
          <Swiper {...swiperOptions} className={styles.partnersSwiper}>
            {partners.map((partner) => (
              <SwiperSlide key={partner.id}>
                <div
                  className={styles.partnersCard}
                  onClick={() => openModal(partner)}
                >
                  <div className={styles.partnersImgContainer}>
                    <img
                      className={styles.partnersImg}
                      src={
                        images.find(
                          (image) => image.id === chooseImage(partner)
                        )?.data
                      }
                      width="250"
                      height="150"
                      alt={partner.alt}
                    />
                  </div>
                  <h3 className={styles.partnersName}>{partner.name}</h3>
                  <p className={styles.partnersCountry}>
                    Страна: {partner.country}
                  </p>
                  {/* Удалено отображение описания в карточке */}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {selectedPartner && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.modalClose} onClick={closeModal}>
              ×
            </button>
            <div className={styles.modalImgContainer}>
              <img
                src={
                  images.find(
                    (image) => image.id === chooseImage(selectedPartner)
                  )?.data
                }
                alt={selectedPartner.alt}
                className={styles.modalImg}
              />
            </div>
            <h3 className={styles.modalName}>{selectedPartner.name}</h3>
            <p className={styles.modalCountry}>
              Страна: {selectedPartner.country}
            </p>
            <div className={styles.modalDescription}>
              <p>{selectedPartner.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PartnersSection;
