import { useContext, useEffect, useState } from "react";
import styles from "./FavoritesSidebar.module.css";
import { CartContext } from "../context/CartContext";
import { nonNull } from "./admin/Utils";
import { api } from "../api";
import { useFavorites } from "../context/FavoriteContext";
import { HeartCrack } from "lucide-react";

const chooseImage = (item) => item.images?.[0];

export const FavoritesSidebar = ({ isOpen, onClose, onToCart }) => {
  const { favorites: items = [], toggleFavorite } = useFavorites() || {};
  const { addItems, removeItems } = useContext(CartContext);
  const [images, setImages] = useState([]);
  const [itemCounts, setItemCounts] = useState({});
  const [addedToCart, setAddedToCart] = useState({}); 

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
      initialCounts[item.id] = item.count || 1; 
    });
    setItemCounts(initialCounts);
  }, [items]);

  const handleAddToCart = (item) => {
    const count = itemCounts[item.id] || 1;
    addItems({ ...item, count });
    setAddedToCart((prev) => ({ ...prev, [item.id]: true }));
  };

  const handleRemoveItem = (item) => {
    const count = itemCounts[item.id] || 1;
    if (count > 1) {
      setItemCounts((prev) => ({ ...prev, [item.id]: count - 1 }));
      removeItems(item);
    }
  };

  const handleIncreaseCount = (item) => {
    setItemCounts((prev) => ({ ...prev, [item.id]: (prev[item.id] || 1) + 1 }));
    addItems(item); // Add one more item
  };

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
        <div className={styles.header}>
          <div />
          <p>Избранное</p>
          <button onClick={onClose}>×</button>
        </div>
        <div className={styles.content}>
          <div className={styles.items}>
            {items.length === 0 ? (
              <div className={styles.empty}>Пусто</div>
            ) : (
              items.map((item, index) => (
                <div key={item.id} className={styles.item}>
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
                      onClick={() => toggleFavorite(item)}
                    >
                      <HeartCrack />
                    </button>
                    <div className={styles.Favoritecounter}>
                      <div className={styles.counter}>
                        <button
                          onClick={() => handleRemoveItem(item)}
                          disabled={itemCounts[item.id] <= 1}
                        >
                          -
                        </button>
                        <div>{itemCounts[item.id] || 1}</div>
                        <button onClick={() => handleIncreaseCount(item)}>
                          +
                        </button>
                      </div>
                      <button
                        className={`${styles.toCart} ${
                          addedToCart[item.id] ? styles.added : ""
                        }`}
                        onClick={() => handleAddToCart(item)}
                      >
                        {addedToCart[item.id] ? "В корзине" : "В корзину"}
                      </button>
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

// Код ильи рассомахина

// import { useContext, useEffect, useMemo, useState } from "react";
// import styles from "./FavoritesSidebar.module.css";
// import { CartContext } from "../context/CartContext";
// import CheckoutModal from "./CheckoutModal";
// import { nonNull } from "./admin/Utils";
// import { api } from "../api";
// import { useFavorites } from "../context/FavoriteContext";
// import { HeartCrack } from "lucide-react";

// const chooseImage = (item) => item.images?.[0];

// export const FavoritesSidebar = ({ isOpen, onClose, onToCart }) => {
//   const { favorites: items, toggleFavorite } = useFavorites();
//   const { addItems } = useContext(CartContext);
//   const [images, setImages] = useState([]);

//   useEffect(() => {
//     Promise.all(
//       items
//         .map(chooseImage)
//         .filter(nonNull)
//         .map((imageId) => api.getItemImage(imageId).then((res) => res.data))
//     ).then((arr) => setImages(arr));
//   }, [items]);

//   return (
//     <div
//       className={`${styles.cart} ${isOpen ? styles.open : ""}`}
//       onClick={onClose}
//     >
//       <div
//         className={styles.cart_dialog}
//         onClick={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//         }}
//       >
//         <div className={styles.header}>
//           <div />
//           <p>Избранное</p>
//           <button onClick={onClose}>×</button>
//         </div>
//         <div className={styles.content}>
//           <div className={styles.items}>
//             {items.length === 0 ? (
//               <div className={styles.empty}>Пусто</div>
//             ) : (
//               items.map((item, index) => (
//                 <div key={item.id} className={styles.item}>
//                   <div className={styles.description}>
//                     <img
//                       src={
//                         images.find((image) => image.id === chooseImage(item))
//                           ?.data
//                       }
//                       alt={item.name}
//                       className={styles.image}
//                     />

//                     <div className={styles.details}>
//                       <p className={styles.item_name}>{item.name}</p>
//                       <p className={styles.item_price}>
//                         {item.price?.toLocaleString("ru-RU")} ₽
//                       </p>
//                     </div>
//                   </div>
//                   <div className={styles.buttons}>
//                     <button
//                       className={styles.delete}
//                       onClick={() => toggleFavorite(item)}
//                     >
//                       <HeartCrack />
//                     </button>
//                     <button
//                       className={styles.toCart}
//                       onClick={() => addItems(item)}
//                     >
//                       В корзину
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//         <div className={styles.footer}>
//           <div></div>
//           <div className={styles.row}>
//             <button className={styles.checkout} onClick={onToCart}>
//               Перейти к корзине
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
