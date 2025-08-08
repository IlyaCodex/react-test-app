import React, { useState } from 'react';
import styles from './OrderSection.module.css';

const OrderSection = () => {
  const [formData, setFormData] = useState({
    type: 'individual', // 'individual' or 'legal'
    fio: '',
    phone: '',
    organization: ''
  });

  const orderSteps = [
    { title: "Составьте заказ", description: "Выберите товар в каталоге и добавьте его в корзину" },
    { title: "Оплата", description: "Когда вы определитесь с заказом, вы можете оплатить его и в личном кабинете" },
    { title: "Связь с менеджером", description: "После оформления заказа в течение нескольких минут с вами свяжется наш менеджер для согласования деталей" },
    { title: "Доставка", description: "Оперативная логистика наш приоритет - надежно упакуем и отправим ваш заказ или можете забрать его самовывозом" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    setFormData({ ...formData, type: e.target.value, fio: '', phone: '', organization: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <section className={styles.order} >
      <div className={styles.container}>
        <h2 className={styles.titleSection}>Оформление заказа</h2>
        <div className={styles.orderInner}>
          <div className={styles.orderInfo}>
            {orderSteps.map((step, index) => (
              <div key={index} className={`${styles.orderStep} ${styles[`step${index}`]}`}>
                <h3 className={styles.orderSubtitle}>{step.title}</h3>
                <p className={styles.orderText}>{step.description}</p>
              </div>
            ))}
          </div>
          <div className={styles.orderForm}>
            <div className={styles.formHeader}>
              <div className={styles.formText}>
                <h3 className={styles.orderFormTitle}>Или оставьте заявку</h3>
                <p className={styles.orderFormText}>Мы поможем с выбором, проконсультируем и оформим заказ</p>
              </div>
              <div className={styles.orderFormType}>
                <label className={`${styles.typeOption} ${formData.type === 'individual' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="type"
                    value="individual"
                    checked={formData.type === 'individual'}
                    onChange={handleTypeChange}
                    className={styles.hiddenRadio}
                  /> Физ. лицо
                </label>
                <label className={`${styles.typeOption} ${formData.type === 'legal' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="type"
                    value="legal"
                    checked={formData.type === 'legal'}
                    onChange={handleTypeChange}
                    className={styles.hiddenRadio}
                  /> Юр. лицо
                </label>
              </div>
            </div>
            <div className={styles.orderFormItems}>
              <div>
                {/* <label className={styles.label} htmlFor="fio">Ваше имя</label> */}
                <input
                  className={styles.input}
                  id="fio"
                  name="fio"
                  type="text"
                  required
                  maxLength="255"
                  placeholder={formData.type === 'individual' ? "Ваше имя" : "Название организации"}
                  value={formData.fio}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                {/* <label className={styles.label} htmlFor="phone">Номер телефона</label> */}
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
              {formData.type === 'legal' && (
                <div>
                  {/* <label className={styles.label} htmlFor="organization">Название организации</label> */}
                  <input
                    className={styles.input}
                    id="organization"
                    name="organization"
                    type="text"
                    required
                    maxLength="255"
                    placeholder="Название клиники'"
                    value={formData.organization}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              {formData.type === 'individual' && (
                <div>
                  {/* <label className={styles.label} htmlFor="contact">Способ связи</label> */}
                  <select
                    className={styles.input}
                    id="contact"
                    name="contact"
                    value={formData.contact || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Способ связи</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="telegram">Telegram</option>
                    <option value="tel">Звонок</option>
                  </select>
                </div>
              )}
            </div>
            <button className={styles.orderBtn} type="submit">Оставить заявку</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderSection;