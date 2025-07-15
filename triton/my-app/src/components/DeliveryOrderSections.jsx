import React, { useState } from 'react';

const DeliverySection = () => {
  const deliverySteps = [
    {
      icon: "images/icons/delivery.svg",
      title: "Заказ и консультация",
      description: "Свяжитесь с нами — мы поможем выбрать нужную продукцию"
    },
    {
      icon: "images/icons/payment.svg",
      title: "Оплата",
      description: "Оплатите заказ любым удобным для вас способом"
    },
    {
      icon: "images/icons/delivery_car.svg",
      title: "Доставка",
      description: "Доставим ваш заказ курьером или через транспортную компанию"
    }
  ];

  return (
    <section className="delivery indent">
      <div className="container">
        <h2 className="title-section">Как работает наша доставка?</h2>
        <ul className="delivery__items">
          {deliverySteps.map((step, index) => (
            <li key={index} className="delivery__item">
              <img 
                src={step.icon} 
                width="42" 
                height="42" 
                alt="декоративная иконка" 
              />
              <span className="delivery__subtitle">{step.title}</span>
              <p className="delivery__description">
                {step.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const OrderSection = () => {
  // Состояния для формы
  const [formData, setFormData] = useState({
    fio: '',
    phone: ''
  });
  
  const orderSteps = [
    {
      title: "Составление заказа",
      description: "После нажатия 'Продолжить оформление' Вы перейдёте в корзину, в неё вы сможете отредактировать состав заказа"
    },
    {
      title: "Оплата",
      description: "Когда вы определитесь с заказом, вы можете оплатить его и в личном кабинете"
    },
    {
      title: "Связь с менеджером",
      description: "После оформления заказа в течение нескольких минут с вами свяжется наш менеджер для согласования деталей"
    },
    {
      title: "Согласование",
      description: "Вы сможете задать менеджеру имеющиеся вопросы и подтвердить заказ"
    }
  ];

  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Форма отправлена:', formData);
    // будет логика отправки данных
  };

  
  const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
      <path d="M16.7071 8.70711C17.0976 8.31658 17.0976 7.68342 16.7071 7.29289L10.3431 0.928932C9.95262 0.538408 9.31946 0.538408 8.92893 0.928932C8.53841 1.31946 8.53841 1.95262 8.92893 2.34315L14.5858 8L8.92893 13.6569C8.53841 14.0474 8.53841 14.6805 8.92893 15.0711C9.31946 15.4616 9.95262 15.4616 10.3431 15.0711L16.7071 8.70711ZM0 8V9H16V8V7H0V8Z" fill="white"/>
    </svg>
  );

  return (
    <section className="order indent">
      <div className="container">
        <div className="order__inner">
          <div className="order__info">
            <h2 className="title-section title-section--small">Как проходит оформление заказа</h2>
            <ul className="order__list">
              {orderSteps.map((step, index) => (
                <li key={index}>
                  <h3 className="order__subtitle">{step.title}</h3>
                  <p className="order__text">
                    {step.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          
          <form className="order__form" onSubmit={handleSubmit}>
            <h3 className="order__form-title">Оформите заявку</h3>
            <p className="order__form-text">*свяжемся с вами через пару секунд</p>
            
            <div className="order__form-items">
              <div>
                <label className="label" htmlFor="fio">ФИО</label>
                <input 
                  className="input" 
                  id="fio" 
                  name="fio" 
                  type="text" 
                  required 
                  maxLength="255" 
                  placeholder="Иванов Иван Иванович"
                  value={formData.fio}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="label" htmlFor="phone">Номер телефона</label>
                <input 
                  className="input" 
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
            </div>
            
            <button className="order__btn btn" type="submit">
              Продолжить оформление
              <ArrowIcon />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};


const DeliveryOrderSections = () => {
  return (
    <>
      <DeliverySection />
      <OrderSection />
    </>
  );
};

export default DeliveryOrderSections;