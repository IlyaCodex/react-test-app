import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import styles from "./StocksSection.module.css";
import { api } from "../api";
import { byPosition, chooseImage } from "./admin/Utils";
import { isNull, nonNull } from "./admin/Utils";

const PromosSection = () => {
  const [promos, setPromos] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    api.getPromos().then((res) => {
      if (res.error) {
        console.error("Could not load promos", res.error);
        return;
      }
      const newPromos = (res.data ?? []).sort(byPosition);
      setPromos(newPromos);
      return Promise.all(
        newPromos.map((p) => {
          const imageId = chooseImage(p);
          if (isNull(imageId)) {
            return Promise.resolve(undefined);
          }
          return api.getPromoImage(imageId).then((res) => res.data);
        })
      ).then((newImages) => setImages(newImages.filter(nonNull)));
    });
  }, []);

  const ArrowIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
    >
      <path
        d="M16.7071 8.70711C17.0976 8.31658 17.0976 7.68342 16.7071 7.29289L10.3431 0.928932C9.95262 0.538408 9.31946 0.538408 8.92893 0.928932C8.53841 1.31946 8.53841 1.95262 8.92893 2.34315L14.5858 8L8.92893 13.6569C8.53841 14.0474 8.53841 14.6805 8.92893 15.0711C9.31946 15.4616 9.95262 15.4616 10.3431 15.0711L16.7071 8.70711ZM0 8V9H16V8V7H0V8Z"
        fill="#171717"
      />
    </svg>
  );

  const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    spaceBetween: 30,
    slidesPerView: 1,
    loop: true,
    pagination: {
      clickable: true,
      dynamicBullets: true,
    },
    navigation: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    breakpoints: {
      576: {
        slidesPerView: 1,
        autoplay: false,
      },
      768: {
        slidesPerView: 2,
        autoplay: false,
      },
      992: {
        slidesPerView: 3,
        autoplay: false,
      },
    },
  };

  return (
    <section className={styles.promos} id="promos">
      <div className={styles.container}>
        <h2 className={styles.titleSection}>Акции</h2>

        <Swiper {...swiperOptions} className={styles.promosSwiper}>
          {promos.map((promo) => (
            <SwiperSlide key={promo.id}>
              <div className={styles.promosCard}>
                <div className={styles.promosImgContainer}>
                  <img
                    className={styles.promosImg}
                    src={
                      images.find((image) => image.id === chooseImage(promo))
                        ?.data
                    }
                    alt={promo.name}
                  />
                </div>
                <h3 className={styles.promosName}>{promo.title}</h3>
                <p className={styles.promosDescription}>{promo.description}</p>
                <Link to={`/catalog`} className={styles.promosLink}>
                  Перейти к покупке <ArrowIcon />
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default PromosSection;
