import React from "react";
import styles from "./HomeSection.module.css";
import { Link } from "react-router-dom";

const HomeSection = () => {
  return (
    <section className={styles.home}>
      <div className={styles.container}>
        <div className={styles.homeWrapper}>
          <div className={styles.leftContent}>
            <h1 className={styles.homeTitle}>TRITON</h1>
            <p className={styles.homeText}>Ваш надёжный партнёр<br/>в стоматологии</p>
            <Link className={`${styles.homeBtn} ${styles.btn}`} to="/catalog">
              Заглянуть в каталог
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          <div className={styles.rightContent}>
            <img
              className={styles.homeImg}
              src="../images/home_fone.png"
              alt="Triton инструменты"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
