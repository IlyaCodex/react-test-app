import { useContext, useEffect, useState } from "react";
import styles from "./FavoritesSidebar.module.css";
import { CartContext } from "../context/CartContext";
import { nonNull } from "./admin/Utils";
import { api } from "../api";
import { useFavorites } from "../context/FavoriteContext";
import { HeartCrack } from "lucide-react";
import { useItemModal } from "../context/ItemModalContext";

const chooseImage = (item) => item.images?.[0];

export const FavoritesSidebar = ({ isOpen, onClose, onToCart }) => {
  const { favorites: items = [], toggleFavorite } = useFavorites() || {};
  const { addItems, removeItems } = useContext(CartContext);
  const [images, setImages] = useState([]);
  const [itemCounts, setItemCounts] = useState({});
  const { onOpenItemModal } = useItemModal();

  useEffect(() => {
    if (!Array.isArray(items)) {
      console.warn("items is not an array, resetting to empty array", items);
      setImages([]);
      return;
    }

    Promise.all(
      items
        .map(chooseImage)
        .filter(nonNull)
        .map((imageId) => api.getItemImage(imageId).then((res) => res.data))
    )
      .then((arr) => setImages(arr))
      .catch((error) => {
        console.error("Error loading images:", error);
        setImages([]);
      });
  }, [items]);

  useEffect(() => {
    const initialCounts = {};
    items.forEach((item) => {
      initialCounts[item.id] = 0;
    });
    setItemCounts(initialCounts);
  }, [items]);

  const handleRemoveItem = (item) => {
    const count = itemCounts[item.id] || 0;
    if (count > 0) {
      setItemCounts((prev) => ({ ...prev, [item.id]: count - 1 }));
      removeItems(item);
    }
  };

  const handleIncreaseCount = (item) => {
    const currentCount = itemCounts[item.id] || 0;
    setItemCounts((prev) => ({ ...prev, [item.id]: currentCount + 1 }));
    addItems(item);
  };

  const totalSum = items.reduce((sum, item) => {
    const count = itemCounts[item.id] || 0;
    return sum + item.price * count;
  }, 0);

  const totalItems = items.reduce((sum, item) => {
    return sum + (itemCounts[item.id] || 0);
  }, 0);

  return (
    <div
      className={`${styles.cart} ${isOpen ? styles.open : ""}`}
      onClick={onClose}
    >
      <div
        className={styles.cart_dialog}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button className={styles.buttonClose} onClick={onClose}>
          ×
        </button>
        <div className={styles.header}>
          <div />
          {/* <p>Избранное</p> */}
        </div>

        {totalItems > 0 && (
          <div className={styles.summary}>
            {totalItems} товара на {totalSum.toLocaleString("ru-RU")} ₽
          </div>
        )}

        <div className={styles.content}>
          <div className={styles.items}>
            {items.length === 0 ? (
              <div className={styles.empty}>Пусто</div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  className={styles.item}
                  onClick={(e) => {
                    // Проверяем, что клик не по кнопкам
                    if (
                      e.target.tagName !== "BUTTON" &&
                      !e.target.closest("button")
                    ) {
                      onOpenItemModal(item);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.description}>
                    <img
                      src={
                        images.find((image) => image.id === chooseImage(item))
                          ?.data ||
                        (chooseImage(item) ? "/placeholder-image.jpg" : "")
                      }
                      alt={item.name}
                      className={styles.image}
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                    <div className={styles.details}>
                      <p className={styles.item_name}>{item.name}</p>
                      <p className={styles.item_price}>
                        {item.price?.toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                  </div>
                  <div className={styles.buttons}>
                    <button
                      className={styles.delete}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item);
                      }}
                    >
                      <HeartCrack />
                    </button>
                    <div className={styles.Favoritecounter}>
                      {(itemCounts[item.id] || 0) > 0 ? (
                        <div className={styles.counter}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item);
                            }}
                            disabled={itemCounts[item.id] <= 0}
                          >
                            -
                          </button>
                          <div>{itemCounts[item.id] || 0}</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIncreaseCount(item);
                            }}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className={`${styles.toCart} ${styles.toCartBlack}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIncreaseCount(item);
                          }}
                        >
                          В корзину
                        </button>
                      )}
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
            <button className={styles.checkout} onClick={onToCart}>
              Перейти к корзине
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
