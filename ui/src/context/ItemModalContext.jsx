import React, { createContext, useContext, useState } from "react";
import ModalWindow from "./../catalog/ModalWindow";
import { CartContext } from "./CartContext";

const ItemModalContext = createContext({ onOpenItemModal: () => {} });

export const useItemModal = () => useContext(ItemModalContext);

export const ItemModalProvider = ({ children }) => {
  const [item, setItem] = useState(undefined);
  const onCloseModal = () => setItem(undefined);
  const { openCart } = useContext(CartContext);
  return (
    <ItemModalContext.Provider value={{ onOpenItemModal: setItem }}>
      {children}
      <ModalWindow
        product={item}
        onClose={onCloseModal}
        onOpenCart={openCart}
      />
    </ItemModalContext.Provider>
  );
};
