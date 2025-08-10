import { createContext, useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

export const CartContext = createContext({
  items: [],
  addItems: (...items) => {},
  removeItems: (...items) => {},
  clearCart: () => {},
});

const storageKey = "cart";

const loadCart = () => JSON.parse(localStorage.getItem(storageKey) ?? "[]");

export const CartContextProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart());

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const addItems = useCallback(
    (...newItems) => {
      const result = [...items];
      for (const newItem of newItems) {
        let item = result.find((item) => item.id === newItem.id);
        if (!item) {
          item = { ...newItem, count: 0 };
          result.push(item);
        }

        item.count++;
      }
      setItems(result);
    },
    [items]
  );

  const removeItems = useCallback(
    (...newItems) => {
      const result = [...items];
      for (const newItem of newItems) {
        let item = result.find((item) => item.id === newItem.id);
        if (item) {
          item.count--;
          if (item.count <= 0) {
            const index = result.indexOf(item);
            result.splice(index, 1);
          }
        }
      }
      setItems(result);
    },
    [items]
  );

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext value={{ items, addItems, removeItems, clearCart }}>
      {children}
    </CartContext>
  );
};
