import { useContext, useMemo } from 'react';
import styles from './CartSidebar.module.css';
import { CartContext } from '../context/CartContext';
import { ProductsContext } from '../context/ProductsContext';

const getSuffix = count => {
  if (count == 1) {
    return 'товар';
  }
  if ([2,3,4].includes(count)) {
    return 'товара';
  }
  return 'товаров';
}

const CartSidebar = ({ isOpen, onClose }) => {
  const {items: itemIds, addItems, removeItems} = useContext(CartContext);
  const products = useContext(ProductsContext).data;
  const items = useMemo(() => 
    itemIds.map(item => {
      const product = products.find(product => product.id === item?.id);
      if (product) {
        return {...product, quantity: item.count}
      }
      return undefined;
    }).filter(i => !!i), 
  [itemIds, products]);

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const totalCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className={`${styles.cart} ${isOpen ? styles.open : ''}`} onClick={onClose}>
        <div className={styles.cart_dialog} onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          }}>
        <div className={styles.header}>
          <div/>
          <p>Корзина</p>
          <button onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.content}>
          
          <div className={styles.items}>
            {items.length === 0 ? (
              <div className={styles.empty}>Корзина пуста</div>
            ) : (
              items.map((item, index) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.description}>
                    {item.image && <img src={item.image} alt={item.name} className={styles.image} />}
                    <div className={styles.details}>
                      <p className={styles.item_name}>{item.name}</p>
                      {/* <p className={styles.item_description} >{item.description || 'Краткое описание отсутствует'}</p> */}
                      <p className={styles.item_price}>{item.price.toLocaleString('ru-RU')} ₽</p>
                    </div>
                  </div>
                  <div className={styles.buttons}>
                    <button className={styles.delete} onClick={() => removeItems(...Array.from({length: item.quantity}, () => item.id))}>
                      ×
                    </button>
                    <div className={styles.counter}>
                      <button onClick={() => removeItems(item.id)}>-</button>
                      <div>{item.quantity}</div>
                      <button onClick={() => addItems(item.id)}>+</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className={styles.footer}>
          <div></div>
          <div className={styles.row}>
            <div className={styles.total}>
              <div className={styles.count}>{totalCount} {getSuffix(totalCount)}</div>
              <div className={styles.price}>{calculateTotal().toLocaleString('ru-RU')} ₽</div>
            </div>
            <button className={styles.checkout} onClick={() => alert('Переход к оформлению')}>
              Перейти к оформлению
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;