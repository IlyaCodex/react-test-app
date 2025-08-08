import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CheckoutModal.module.css";

const CheckoutModal = ({ onClose, onSubmit }) => {
  const [isIndividual, setIsIndividual] = useState(true);
  const [selfPickup, setSelfPickup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    deliveryAddress: "",
    clinicName: "",
  });
  const navigate = useNavigate();

  const handleToggle = (type) => {
    setIsIndividual(type === "individual");
    setSelfPickup(false);
    setFormData((prev) => ({
      ...prev,
      deliveryAddress: "",
      clinicName: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit({
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      deliveryAddress: formData.deliveryAddress,
      selfPickup,
      clinicName: formData.clinicName,
    });
    onClose(); 
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
              className={`${styles.toggleButton} ${
                isIndividual ? styles.active : ""
              }`}
              onClick={() => handleToggle("individual")}
            >
              Физлицо
            </button>
            <button
              className={`${styles.toggleButton} ${
                !isIndividual ? styles.active : ""
              }`}
              onClick={() => handleToggle("legal")}
            >
              Юрлицо
            </button>
          </div>

          {isIndividual ? (
            <div className={styles.formSection}>
              <label className={styles.label}>
                ФИО <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Введите ФИО"
                required
              />
              <label className={styles.label}>
                Номер телефона <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                className={styles.input}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (___) ___-__-__"
                required
              />
              <label className={styles.label}>
                Электронная почта <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                className={styles.input}
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Введите email"
                required
              />
              <label className={styles.label}>
                Адрес доставки <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.input} ${
                  selfPickup ? styles.disabled : ""
                }`}
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                placeholder="Введите адрес"
                disabled={selfPickup}
                required={!selfPickup}
              />
              <label className={styles.label}>Комментарий (необязательно)</label>
              <textarea
                className={styles.textarea}
                placeholder="Дополнительная информация"
              ></textarea>

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
          ) : (
            <div className={styles.formSection}>
              <label className={styles.label}>
                ФИО <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Введите ФИО"
                required
              />
              <label className={styles.label}>
                Номер телефона <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                className={styles.input}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (___) ___-__-__"
                required
              />
              <label className={styles.label}>
                Электронная почта <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                className={styles.input}
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Введите email"
                required
              />
              <label className={styles.label}>
                Название клиники <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                name="clinicName"
                value={formData.clinicName}
                onChange={handleChange}
                placeholder="Введите название"
                required
              />
              <label className={styles.label}>Комментарий (необязательно)</label>
              <textarea
                className={styles.textarea}
                placeholder="Дополнительная информация"
              ></textarea>
            </div>
          )}

          <button className={styles.submitButton} onClick={handleSubmit}>
            Оформить заказ
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;