import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import styles from "./StocksSection.module.css";
import { api } from "../api";
import { byPosition, chooseImage, isNull, nonNull } from "./admin/Utils";

const StoriesModal = ({ isOpen, onClose, imageIds, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    if (isOpen && imageIds.length > 0) {
      setProgress(0);
      const interval = 100; 
      const totalDuration = 4000; 
      const increment = 100 / (totalDuration / interval);

      intervalRef.current = setInterval(() => {
        if (!isPausedRef.current) {
          setProgress((prev) => {
            if (prev >= 100) {
              if (currentIndex < imageIds.length - 1) {
                setCurrentIndex((prevIndex) => prevIndex + 1);
                return 0;
              } else {
                clearInterval(intervalRef.current);
                onClose();
                return 100;
              }
            }
            return Math.min(prev + increment, 100);
          });
        }
      }, interval);

      return () => clearInterval(intervalRef.current);
    }
  }, [isOpen, currentIndex, imageIds.length, onClose]);

  const handleMouseDown = () => {
    isPausedRef.current = true;
  };

  const handleMouseUp = () => {
    isPausedRef.current = false;
  };

  const handleTouchStart = () => {
    isPausedRef.current = true;
  };

  const handleTouchEnd = () => {
    isPausedRef.current = false;
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.storiesModalOverlay}
      onClick={onClose}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.storiesModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.storiesProgress}>
          {imageIds.map((_, index) => (
            <div
              key={index}
              className={styles.storiesProgressBar}
              style={{
                width: `${100 / imageIds.length}%`,
                background:
                  index === currentIndex
                    ? `linear-gradient(to right,rgba(78, 78, 78, 0.78) ${progress}%, transparent ${progress}%)`
                    : "transparent",
              }}
            />
          ))}
        </div>
        <img
          src={images.find((image) => image.id === imageIds[currentIndex]).data}
          alt={`Story ${currentIndex + 1}`}
          className={styles.storiesImg}
        />
      </div>
    </div>
  );
};

const StocksSection = () => {
  const [selectedStock, setSelectedStock] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    api.getPromos().then((res) => {
      if (res.error) {
        console.error("Could not load promos", res.error);
        return;
      }
      const newPromos = (res.data ?? []).sort(byPosition);
      setStocks(newPromos);
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

  const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    spaceBetween: 15,
    slidesPerView: 4, 
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
      0: {
        slidesPerView: 2,
        spaceBetween: 10, 
      },
      576: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      992: { slidesPerView: 4 },
    },
  };
  return (
    <section className={styles.stocks} id="stocks">
      <div className={styles.container}>
        <h2 className={styles.titleSection}>Акции</h2>

        <Swiper {...swiperOptions} className={styles.stocksSwiper}>
          {stocks.map((stock) => (
            <SwiperSlide key={stock.id}>
              <div
                className={styles.stocksCard}
                onClick={() => setSelectedStock(stock)}
              >
                <div className={styles.stocksImgContainer}>
                  <img
                    className={styles.stocksImg}
                    src={
                      images.find((image) => image.id === chooseImage(stock))
                        ?.data
                    }
                    alt={stock.alt}
                  />
                  <div className={styles.stocksTextOverlay}>
                    <h3 className={styles.stocksName}>{stock.name}</h3>
                    <p className={styles.stocksText}>{stock.description}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <StoriesModal
        isOpen={!!selectedStock}
        onClose={() => setSelectedStock(null)}
        imageIds={selectedStock?.images || []}
        images={images}
      />
    </section>
  );
};

export default StocksSection;
