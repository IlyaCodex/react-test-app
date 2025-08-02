import { createContext, useEffect, useState } from "react";
import { api } from "../api";

export const ProductsContext = createContext({ data: [] });

export const ProductsContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
//   useEffect(() => api.getItems().then((res) => setData(res.data)), []);
  return <ProductsContext value={data}>{children}</ProductsContext>;
};
