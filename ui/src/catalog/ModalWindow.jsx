import { useState, useEffect, useContext } from "react";
import { ProductsContext } from "../context/ProductsContext";
import { CartContext } from "../context/CartContext";
import styles from "./ModalWindow.module.css";
import { api } from "../api";
import { isNull } from "../components/admin/Utils";

const ModalWindow = ({ product, onClose, onOpenCart }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [copied, setCopied] = useState(false);
  const imagesPerPage = 4;

  const { items: cartItems, addItems, removeItems } = useContext(CartContext);

  const [sliderImages, setSliderImages] = useState([]);

  const cartItem = cartItems.find((item) => item.id === product?.id);
  const itemCount = cartItem ? cartItem.count : 0;

  useEffect(() => {
    Promise.all(
      product?.images.map((imageId) =>
        api.getItemImage(imageId).then((res) => res.data)
      ) ?? []
    ).then((images) =>
      setSliderImages(images.sort((a, b) => a.position - b.position))
    );
  }, [product?.images]);

  useEffect(() => {
    let tempIndex = currentIndex;
    if (tempIndex >= sliderImages.length) {
      tempIndex = sliderImages.length - 1;
    }
    setCurrentPage(Math.floor(tempIndex / imagesPerPage));
  }, [currentIndex, sliderImages]);

  const copyArticleToClipboard = () => {
    navigator.clipboard
      .writeText(product.article)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Не удалось скопировать артикул:", err);
      });
  };

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
    addItems({ ...product, count: 1 });
  };

  const handleBuyNow = () => {
    addItems({ ...product, count: 1 });
    onClose();
    onOpenCart();
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

        <div className={styles.mobileBlock}>
          <h4 className={styles.mobileProductName}>{product.name}</h4>
          <p>
            <span className={styles.mobileDetailValue}>
              {product.description}
            </span>
          </p>
        </div>

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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ transform: "rotate(180deg)" }}
              >
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className={styles.modalDetailsColumn}>
          <div className={styles.desktopBlock}>
            <h4 className={styles.productName}>{product.name}</h4>
            <p>
              <span className={styles.detailValue}>{product.description}</span>
            </p>
          </div>

          <div className={styles.modalDetails}>
            <p>
              <span className={styles.detailLabel}>Артикул:</span>
              <div className={styles.articteCopyBlock}>
                <button
                  className={styles.copyButton}
                  onClick={copyArticleToClipboard}
                  title="Скопировать артикул"
                >
                  {copied ? "Скопировано" : "Копировать"}
                </button>
                <span className={styles.detailValue}>{product.article}</span>
              </div>
            </p>
            <p>
              <span className={styles.detailLabel}>Производитель:</span>
              <span className={styles.detailValue}>{product.manufacturer}</span>
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
            {itemCount > 0 ? (
              <div className={styles.counter}>
                <button onClick={() => removeItems(product)}>-</button>
                <div>{itemCount}</div>
                <button onClick={() => addItems(product)}>+</button>
              </div>
            ) : (
              <button
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                disabled={isNull(product.price)}
              >
                В корзину
              </button>
            )}
            <button
              className={styles.buyNowBtn}
              onClick={handleBuyNow}
              disabled={isNull(product.price)}
            >
              Купить сейчас
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalWindow;
