import React, { useState, useEffect } from "react";
import { useContext } from "react";
import styles from "./FinalModal.module.css";
import { CartContext } from "../context/CartContext";
import { api } from "../api";

const FinalModal = ({ onClose, checkoutData, onSubmit }) => {
  const { items, addItems, removeItems, clearCart } = useContext(CartContext);
  const [images, setImages] = useState([]);

  useEffect(() => {
    Promise.all(
      items
        .map((item) => item.images?.[0])
        .filter((id) => id)
        .map((imageId) => api.getItemImage(imageId).then((res) => res.data))
    ).then((arr) => setImages(arr.filter((img) => img)));
  }, [items]);

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.count, 0);
  };

  const getSuffix = (count) => {
    if (count === 1) return "товар";
    if ([2, 3, 4].includes(count)) return "товара";
    return "товаров";
  };

  const handleQuantityChange = (item, delta) => {
    if (delta > 0) addItems(item);
    else if (delta < 0 && item.count > 1) removeItems(item);
  };

  const handleSubmit = () => {
    api
      .checkout(
        { ...checkoutData, totalPrice: calculateTotal() },
        items.map((item) => ({
          name: item.name,
          article: item.article,
          price: item.price,
          count: item.count,
        }))
      )
      .then((response) => {
        if (!response.error) {
          clearCart();
          onClose();
        }
      });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Оформление заказа</h2>
        <div className={styles.modalHeader}>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.columns}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Получатель</h3>
              <p>
                <strong>ФИО:</strong> {checkoutData.fullName || "Не указано"}
              </p>
              <p>
                <strong>Телефон:</strong> {checkoutData.phone || "Не указан"}
              </p>
              <p>
                <strong>Почта:</strong> {checkoutData.email || "Не указана"}
              </p>
            </div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Доставка</h3>
              {checkoutData.selfPickup ? (
                <p>Заберу сам (самовывозом)</p>
              ) : (
                <p>
                  <strong>Адрес:</strong>{" "}
                  {checkoutData.deliveryAddress || "Не указан"}
                </p>
              )}
            </div>
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Корзина</h3>
            <div className={styles.productList}>
              {items.length === 0 ? (
                <p className={styles.empty}>Корзина пуста</p>
              ) : (
                items.map((item, index) => (
                  <div key={item.id} className={styles.productItem}>
                    <img
                      src={images[index]?.data}
                      alt={item.name}
                      className={styles.productImage}
                    />
                    <div className={styles.productDetails}>
                      <p className={styles.productName}>{item.name}</p>
                      <p className={styles.productPrice}>
                        {item.price.toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                    <div className={styles.productControls}>
                      <button
                        className={styles.controlButton}
                        onClick={() => handleQuantityChange(item, -1)}
                      >
                        -
                      </button>
                      <span className={styles.quantity}>{item.count}</span>
                      <button
                        className={styles.controlButton}
                        onClick={() => handleQuantityChange(item, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className={styles.footer}>
            <div className={styles.totalSection}>
              <p className={styles.count}>
                {items.reduce((sum, item) => sum + item.count, 0)}{" "}
                {getSuffix(items.reduce((sum, item) => sum + item.count, 0))}
              </p>
              <p className={styles.summ}>
                {calculateTotal().toLocaleString("ru-RU")} ₽
              </p>
            </div>
            <button className={styles.submitButton} onClick={handleSubmit}>
              Оформить заказ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalModal;
