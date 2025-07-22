import React from 'react';

const CartSidebar = ({ isOpen, onClose, items }) => {
  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cart-sidebar-content">
        <button className="cart-close-btn" onClick={onClose}>
          ×
        </button>
        <h2>Корзина</h2>
        <div className="cart-items">
          {items.length === 0 ? (
            <p>Корзина пуста</p>
          ) : (
            items.map((item, index) => (
              <div key={item.id} className="cart-item">
                {item.image && <img src={item.image} alt={item.name} className="cart-item-image" />}
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>{item.description || 'Краткое описание отсутствует'}</p>
                  <p>Цена: {item.price.toLocaleString('ru-RU')} ₽ x {item.quantity}</p>
                </div>
                {index < items.length - 1 && <hr className="cart-item-separator" />}
              </div>
            ))
          )}
        </div>
        <div className="cart-total">
          <strong>Итоговая сумма: {calculateTotal().toLocaleString('ru-RU')} ₽</strong>
        </div>
        <button className="cart-checkout-btn" onClick={() => alert('Переход к оформлению заказа')}>
          Перейти к оформлению заказа
        </button>
      </div>
    </div>
  );
};

export default CartSidebar;