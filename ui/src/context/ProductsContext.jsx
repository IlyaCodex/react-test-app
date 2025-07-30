import { createContext } from "react";
import cardData from "../data/cardData";

const value = {data: cardData};

export const ProductsContext = createContext(value);

export const ProductsContextProvider = ({children}) => (
    <ProductsContext value={value}>
        {children}
    </ProductsContext>
);