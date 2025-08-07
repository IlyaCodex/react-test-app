import { useState, useEffect, useContext, useMemo } from "react";
import modalWindowData from "../data/modalWindow";
import { ProductsContext } from "../context/ProductsContext";
import { CartContext } from "../context/CartContext";
import styles from "./ModalWindow.module.css";
import { api } from "../api";

const ModalWindow = ({ product, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const imagesPerPage = 4;
  const { addItems: addToCart } = useContext(CartContext);

  const [sliderImages, setSliderImages] = useState([]);

  useEffect(() => {
    Promise.all(
      product.images.map((imageId) =>
        api.getItemImage(imageId).then((res) => res.data)
      )
    ).then((images) =>
      setSliderImages(images.sort((a, b) => a.position - b.position))
    );
  }, [product.images]);

  useEffect(() => {
    let tempIndex = currentIndex;
    if (tempIndex >= sliderImages.length) {
      tempIndex = sliderImages.length - 1;
    }
    setCurrentPage(Math.floor(tempIndex / imagesPerPage));
  }, [currentIndex, sliderImages]);

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return sliderImages.length - 1;
      }
      return prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (prev >= sliderImages.length - 1) {
        return 0;
      }
      return prev + 1;
    });
  };

  const handleAddToCart = () => {
    addToCart({ ...product });
  };

  if (!product) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose}>
          ×
        </button>
        <div className={styles.modalImageColumn}>
          {sliderImages.length && (
            <img
              src={sliderImages[currentIndex].data}
              alt={"Главное изображение"}
              className={styles.modalProductImage}
            />
          )}

          <div className={styles.sliderContainer}>
            <button className={styles.sliderPrevBtn} onClick={handlePrev}>
              ←
            </button>
            <div className={styles.slider}>
              <div
                className={styles.sliderTrack}
                style={{
                  transform: `translateX(-${currentPage * 360}px)`,
                  transition: "transform 0.5s ease",
                }}
              >
                {sliderImages.map((item, index) => (
                  <img
                    key={item.id}
                    src={item.data}
                    alt={item.id}
                    className={`${styles.sliderImage} ${
                      index === currentIndex ? styles.active : ""
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            </div>
            <button className={styles.sliderNextBtn} onClick={handleNext}>
              →
            </button>
          </div>
        </div>
        <div className={styles.modalDetailsColumn}>
          <h4 className={styles.productName}>{product.name}</h4>
          <p>
            <span className={styles.detailValue}>{product.description}</span>
          </p>
          <div className={styles.modalDetails}>
            <p>
              <span className={styles.detailLabel}>Артикул:</span>
              <span className={styles.detailValue}>{product.article}</span>
            </p>
            <p>
              <span className={styles.detailLabel}>Производитель:</span>
              <span className={styles.detailValue}>{product.manufacturer}</span>
            </p>
            <p>
              <span className={styles.detailLabel}>Количество:</span>
              <span className={styles.detailValue}>{product.amount} шт.</span>
            </p>
            <p>
              <span className={styles.detailLabel}>В наличии:</span>
              <span className={styles.detailValue}>
                {product.in_stock ? "Да" : "Нет"}
              </span>
            </p>
            <p>
              <span className={styles.detailLabel}>По акции:</span>
              <span className={styles.detailValue}>
                {product.has_promo ? "Да" : "Нет"}
                {}
              </span>
            </p>
            {product.attributes.map((attr) => (
              <p key={attr.name}>
                <span className={styles.detailLabel}>{attr.name}:</span>
                <span className={styles.detailValue}>{attr.value}</span>
              </p>
            ))}
          </div>
          <p className={styles.productPrice}>
            {product.price?.toLocaleString("ru-RU")} ₽
          </p>
          <div className={styles.buttonGroup}>
            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={!product.price}
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
