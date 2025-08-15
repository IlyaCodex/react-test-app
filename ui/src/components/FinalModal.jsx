import React, { useState, useEffect } from "react";
import { useContext } from "react";
import styles from "./FinalModal.module.css";
import { CartContext } from "../context/CartContext";
import { api } from "../api";

const FinalModal = ({ onClose, checkoutData, onSubmit }) => {
  const { items, addItems, removeItems, clearCart } = useContext(CartContext);
  const [images, setImages] = useState([]);
  const [isEditingRecipient, setIsEditingRecipient] = useState(false);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [editedData, setEditedData] = useState(checkoutData || {});

  useEffect(() => {
    Promise.all(
      items
        .map((item) => item.images?.[0])
        .filter((id) => id)
        .map((imageId) => api.getItemImage(imageId).then((res) => res.data))
    ).then((arr) => setImages(arr.filter((img) => img)));
  }, [items]);

  useEffect(() => {
    setEditedData(checkoutData || {});
  }, [checkoutData]);

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
        { ...editedData, totalPrice: calculateTotal() }, // Use edited data
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

  const handleEditRecipient = () => {
    setIsEditingRecipient(true);
  };

  const handleEditDelivery = () => {
    setIsEditingDelivery(true);
  };

  const handleSaveRecipient = () => {
    setIsEditingRecipient(false);
    // Optionally call onSubmit or update parent state if needed
  };

  const handleSaveDelivery = () => {
    setIsEditingDelivery(false);
    // Optionally call onSubmit or update parent state if needed
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
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
              <h3 className={styles.sectionTitle}>
                Получатель
                {!isEditingRecipient && (
                  <span
                    className={styles.editIcon}
                    onClick={handleEditRecipient}
                  >
                    ✎
                  </span>
                )}
              </h3>
              {isEditingRecipient ? (
                <div>
                  <input
                    type="text"
                    name="fullName"
                    value={editedData.fullName || ""}
                    onChange={handleInputChange}
                    placeholder="ФИО"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={editedData.phone || ""}
                    onChange={handleInputChange}
                    placeholder="Телефон"
                  />
                  <input
                    type="email"
                    name="email"
                    value={editedData.email || ""}
                    onChange={handleInputChange}
                    placeholder="Почта"
                  />
                  <button
                    className={styles.saveButton}
                    onClick={handleSaveRecipient}
                  >
                    Сохранить
                  </button>
                </div>
              ) : (
                <div>
                  <p>
                    <strong>ФИО:</strong> {editedData.fullName || "Не указано"}
                  </p>
                  <p>
                    <strong>Телефон:</strong> {editedData.phone || "Не указан"}
                  </p>
                  <p>
                    <strong>Почта:</strong> {editedData.email || "Не указана"}
                  </p>
                </div>
              )}
            </div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Доставка
                {!isEditingDelivery && (
                  <span
                    className={styles.editIcon}
                    onClick={handleEditDelivery}
                  >
                    ✎
                  </span>
                )}
              </h3>
              {isEditingDelivery ? (
                <div>
                  <label>
                    <input
                      type="checkbox"
                      name="selfPickup"
                      checked={editedData.selfPickup || false}
                      onChange={(e) =>
                        setEditedData((prev) => ({
                          ...prev,
                          selfPickup: e.target.checked,
                          deliveryAddress: e.target.checked
                            ? ""
                            : prev.deliveryAddress,
                        }))
                      }
                    />
                    Заберу сам (самовывозом)
                  </label>
                  {!editedData.selfPickup && (
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={editedData.deliveryAddress || ""}
                      onChange={handleInputChange}
                      placeholder="Адрес доставки"
                    />
                  )}
                  <button
                    className={styles.saveButton}
                    onClick={handleSaveDelivery}
                  >
                    Сохранить
                  </button>
                </div>
              ) : (
                <div>
                  {editedData.selfPickup ? (
                    <p>Заберу сам (самовывозом)</p>
                  ) : (
                    <p>
                      <strong>Адрес:</strong>{" "}
                      {editedData.deliveryAddress || "Не указан"}
                    </p>
                  )}
                </div>
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
