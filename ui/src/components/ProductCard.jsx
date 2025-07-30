import React from 'react';

const ProductCard = ({ product, onCardClick }) => {
  return (
    <li className="card" onClick={() => onCardClick(product.id)}>
      <div className="card__head">
        <button className="card__favorite" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="41" viewBox="0 0 40 41" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M19.8353 9.01587C16.5308 5.15264 11.0204 4.11344 6.88008 7.651C2.73979 11.1886 2.15689 17.1032 5.40829 21.2871C8.1116 24.7657 16.2928 32.1023 18.9741 34.4769C19.2741 34.7426 19.4241 34.8754 19.5991 34.9276C19.7518 34.9732 19.9188 34.9732 20.0716 34.9276C20.2465 34.8754 20.3965 34.7426 20.6965 34.4769C23.3778 32.1023 31.559 24.7657 34.2623 21.2871C37.5137 17.1032 37.002 11.1513 32.7905 7.651C28.5791 4.15066 23.1398 5.15264 19.8353 9.01587Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <img src={product.image} alt={product.name} />
      </div>
      <button className="card__add" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M26.6876 14.7573V9.88316C26.6876 6.29393 23.778 3.38428 20.1887 3.38428C16.5995 3.38428 13.6898 6.29393 13.6898 9.88316V14.7573M6.52807 16.9539L5.55324 27.3521C5.27606 30.3086 5.13748 31.7869 5.62805 32.9286C6.059 33.9317 6.81421 34.761 7.77263 35.2837C8.86364 35.8787 10.3484 35.8787 13.3178 35.8787H27.0596C30.0291 35.8787 31.5138 35.8787 32.6048 35.2837C33.5632 34.761 34.3184 33.9317 34.7494 32.9286C35.24 31.7869 35.1014 30.3086 34.8242 27.3521L33.8494 16.9539C33.6153 14.4573 33.4983 13.209 32.9368 12.2653C32.4424 11.4341 31.7118 10.7688 30.8381 10.3541C29.846 9.88316 28.5923 9.88316 26.0848 9.88316L14.2927 9.88316C11.7852 9.88316 10.5314 9.88316 9.53935 10.3541C8.66565 10.7688 7.93508 11.4341 7.44061 12.2653C6.87915 13.209 6.76212 14.4573 6.52807 16.9539Z" stroke="#F0F0F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <span className="card__price">{product.price.toLocaleString('ru-RU')} ₽</span>
      <p className="card__name">{product.name}</p>
    </li>
  );
};

export default ProductCard;



// import React from 'react';

// const ProductCard = ({ product }) => {
//   return (
//     <li className="card">
//       <div className="card__head">
//         <button className="card__favorite" type="button">
//           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="41" viewBox="0 0 40 41" fill="none">
//             <path fillRule="evenodd" clipRule="evenodd" d="M19.8353 9.01587C16.5308 5.15264 11.0204 4.11344 6.88008 7.651C2.73979 11.1886 2.15689 17.1032 5.40829 21.2871C8.1116 24.7657 16.2928 32.1023 18.9741 34.4769C19.2741 34.7426 19.4241 34.8754 19.5991 34.9276C19.7518 34.9732 19.9188 34.9732 20.0716 34.9276C20.2465 34.8754 20.3965 34.7426 20.6965 34.4769C23.3778 32.1023 31.559 24.7657 34.2623 21.2871C37.5137 17.1032 37.002 11.1513 32.7905 7.651C28.5791 4.15066 23.1398 5.15264 19.8353 9.01587Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//           </svg>
//           <span className="sr-only">Добавить в избранное</span>
//         </button>
//         <img src={product.image} alt={product.name} />
//       </div>
//       <button className="card__add" type="button">
//         <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
//           <path d="M26.6876 14.7573V9.88316C26.6876 6.29393 23.778 3.38428 20.1887 3.38428C16.5995 3.38428 13.6898 6.29393 13.6898 9.88316V14.7573M6.52807 16.9539L5.55324 27.3521C5.27606 30.3086 5.13748 31.7869 5.62805 32.9286C6.059 33.9317 6.81421 34.761 7.77263 35.2837C8.86364 35.8787 10.3484 35.8787 13.3178 35.8787H27.0596C30.0291 35.8787 31.5138 35.8787 32.6048 35.2837C33.5632 34.761 34.3184 33.9317 34.7494 32.9286C35.24 31.7869 35.1014 30.3086 34.8242 27.3521L33.8494 16.9539C33.6153 14.4573 33.4983 13.209 32.9368 12.2653C32.4424 11.4341 31.7118 10.7688 30.8381 10.3541C29.846 9.88316 28.5923 9.88316 26.0848 9.88316L14.2927 9.88316C11.7852 9.88316 10.5314 9.88316 9.53935 10.3541C8.66565 10.7688 7.93508 11.4341 7.44061 12.2653C6.87915 13.209 6.76212 14.4573 6.52807 16.9539Z" stroke="#F0F0F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//         </svg>
//       </button>
//       <span className="card__price">{product.price.toLocaleString('ru-RU')} ₽</span>
//       <p className="card__name">{product.name}</p>
//     </li>
//   );
// };

// export default ProductCard;