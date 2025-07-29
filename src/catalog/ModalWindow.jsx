import { useState, useEffect, useContext } from 'react';
import modalWindowData from '../data/modalWindow';
import { ProductsContext } from '../context/ProductsContext';
import { CartContext } from '../context/CartContext';
import styles from './ModalWindow.module.css';

const ModalWindow = ({ productId, onClose }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const cardData = useContext(ProductsContext).data;
  const { addItems: addToCart } = useContext(CartContext);

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

  
  const sliderImages = cardData.map(item => ({
    id: item.id,
    image: item.image,
    name: item.name,
  })).filter(item => item.image);


  const extendedSliderImages = [...sliderImages, ...sliderImages, ...sliderImages];
  

  const handlePrev = () => {
    setIsTransitionEnabled(true);
    setCurrentIndex(prev => {
      if (prev <= 0) {
        return extendedSliderImages.length - 3;
      }
      return prev - 1;
    });
  };

  const handleNext = () => {
    setIsTransitionEnabled(true);
    setCurrentIndex(prev => {
      if (prev >= extendedSliderImages.length - 3) {
        return 0;
      }
      return prev + 1;
    });
  };

  if (!selectedVariant) {
    return null;
  }

  const handleAddToCart = () => {
    if (addToCart && selectedVariant) {
      addToCart(selectedVariant.id);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose}>
          ×
        </button>
        <div className={styles.modalImageColumn}>
          {selectedVariant.image && (
            <img src={selectedVariant.image} alt={selectedVariant.name} className={styles.modalProductImage} />
          )}
          <div className={styles.sliderContainer}>
            <button className={styles.sliderPrevBtn} onClick={handlePrev}>←</button>
            <div className={styles.slider}>
              <div
                className={styles.sliderTrack}
                style={{ 
                  transform: `translateX(-${currentIndex * (80 + 10)}px)`,
                  transition: isTransitionEnabled ? 'transform 0.5s ease' : 'none'
                }}
              >
                {extendedSliderImages.map((item, index) => (
                  <img
                    key={`${item.id}-${index}`}
                    src={item.image}
                    alt={item.name}
                    className={styles.sliderImage}
                    onClick={() => {
                      const originalIndex = index % sliderImages.length;
                      setSelectedVariant({
                        ...selectedVariant,
                        id: sliderImages[originalIndex].id,
                        image: sliderImages[originalIndex].image,
                        name: sliderImages[originalIndex].name,
                      });
                    }}
                  />
                ))}
              </div>
            </div>
            <button className={styles.sliderNextBtn} onClick={handleNext}>→</button>
          </div>
        </div>
        <div className={styles.modalDetailsColumn}>
          <h3 className={styles.brandName}>{selectedVariant.brand}</h3>
          <h4 className={styles.productName}>{selectedVariant.name}</h4>
          <p><span className={styles.detailValue}>{selectedVariant.description}</span></p>
          <div className={styles.modalDetails}>
            <p><span className={styles.detailLabel}>Артикул:</span><span className={styles.detailValue}>{selectedVariant.article}</span></p>
            <p><span className={styles.detailLabel}>Цвет:</span><span className={styles.detailValue}>{selectedVariant.color}</span></p>
            <p><span className={styles.detailLabel}>Материал:</span><span className={styles.detailValue}>{selectedVariant.material}</span></p>
            <p><span className={styles.detailLabel}>Количество:</span><span className={styles.detailValue}>{selectedVariant.quantity} шт.</span></p>
            <p><span className={styles.detailLabel}>Комплектация:</span><span className={styles.detailValue}>{selectedVariant.complectation}</span></p>
            <p><span className={styles.detailLabel}>Гарантийный срок:</span><span className={styles.detailValue}>{selectedVariant.WarrantyPeriod}</span></p>
            <p><span className={styles.detailLabel}>Страна производитель:</span><span className={styles.detailValue}>{selectedVariant.country}</span></p>
            
          </div>
          <p className={styles.productPrice}>{selectedVariant.price?.toLocaleString('ru-RU')} ₽</p>
          <div className={styles.buttonGroup}>
            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={!selectedVariant.price}
            >
              В корзину
            </button>
            <button className={styles.buyNowBtn}>Купить сейчас</button>
          </div>
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