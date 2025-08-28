import { useContext, useEffect, useMemo, useState } from "react";
import styles from "./CartSidebar.module.css";
import { CartContext } from "../context/CartContext";
import CheckoutModal from "./CheckoutModal";
import FinalModal from "./FinalModal";
import { nonNull } from "./admin/Utils";
import { api } from "../api";
import { useItemModal } from "../context/ItemModalContext";

const getSuffix = (count) => {
  if (count === 1) {
    return "товар";
  }
  if ([2, 3, 4].includes(count)) {
    return "товара";
  }
  return "товаров";
};

const chooseImage = (item) => item?.images?.[0];

const CartSidebar = () => {
  const { items, addItems, removeItems } = useContext(CartContext);
  const [images, setImages] = useState([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isFinalModalOpen, setIsFinalModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [recomendedItems, setRecomendedItems] = useState([]);
  const { onOpenItemModal } = useItemModal();
  const { isOpen, closeCart } = useContext(CartContext);

  useEffect(() => {
    Promise.all(
      items
        .map(chooseImage)
        .filter(nonNull)
        .map((imageId) => api.getItemImage(imageId).then((res) => res.data))
    ).then(async (arr) => {
      const newImages = arr.filter(nonNull);
      setImages(newImages);
      const recomended = await Promise.all(
        items.map((item) => api.getRecomendedItems(item.id))
      ).then((responses) =>
        responses.flatMap((response) => response.data).filter(nonNull)
      );
      setRecomendedItems(recomended);
      const newRecomendedImages = await Promise.all(
        recomended
          .map(chooseImage)
          .filter(nonNull)
          .map((imageId) => api.getItemImage(imageId).then((res) => res.data))
      );
      setImages([...newImages, ...newRecomendedImages.filter(nonNull)]);
    });
  }, [items]);

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.count, 0);
  };

  const totalCount = items.reduce((total, item) => total + item.count, 0);

  const handleCheckoutClick = () => {
    setIsCheckoutModalOpen(true);
  };

  const handleCloseCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };

  const handleSubmitCheckout = (data) => {
    setCheckoutData(data);
    setIsFinalModalOpen(true);
  };

  const handleCloseFinalModal = () => {
    setIsFinalModalOpen(false);
    setCheckoutData(null);
  };

  return (
    <div
      className={`${styles.cart} ${isOpen ? styles.open : ""}`}
      onClick={closeCart}
    >
      <div
        className={styles.cart_dialog}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className={styles.header}>
          <button className={styles.close_button} onClick={closeCart}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.summary}>
            <span>
              {totalCount} {getSuffix(totalCount)} на{" "}
              {calculateTotal().toLocaleString("ru-RU")} ₽
            </span>
          </div>

          <div className={styles.items}>
            {items.length === 0 ? (
              <div className={styles.empty}>Корзина пуста</div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={styles.item}
                  onClick={(e) => {
                    if (e.target.tagName !== "BUTTON") {
                      onOpenItemModal(item);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={
                      images.find((image) => image.id === chooseImage(item))
                        ?.data
                    }
                    alt={item.name}
                    className={styles.image}
                  />

                  <div className={styles.item_info}>
                    <button
                      className={styles.delete}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItems(
                          ...Array.from({ length: item.count }, () => item)
                        );
                      }}
                    >
                      ×
                    </button>
                    <div className={styles.details}>
                      <p className={styles.item_name}>{item.name}</p>
                      <p className={styles.item_brand}>{item.brand || ""}</p>
                    </div>
                    <div className={styles.price_and_counter}>
                      <p className={styles.item_price}>
                        {item.price?.toLocaleString("ru-RU")} ₽
                      </p>
                      <div className={styles.counter}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItems(item);
                          }}
                        >
                          -
                        </button>
                        <span>{item.count}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItems(item);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.recommend}>
            <p className={styles.recommend_title}>Добавьте к заказу</p>
            <div className={styles.recommend_scroll}>
              {recomendedItems.map((item) => (
                <div
                  key={item.id}
                  className={styles.recommend_item}
                  onClick={() => onOpenItemModal(item)}
                >
                  <img
                    title={item.name}
                    src={
                      images.find((image) => image.id === chooseImage(item))
                        ?.data
                    }
                    alt="Рекомендация"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.total_section}>
            <div className={styles.total_label}>Сумма заказа</div>
            <div className={styles.total_price}>
              {calculateTotal().toLocaleString("ru-RU")} ₽
            </div>
          </div>
          <button className={styles.checkout} onClick={handleCheckoutClick}>
            Перейти к оформлению
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      {isCheckoutModalOpen && (
        <CheckoutModal
          onClose={handleCloseCheckoutModal}
          onSubmit={handleSubmitCheckout}
        />
      )}
      {isFinalModalOpen && (
        <FinalModal
          onClose={handleCloseFinalModal}
          checkoutData={checkoutData}
        />
      )}
    </div>
  );
};

export default CartSidebar;
