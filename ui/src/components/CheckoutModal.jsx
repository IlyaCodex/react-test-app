import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CheckoutModal.module.css";
// import { api } from "../api";

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

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, "");

    let formatted = phoneNumber;
    if (formatted.startsWith("8")) {
      formatted = "7" + formatted.slice(1);
    }

    if (!formatted.startsWith("7") && formatted.length > 0) {
      formatted = "7" + formatted;
    }

    if (formatted.length > 11) {
      formatted = formatted.slice(0, 11);
    }

    if (formatted.length === 0) return "";
    if (formatted.length <= 1) return "+7";
    if (formatted.length <= 4) return `+7 (${formatted.slice(1)}`;
    if (formatted.length <= 7)
      return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4)}`;
    if (formatted.length <= 9)
      return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(
        4,
        7
      )} ${formatted.slice(7)}`;
    if (formatted.length <= 11)
      return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(
        4,
        7
      )} ${formatted.slice(7, 9)} ${formatted.slice(9)}`;

    return value;
  };

  const handlePhoneFocus = (e) => {
    if (!formData.phone) {
      setFormData((prev) => ({
        ...prev,
        phone: "+7 ",
      }));
    }
  };

  const handlePhoneKeyDown = (e) => {
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      formData.phone.length <= 3
    ) {
      e.preventDefault();
    }
  };

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

    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        phone: formattedPhone,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      alert("Пожалуйста, введите ФИО");
      return false;
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 11) {
      alert("Пожалуйста, введите полный номер телефона");
      return false;
    }

    if (!formData.email.trim()) {
      alert("Пожалуйста, введите email");
      return false;
    }

    if (isIndividual) {
      if (!selfPickup && !formData.deliveryAddress.trim()) {
        alert("Пожалуйста, введите адрес доставки или выберите самовывоз");
        return false;
      }
    } else {
      if (!formData.clinicName.trim()) {
        alert("Пожалуйста, введите название клиники");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      selfPickup,
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
                onFocus={handlePhoneFocus}
                onKeyDown={handlePhoneKeyDown}
                placeholder="+7 (999) 999 99 99"
                maxLength="18"
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
              <label className={styles.label}>
                Комментарий (необязательно)
              </label>
              <textarea
                className={styles.textarea}
                placeholder="Дополнительная информация"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
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
                onFocus={handlePhoneFocus}
                onKeyDown={handlePhoneKeyDown}
                placeholder="+7 (999) 999 99 99"
                maxLength="18"
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
              <label className={styles.label}>
                Комментарий (необязательно)
              </label>
              <textarea
                className={styles.textarea}
                placeholder="Дополнительная информация"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
              ></textarea>
            </div>
          )}

          <button className={styles.submitButton} onClick={handleSubmit}>
            Продолжить оформление
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
