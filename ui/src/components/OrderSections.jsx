import React, { useState, useRef, useEffect } from "react";
import styles from "./OrderSection.module.css";
import { api } from "../api";



const CustomSelect = ({ value, onChange, options, placeholder, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={styles.customSelect} ref={selectRef}>
      <button
        type="button"
        className={`${styles.selectButton} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {displayText}
      </button>
      <div className={`${styles.selectDropdown} ${isOpen ? styles.open : ""}`}>
        {options.map((option) => (
          <div
            key={option.value}
            className={`${styles.selectOption} ${
              value === option.value ? styles.selected : ""
            }`}
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderSection = () => {
  const [formData, setFormData] = useState({
    type: "individual",
    fio: "",
    phone: "",
    organization: "",
    contact: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); 

  const orderSteps = [
    {
      title: "Составьте заказ",
      description: "Выберите товар в каталоге и добавьте его в корзину",
    },
    {
      title: "Оплата",
      description:
        "Когда вы определитесь с заказом, вы можете оплатить его и в личном кабинете",
    },
    {
      title: "Связь с менеджером",
      description:
        "После оформления заказа в течение нескольких минут с вами свяжется наш менеджер для согласования деталей",
    },
    {
      title: "Доставка",
      description:
        "Оперативная логистика наш приоритет - надежно упакуем и отправим ваш заказ или можете забрать его самовывозом",
    },
  ];

  const contactOptions = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "telegram", label: "Telegram" },
    { value: "tel", label: "Звонок" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    setFormData({
      ...formData,
      type: e.target.value,
      fio: "",
      phone: "",
      organization: "",
      contact: "",
    });
  };

  const handleContactChange = (value) => {
    setFormData((prev) => ({ ...prev, contact: value }));
  };

  const validateForm = () => {
    if (!formData.fio.trim()) return false;
    if (!formData.phone.trim()) return false;
    if (formData.type === "legal" && !formData.organization.trim())
      return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(null), 5000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

   
    const checkoutData =
      formData.type === "legal"
        ? {
           
            fullName: `${formData.fio} (${formData.organization})`, 
            phone: formData.phone,
            email: "",
            deliveryAddress: `Организация: ${formData.fio}, Клиника: ${formData.organization}`,
            selfPickup: false,
            type: "legal",
            contactMethod: "tel",
            organizationName: formData.fio,
            clinicName: formData.organization,
          }
        : {
            
            fullName: formData.fio,
            phone: formData.phone,
            email: "",
            deliveryAddress: formData.contact
              ? `Способ связи: ${
                  contactOptions.find((opt) => opt.value === formData.contact)
                    ?.label || formData.contact
                }`
              : "",
            selfPickup: false,
            type: "individual",
            contactMethod: formData.contact || "tel",
          };

    console.log("Отправляемые данные:", { checkoutData, cartItems: [] });

    
    api
      .checkout(checkoutData, [])
      .then((response) => {
        console.log("Ответ сервера:", response);

        if (response && !response.error) {
          setSubmitStatus("success");
         
          setFormData({
            type: "individual",
            fio: "",
            phone: "",
            organization: "",
            contact: "",
          });
        } else {
          setSubmitStatus("error");
          console.error(
            "Ошибка при отправке заявки:",
            response?.error || "Неизвестная ошибка"
          );
        }
      })
      .catch((error) => {
        setSubmitStatus("error");
        console.error("Ошибка при отправке заявки:", error);
      })
      .finally(() => {
        setIsSubmitting(false);

        
        setTimeout(() => {
          setSubmitStatus(null);
        }, 2000);
      });
  };


  return (
    <section className={styles.order}>
      <div className={styles.container}>
        <h2 className={styles.titleSection}>Оформление заказа</h2>
        <div className={styles.orderInner}>
          <div className={styles.orderInfo}>
            {orderSteps.map((step, index) => (
              <div
                key={index}
                className={`${styles.orderStep} ${styles[`step${index}`]}`}
              >
                <h3 className={styles.orderSubtitle}>{step.title}</h3>
                <p className={styles.orderText}>{step.description}</p>
              </div>
            ))}
          </div>
          <div className={styles.orderForm}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formHeader}>
                <div className={styles.formText}>
                  <h3 className={styles.orderFormTitle}>Или оставьте заявку</h3>
                  <p className={styles.orderFormText}>
                    Мы поможем с выбором, проконсультируем и оформим заказ
                  </p>
                </div>
                <div className={styles.orderFormType}>
                  <label
                    className={`${styles.typeOption} ${
                      formData.type === "individual" ? styles.selected : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="individual"
                      checked={formData.type === "individual"}
                      onChange={handleTypeChange}
                      className={styles.hiddenRadio}
                    />
                    Физ. лицо
                  </label>
                  <label
                    className={`${styles.typeOption} ${
                      formData.type === "legal" ? styles.selected : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="legal"
                      checked={formData.type === "legal"}
                      onChange={handleTypeChange}
                      className={styles.hiddenRadio}
                    />
                    Юр. лицо
                  </label>
                </div>
              </div>
              <div className={styles.orderFormItems}>
                <div>
                  <input
                    className={styles.input}
                    id="fio"
                    name="fio"
                    type="text"
                    required
                    maxLength="255"
                    placeholder={
                      formData.type === "individual"
                        ? "Ваше имя"
                        : "Название организации"
                    }
                    value={formData.fio}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <input
                    className={styles.input}
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    maxLength="255"
                    placeholder="+7 (999) 222-22-22"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                {formData.type === "legal" && (
                  <div>
                    <input
                      className={styles.input}
                      id="organization"
                      name="organization"
                      type="text"
                      required
                      maxLength="255"
                      placeholder="Название клиники"
                      value={formData.organization}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
                {formData.type === "individual" && (
                  <div>
                    <CustomSelect
                      value={formData.contact}
                      onChange={handleContactChange}
                      options={contactOptions}
                      placeholder="Способ связи"
                      className={styles.customSelect}
                    />
                  </div>
                )}
              </div>

           
              {submitStatus === "success" && (
                <div className={styles.successMessage}>
                  Заявка успешно отправлена! Мы свяжемся с вами в ближайшее
                  время.
                </div>
              )}
              {submitStatus === "error" && (
                <div className={styles.errorMessage}>
                  Ошибка при отправке заявки. Пожалуйста, проверьте заполнение
                  полей и попробуйте позже.
                </div>
              )}

              <button
                className={`${styles.orderBtn} ${
                  isSubmitting ? styles.loading : ""
                }`}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Отправка..." : "Оставить заявку"}
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
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderSection;
