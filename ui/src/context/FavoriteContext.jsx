import React, { createContext, useCallback, useContext, useState } from "react";
import { useCookies } from "react-cookie";

const FavoriteContext = createContext();

export const useFavorites = () => useContext(FavoriteContext);

const cookieName = "favorites";

export const FavoriteProvider = ({ children }) => {
  const [{ favorites }, setFavorites] = useCookies([cookieName]);

  const isFavorite = (id) => (favorites ?? []).some((item) => item.id === id);

  const toggleFavorite = useCallback(
    (product) => {
      const isFav = isFavorite(product.id);
      if (isFav) {
        setFavorites(
          cookieName,
          (favorites ?? []).filter((item) => item.id !== product.id)
        );
      } else {
        setFavorites(cookieName, [...(favorites ?? []), product]);
      }
    },
    [favorites, setFavorites]
  );

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
