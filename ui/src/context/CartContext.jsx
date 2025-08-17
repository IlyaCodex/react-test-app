import { createContext, useCallback, useEffect, useState } from "react";
import CartSidebar from "../components/CartSidebar";

export const CartContext = createContext({
  items: [],
  addItems: (...items) => {},
  removeItems: (...items) => {},
  clearCart: () => {},
  openCart: () => {},
  closeCart: () => {},
});

const storageKey = "cart";

const loadCart = () => JSON.parse(localStorage.getItem(storageKey) ?? "[]");

export const CartContextProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart());
  const [isOpen, setIsOpen] = useState(false);

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
  const closeCart = useCallback(() => setIsOpen(false), []);
  const openCart = useCallback(() => setIsOpen(true), []);

  return (
    <CartContext
      value={{ items, addItems, removeItems, clearCart, openCart, closeCart }}
    >
      <CartSidebar isOpen={isOpen} onClose={closeCart} />
      {children}
    </CartContext>
  );
};
