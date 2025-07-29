import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomeSection.module.css';

const HomeSection = () => {
  return (
    <div className={styles.container}>
      <div className={styles.homeContent}>
        <img 
          className={styles.homeImg} 
          src="../images/logo.png" 
          width="140" 
          height="102" 
          alt="Triton логотип" 
        />
        <h1 className={styles.homeTitle}>Triton</h1>
        <p className={styles.homeText}>
          Ваш надёжный партнер в стоматологии
        </p>
      </div>
      
      <Link className={`${styles.homeBtn} ${styles.btn}`} to="/catalog">
        Заглянуть в каталог
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
          <path 
            d="M16.7071 8.70711C17.0976 8.31658 17.0976 7.68342 16.7071 7.29289L10.3431 0.928932C9.95262 0.538408 9.31946 0.538408 8.92893 0.928932C8.53841 1.31946 8.53841 1.95262 8.92893 2.34315L14.5858 8L8.92893 13.6569C8.53841 14.0474 8.53841 14.6805 8.92893 15.0711C9.31946 15.4616 9.95262 15.4616 10.3431 15.0711L16.7071 8.70711ZM0 8V9H16V8V7H0V8Z" 
            fill="white"
          />
        </svg>
      </Link>
    </div>
  );
};

export default HomeSection;