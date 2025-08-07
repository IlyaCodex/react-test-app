import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import styles from './StocksSection.module.css';

const StoriesModal = ({ isOpen, onClose, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    if (isOpen && images.length > 0) {
      setProgress(0);
      const interval = 100; // Update every 100ms
      const totalDuration = 10000; // 10 seconds
      const increment = 100 / (totalDuration / interval);

      intervalRef.current = setInterval(() => {
        if (!isPausedRef.current) {
          setProgress((prev) => {
            if (prev >= 100) {
              if (currentIndex < images.length - 1) {
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
  }, [isOpen, currentIndex, images.length, onClose]);

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
          {images.map((_, index) => (
            <div
              key={index}
              className={styles.storiesProgressBar}
              style={{
                width: `${100 / images.length}%`,
                background: index === currentIndex
                  ? `linear-gradient(to right,rgba(78, 78, 78, 0.78) ${progress}%, transparent ${progress}%)`
                  : 'transparent',
              }}
            />
          ))}
        </div>
        <img
          src={images[currentIndex]}
          alt={`Story ${currentIndex + 1}`}
          className={styles.storiesImg}
        />
      </div>
    </div>
  );
};

const StocksSection = () => {
  const [selectedStock, setSelectedStock] = useState(null);

  const stocks = [
    {
      id: 1,
      title: "3 по цене 2",
      text: "на расходники",
      image: "../images/f591762b1b0171695e2a2e4c8f62cc85c4817024.jpg",
      alt: "Получите 10% скидки на Zub",
      images: ["../images/1.jpg", "../images/2.jpg"]
    },
    {
      id: 2,
      title: "3 по цене 2",
      text: "на расходники",
      image: "../images/7d491769a2032ba19dc50d9f9eef56deb26e0dd1.jpg",
      alt: "Шаурма в подарок",
      images: ["../images/2.jpg", "../images/3.png"]
    },
    {
      id: 3,
      title: "Профи-день",
      text: "скидки для мастеров",
      image: "../images/2a4641d72558b67796c7370b39efd6edd67d09e1.jpg",
      alt: "Уколы и перчатки в подарок",
      images: ["../images/3.png"]
    },
    {
      id: 4,
      title: "Инструмент недели",
      text: "скидка до 40%",
      image: "../images/ff18b815a6c2eb89696ae2dc573a4bc1db511789.png",
      alt: "Специальное предложение",
      images: ["../images/4.jpg", "../images/1.jpg"]
    },
  ];

  const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
      <path 
        d="M16.7071 8.70711C17.0976 8.31658 17.0976 7.68342 16.7071 7.29289L10.3431 0.928932C9.95262 0.538408 9.31946 0.538408 8.92893 0.928932C8.53841 1.31946 8.53841 1.95262 8.92893 2.34315L14.5858 8L8.92893 13.6569C8.53841 14.0474 8.53841 14.6805 8.92893 15.0711C9.31946 15.4616 9.95262 15.4616 10.3431 15.0711L16.7071 8.70711ZM0 8V9H16V8V7H0V8Z" 
        fill="#171717"
      />
    </svg>
  );

const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    spaceBetween: 15, // Reduced space for 4 cards on mobile
    slidesPerView: 4, // Default to 4 on desktop
    loop: true,
    pagination: {
      clickable: true,
      dynamicBullets: true
    },
    navigation: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    breakpoints: {
      0: { 
        slidesPerView: 2, // 4 cards on mobile
        spaceBetween: 10 // Tight spacing for mobile
      },
      576: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      992: { slidesPerView: 4 }
    }
  };
  return (
    <section className={styles.stocks} id="stocks">
      <div className={styles.container}>
        <h2 className={styles.titleSection}>Акции</h2>
        
        <Swiper {...swiperOptions} className={styles.stocksSwiper}>
          {stocks.map((stock) => (
            <SwiperSlide key={stock.id}>
              <div className={styles.stocksCard} onClick={() => setSelectedStock(stock)}>
                <div className={styles.stocksImgContainer}>
                  <img 
                    className={styles.stocksImg} 
                    src={stock.image} 
                    alt={stock.alt} 
                  />
                  <div className={styles.stocksTextOverlay}>
                    <h3 className={styles.stocksName}>{stock.title}</h3>
                    <p className={styles.stocksText}>{stock.text}</p>
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
        images={selectedStock?.images || []} 
      />
    </section>
  );
};

export default StocksSection;
