import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CheckoutModal.module.css";
import { api } from "../api";

const CheckoutModal = ({ onClose, cartItems = [] }) => {
  const [isIndividual, setIsIndividual] = useState(true);
  const [selfPickup, setSelfPickup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    deliveryAddress: "",
    clinicName: "",
    comment: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); 

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

  const validateForm = () => {
    if (!formData.fullName.trim()) return false;
    if (!formData.phone.trim()) return false;
    if (!formData.email.trim()) return false;

    if (isIndividual) {
      if (!selfPickup && !formData.deliveryAddress.trim()) return false;
    } else {
      if (!formData.clinicName.trim()) return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(null), 5000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const checkoutData = isIndividual
      ? {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          deliveryAddress: selfPickup ? "Самовывоз" : formData.deliveryAddress,
          selfPickup: selfPickup,
          type: "individual",
          contactMethod: "email",
          comment: formData.comment,
        }
      : {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          deliveryAddress: `Клиника: ${formData.clinicName}`,
          selfPickup: false,
          type: "legal",
          contactMethod: "email",
          organizationName: formData.clinicName,
          clinicName: formData.clinicName,
          comment: formData.comment,
        };


    api
      .checkout(checkoutData, cartItems)
      .then((response) => {

        if (response && !response.error) {
          setSubmitStatus("success");

          setFormData({
            fullName: "",
            phone: "",
            email: "",
            deliveryAddress: "",
            clinicName: "",
            comment: "",
          });
          setSelfPickup(false);

          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setSubmitStatus("error");
          console.error(
            "Ошибка при отправке заказа:",
            response?.error || "Неизвестная ошибка"
          );
        }
      })
      .catch((error) => {
        setSubmitStatus("error");
        console.error("Ошибка при отправке заказа:", error);
      })
      .finally(() => {
        setIsSubmitting(false);

        if (submitStatus !== "success") {
          setTimeout(() => {
            setSubmitStatus(null);
          }, 3000);
        }
      });
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
              <label className={styles.label}>
                Комментарий (необязательно)
              </label>
              <textarea
                className={styles.textarea}
                name="comment"
                value={formData.comment}
                onChange={handleChange}
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
              <label className={styles.label}>
                Комментарий (необязательно)
              </label>
              <textarea
                className={styles.textarea}
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Дополнительная информация"
              ></textarea>
            </div>
          )}

          {submitStatus === "success" && (
            <div className={styles.successMessage}>
              Спасибо, мы свяжемся с вами в ближайшее время.
            </div>
          )}
          {submitStatus === "error" && (
            <div className={styles.errorMessage}>
              Ошибка при отправке. Попробуйте позже
            </div>
          )}

          <button
            className={`${styles.submitButton} ${
              isSubmitting ? styles.loading : ""
            }`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Отправка..." : "Отправить заявку"}
            {!isSubmitting && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
