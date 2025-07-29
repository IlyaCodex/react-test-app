import React, { useState } from 'react';
import styles from './CheckoutModal.module.css';

const CheckoutModal = ({ onClose }) => {
  const [isIndividual, setIsIndividual] = useState(true);
  const [selfPickup, setSelfPickup] = useState(false);

  const handleToggle = (type) => {
    setIsIndividual(type === 'individual');
    setSelfPickup(false); 
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Оформление заказа</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.toggleButtons}>
            <button
              className={`${styles.toggleButton} ${isIndividual ? styles.active : ''}`}
              onClick={() => handleToggle('individual')}
            >
              Физлицо
            </button>
            <button
              className={`${styles.toggleButton} ${!isIndividual ? styles.active : ''}`}
              onClick={() => handleToggle('legal')}
            >
              Юрлицо
            </button>
          </div>

          {isIndividual ? (
            <>
              <div className={styles.formSection}>
                <label className={styles.label}>ФИО <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Введите ФИО"
                  required
                />
                <label className={styles.label}>Номер телефона <span className={styles.required}>*</span></label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="+7 (___) ___-__-__"
                  required
                />
                <label className={styles.label}>Электронная почта <span className={styles.required}>*</span></label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="Введите email"
                  required
                />
                <label className={styles.label}>Адрес доставки <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  className={`${styles.input} ${selfPickup ? styles.disabled : ''}`}
                  placeholder="Введите адрес"
                  disabled={selfPickup}
                  required={!selfPickup}
                />
                <label className={styles.label}>Комментарий (необязательно)</label>
                <textarea className={styles.textarea} placeholder="Дополнительная информация"></textarea>

                <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="selfPickup"
                  className={styles.checkbox}
                  checked={selfPickup}
                  onChange={(e) => setSelfPickup(e.target.checked)}
                />
                <label htmlFor="selfPickup" className={styles.checkboxLabel}>
                  Заберу самовывозом (адрес не нужен)
                </label>
              </div>
              </div>
              
            </>
          ) : (
            <div className={styles.formSection}>
              <label className={styles.label}>ФИО <span className={styles.required}>*</span></label>
              <input
                type="text"
                className={styles.input}
                placeholder="Введите ФИО"
                required
              />
              <label className={styles.label}>Номер телефона <span className={styles.required}>*</span></label>
              <input
                type="tel"
                className={styles.input}
                placeholder="+7 (___) ___-__-__"
                required
              />
              <label className={styles.label}>Электронная почта <span className={styles.required}>*</span></label>
              <input
                type="email"
                className={styles.input}
                placeholder="Введите email"
                required
              />
              <label className={styles.label}>Название клиники <span className={styles.required}>*</span></label>
              <input
                type="text"
                className={styles.input}
                placeholder="Введите название"
                required
              />
              <label className={styles.label}>Комментарий (необязательно)</label>
              <textarea className={styles.textarea} placeholder="Дополнительная информация"></textarea>
            </div>
          )}

          <button className={styles.submitButton}>Оформить заказ</button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;