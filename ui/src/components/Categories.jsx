import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CategoriesSection.module.css";
import { api } from "../api";
import { byPosition, nonNull } from "./admin/Utils";

const CategoriesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    api
      .getCategoriesByLevel(1, true)
      .then((res) => setMainCategories(res.data ?? []));
    api
      .getCategoriesByLevel(2, false)
      .then((res) => setSubCategories(res.data ?? []));
  }, []);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleSubcategoryClick = (mainCategory, subcategory) => {
    navigate(
      `/catalog/?maincategory=${mainCategory.id}&subcategory=${subcategory.id}`
    );
  };

  const ArrowIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="16"
      viewBox="0 0 9 16"
      fill="none"
    >
      <path
        d="M8.70711 8.70711C9.09763 8.31658 9.09763 7.68342 8.70711 7.29289L2.34315 0.928932C1.95262 0.538408 1.31946 0.538408 0.928932 0.928932C0.538408 1.31946 0.538408 1.95262 0.928932 2.34315L6.58579 8L0.928932 13.6569C0.538408 14.0474 0.538408 14.6805 0.928932 15.0711C1.31946 15.4616 1.95262 15.4616 2.34315 15.0711L8.70711 8.70711ZM7 8V9H8V8V7H7V8Z"
        fill="#F0F0F0"
      />
    </svg>
  );

  return (
    <section className={styles.categories}>
      <div className={styles.container}>
        <h2 className={styles.titleSection}>Категории</h2>

        <ul className={styles.categoriesList}>
          {mainCategories.sort(byPosition).map((mainCategory, index) => (
            <li
              key={mainCategory.id}
              className={`${styles.categoriesItem} ${
                selectedCategory === mainCategory.id ? styles.active : ""
              }`}
              style={{ backgroundColor: mainCategory.color }}
              tabIndex={0}
              onClick={() => handleCategoryClick(mainCategory.id)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleCategoryClick(mainCategory.id)
              }
            >
              <div className={styles.categoriesHead}>
                {mainCategory.name}
                <div
                  className={`${styles.categoriesBtn} ${
                    selectedCategory === mainCategory.id ? styles.rotated : ""
                  }`}
                >
                  <ArrowIcon />
                </div>
              </div>
              <p className={styles.categoriesText}>
                {mainCategory.description}
              </p>

              {selectedCategory === mainCategory.id && (
                <div className={styles.subcategories}>
                  <ul className={styles.subcategoriesList}>
                    {mainCategory.children
                      .map((sub) => subCategories.find((s) => s.id === sub))
                      .filter(nonNull)
                      .sort(byPosition)
                      .map((subCategory, index) => {
                        return (
                          <li
                            key={index}
                            className={styles.subcategoriesItem}
                            onClick={() =>
                              handleSubcategoryClick(mainCategory, subCategory)
                            }
                          >
                            {subCategory.name}
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.discountBlock}>
          <img
            className={`${styles.icon} ${styles.iconTopLeft}`}
            src="../images/cb5bce878efd52bc1a0cfc888087321a0b2ad59a.png"
            alt=""
          />
          <img
            className={`${styles.icon} ${styles.iconTopRight}`}
            src="../images/bd81022cea39a00ba8b909d677a2cc0553f649cf.png"
            alt=""
          />
          <img
            className={`${styles.icon} ${styles.iconBottomLeft}`}
            src="../images/b6b30e89dfc43f6f7151cbd795de0059dc6f652e.png"
            alt=""
          />
          <img
            className={`${styles.icon} ${styles.iconBottomRight}`}
            src="../images/6106f2b1919bf5d3ab46df4dc04cec56746d524c.png"
            alt=""
          />
          <div className={styles.discountContent}>
            <h2 className={styles.discountTitle}>Скидка 10% на первый заказ</h2>
            <p className={styles.discountText}>
              Просто, быстро и без лишних условий
            </p>
            <button
              className={styles.discountBtn}
              onClick={() => navigate("/catalog")}
            >
              Перейти в каталог
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
          <div className={styles.discountImage}>
            <img
              src="../images/2025-08-06_17-36-34.png"
              alt="Discount Offer"
              className={styles.discountImg}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
