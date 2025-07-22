import styles from './CartSidebar.module.css';

const CartSidebar = ({ isOpen, onClose, items }) => {
  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className={`${styles.cart} ${isOpen ? styles.open : ''}`}>
      <div className={styles.content}>
        <button className={styles.close_btn} onClick={onClose}>
          ×
        </button>
        <h2>Корзина</h2>
        <div className={styles.items}>
          {items.length === 0 ? (
            <p>Корзина пуста</p>
          ) : (
            items.map((item, index) => (
              <div key={item.id} className={styles.item}>
                {item.image && <img src={item.image} alt={item.name} className={styles.image} />}
                <div className={styles.details}>
                  <h3>{item.name}</h3>
                  <p>{item.description || 'Краткое описание отсутствует'}</p>
                  <p>Цена: {item.price.toLocaleString('ru-RU')} ₽ x {item.quantity}</p>
                </div>
                {index < items.length - 1 && <hr className={styles.separator} />}
              </div>
            ))
          )}
        </div>
        <div className={styles.total}>
          <strong>Итоговая сумма: {calculateTotal().toLocaleString('ru-RU')} ₽</strong>
        </div>
        <button className={styles.checkout} onClick={() => alert('Переход к оформлению заказа')}>
          Перейти к оформлению заказа
        </button>
      </div>
    </div>
  );
};

export default CartSidebar;