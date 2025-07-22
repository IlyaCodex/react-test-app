import React, { useState, useEffect } from 'react';
import cardData from '../data/cardData';
import modalWindowData from '../data/modalWindow';

const ModalWindow = ({ productId, onClose, addToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const variant = modalWindowData.find(item => item.id === productId);
    const cardItem = cardData.find(item => item.id === productId);

    if (cardItem) {
      setSelectedVariant({
        ...variant, 
        id: cardItem.id,
        name: cardItem.name,
        image: cardItem.image,
        price: cardItem.price, 
        description: variant?.description || `Стандартная модель для ${cardItem.name.toLowerCase().includes('зуб') ? 'стоматологических процедур' : 'обучения'}`,
      });
    } else {
      setSelectedVariant(modalWindowData.find(item => item.id === productId) || modalWindowData[0] || {});
    }
  }, [productId]);

  if (!selectedVariant) {
    return null;
  }

  const handleAddToCart = () => {
    if (addToCart && selectedVariant) {
      addToCart({
        id: selectedVariant.id,
        name: selectedVariant.name,
        price: selectedVariant.price,
        image: selectedVariant.image,
        quantity: 1,
      });
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>
        <div className="modal-image-column">
          {selectedVariant.image && (
            <img src={selectedVariant.image} alt={selectedVariant.name} className="modal-product-image" />
          )}
        </div>
        <div className="modal-details-column">
          <h3>{selectedVariant.name}</h3>
          <h4>Япония традиционое тесто, 350/600 гр</h4>
          <div className="modal-details">
            <p><strong>Название:</strong> {selectedVariant.name}</p>
            <p><strong>Цвет:</strong> {selectedVariant.color}</p>
            <p><strong>Материал:</strong> {selectedVariant.material}</p>
            <p><strong>Количество:</strong> {selectedVariant.quantity} шт.</p>
            <p><strong>Размер:</strong> {selectedVariant.size}</p>
            <p><strong>Вес:</strong> {selectedVariant.weight}</p>
            <p><strong>Описание:</strong> {selectedVariant.description}</p>
          </div>
          <button
            className="modal-add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={!selectedVariant.price}
          >
            Добавить в корзину за {selectedVariant.price ? selectedVariant.price.toLocaleString('ru-RU') : 'N/A'} ₽
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalWindow;


/////


// const ModalWindow = ({ productId, onClose, addToCart }) => {
//   const [selectedVariant, setSelectedVariant] = useState(null);

//   useEffect(() => {
//     const variant = modalWindowData.find(item => item.id === productId);
//     const cardItem = cardData.find(item => item.id === productId);
//     setSelectedVariant(variant || modalWindowData[0] || {});
//     if (variant && !variant.image && cardItem) {
//       setSelectedVariant(prev => ({ ...prev, image: cardItem.image, price: cardItem.price }));
//     }
//   }, [productId]);

//   if (!selectedVariant) {
//     return null;
//   }

//   const handleAddToCart = () => {
//     if (addToCart && selectedVariant) {
//       addToCart({
//         id: selectedVariant.id,
//         name: selectedVariant.name,
//         price: selectedVariant.price,
//         image: selectedVariant.image,
//         quantity: 1,
//       });
//       onClose();
//     }
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content" onClick={e => e.stopPropagation()}>
//         <button className="modal-close-btn" onClick={onClose}>
//           ×
//         </button>
//         <div className="modal-image-column">
//           {selectedVariant.image && (
//             <img src={selectedVariant.image} alt={selectedVariant.name} className="modal-product-image" />
//           )}
//         </div>
//         <div className="modal-details-column">
//           <h3>Щипцы для удаления зубов</h3>
//           <h4>Япония традиционое тесто, 350/600 гр</h4>
//           <div className="modal-details">
//             <p><strong>Название:</strong> {selectedVariant.name}</p>
//             <p><strong>Цвет:</strong> {selectedVariant.color}</p>
//             <p><strong>Материал:</strong> {selectedVariant.material}</p>
//             <p><strong>Количество:</strong> {selectedVariant.quantity} шт.</p>
//             <p><strong>Размер:</strong> {selectedVariant.size}</p>
//             <p><strong>Вес:</strong> {selectedVariant.weight}</p>
//             <p><strong>Описание:</strong> {selectedVariant.description}</p>
//           </div>
//           <button
//             className="modal-add-to-cart-btn"
//             onClick={handleAddToCart}
//             disabled={!selectedVariant.price}
//           >
//             Добавить в корзину за {selectedVariant.price ? selectedVariant.price.toLocaleString('ru-RU') : 'N/A'} ₽
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ModalWindow;