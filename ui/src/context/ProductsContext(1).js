// import React, { createContext, useState, useEffect } from 'react';
// import cardData from '../data/cardData';

// const ProductsContext = createContext();

// export function ProductsProvider({ children }) {
//   const [data, setData] = useState(cardData);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setData(cardData);
//     };
//     fetchProducts();
//   }, []);

//   const updateProducts = (newData) => {
//     setData(newData);
//   };

//   return (
//     <ProductsContext.Provider value={{ data, updateProducts }}>
//       {children}
//     </ProductsContext.Provider>
//   );
// }

// export default ProductsContext;