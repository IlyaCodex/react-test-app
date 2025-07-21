import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const StocksSection = () => {
  const stocks = [
    {
      id: 1,
      title: "Скидка 10% на Zub",
      description: "На все инструменты бренда при покупке от 1000 рублей",
      image: "../images/1.jpg",
      alt: "Получите 10% скидки на Zub"
    },
    {
      id: 2,
      title: "Купите от 5000 ₽ — шаурма в подарок!",
      description: "При покупке оборудования на сумму от 5000 ₽ вы получите шаурму",
      image: "../images/2.jpg",
      alt: "Шаурма в подарок"
    },
    {
      id: 3,
      title: "Уколы и перчатки в подарок",
      description: "Закажите средства гигиены от 3000 ₽ и получите уколы и перчатки в подарок",
      image: "../images/3.png",
      alt: "Уколы и перчатки в подарок"
    }
  ];

  const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
      <path 
        d="M16.7071 8.70711C17.0976 8.31658 17.0976 7.68342 16.7071 7.29289L10.3431 0.928932C9.95262 0.538408 9.31946 0.538408 8.92893 0.928932C8.53841 1.31946 8.53841 1.95262 8.92893 2.34315L14.5858 8L8.92893 13.6569C8.53841 14.0474 8.53841 14.6805 8.92893 15.0711C9.31946 15.4616 9.95262 15.4616 10.3431 15.0711L16.7071 8.70711ZM0 8V9H16V8V7H0V8Z" 
        fill="#171717"
      />
    </svg>
  );

  // Настройки для Swiper
  const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    spaceBetween: 30,
    slidesPerView: 1,
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
      // Настройки для разных размеров экранов
      576: {
        slidesPerView: 1,
        autoplay: false
      },
      768: {
        slidesPerView: 2,
        autoplay: false
      },
      992: {
        slidesPerView: 3,
        autoplay: false
      }
    }
  };

  return (
    <section className="stocks indent" id="stocks">
      <div className="container">
        <h2 className="title-section">Акции</h2>
        
        <Swiper {...swiperOptions} className="stocks-swiper">
          {stocks.map((stock) => (
            <SwiperSlide key={stock.id}>
              <div className="stocks__card">
                <div className="stocks__img-container">
                  <img 
                    className="stocks__img" 
                    src={stock.image} 
                    alt={stock.alt} 
                  />
                </div>
                <h3 className="stocks__name">{stock.title}</h3>
                <p className="stocks__description">{stock.description}</p>
                <Link className="stocks__link" to={`/stocks/${stock.id}`}>
                  Подробнее
                  <ArrowIcon />
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default StocksSection;