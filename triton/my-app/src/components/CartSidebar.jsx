import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// компонент Корзины

const CartSidebar = ({ isOpen, onClose, items }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleRemoveItem = (id) => {
    // Функция удаления товара (нужно синхронизировать с Header)
    // Здесь предполагается, что родительский компонент (Header) управляет состоянием
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="cart-overlay"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="cart-sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="cart-header">
                <h2>Корзина</h2>
                <button onClick={onClose} className="close-btn">
                  <X size={24} />
                </button>
              </div>

              {items.length === 0 ? (
                <p className="empty-cart">Ваша корзина пока что пустая</p>
              ) : (
                <div>
                  {items.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div className="item-info">
                        <p className="item-name">{item.name}</p>
                        <p className="item-desc">{item.description || 'Описание отсутствует'}</p>
                      </div>
                      <p className="item-price">{item.price} ₽</p>
                      <div className="item-qty">Кол-во: {item.quantity}</div>
                      <button onClick={() => handleRemoveItem(item.id)} className="remove-btn">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="cart-total">Сумма заказа: {total} ₽</div>
                  <button className="checkout-btn">
                    Перейти к оформлению заказа
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartSidebar;