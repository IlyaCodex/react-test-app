import React from "react";
import styles from "./NotFound.module.css";

const NotFound = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.errorCode}>404</h1>
      <p className={styles.errorMessage}>Упс, кажется такой страницы нет!</p>
    </div>
  );
};

export default NotFound;
