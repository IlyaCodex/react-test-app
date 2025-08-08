import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ModalWindow from "./ModalWindow";
import styles from "./CatalogPage.module.css";
import { api } from "../api";
import { byPosition, isNull, nonNull } from "../components/admin/Utils";

const CatalogPage = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    api.getItems().then((res) => setData(Array.isArray(res.data) ? res.data : []));
  }, []);

  const [searchParams] = useSearchParams();
  const initialMainCategory = searchParams.get("maincategory");
  const initialSubcategory = searchParams.get("subcategory");
  const initialSubSubCategories = searchParams.get("subSubCategories");

  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);

  const [filteredProducts, setFilteredProducts] = useState(data);

  const [activeMainCategory, setActiveMainCategory] = useState(undefined);
  const [activeSubCategory, setActiveSubCategory] = useState(undefined);
  const [activeSubSubCategory, setActiveSubSubCategory] = useState(undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (nonNull(initialMainCategory)) {
      setActiveMainCategory(
        categories.find(
          (category) => category?.id?.toString() === initialMainCategory
        ) || undefined
      );
    }
    if (nonNull(initialSubcategory)) {
      setActiveSubCategory(
        categories.find(
          (category) => category?.id?.toString() === initialSubcategory
        ) || undefined
      );
    }
    if (nonNull(initialSubSubCategories)) {
      setActiveSubSubCategory(
        categories.find(
          (category) => category?.id?.toString() === initialSubSubCategories
        ) || undefined
      );
    }
  }, [initialMainCategory, initialSubcategory, initialSubSubCategories, categories]);

  useEffect(() => {
    Promise.all([
      api.getCategoriesByLevel(1),
      api.getCategoriesByLevel(2),
      api.getCategoriesByLevel(3),
    ]).then((arr) =>
      setCategories(Array.isArray(arr) ? arr.flatMap((res) => res?.data || []) : [])
    );
  }, []);

  useEffect(() => {
    const availableMainCategories = categories
      ?.filter((cat) => cat?.level === 1)
      ?.sort(byPosition) || [];
    const activeMainCategories = isNull(activeMainCategory)
      ? availableMainCategories
      : categories?.filter((cat) => cat?.id === activeMainCategory?.id) || [];

    let tempIds = [];
    for (const cat of activeMainCategories || []) {
      tempIds = [...tempIds, ...(cat?.children || [])];
    }
    const availableSubCategories = categories
      ?.filter((cat) => tempIds.includes(cat?.id))
      ?.sort(byPosition) || [];
    const activeSubCategories = isNull(activeSubCategory)
      ? availableSubCategories
      : availableSubCategories?.filter((cat) => cat?.id === activeSubCategory?.id) ||
        [];

    tempIds = [];
    for (const cat of activeSubCategories || []) {
      tempIds = [...tempIds, ...(cat?.children || [])];
    }
    const availableSubSubCategories = categories
      ?.filter((cat) => tempIds.includes(cat?.id))
      ?.sort(byPosition) || [];
    const activeSubSubCategories = isNull(activeSubSubCategory)
      ? availableSubSubCategories
      : availableSubSubCategories?.filter(
          (cat) => cat?.id === activeSubSubCategory?.id
        ) || [];

    setMainCategories(availableMainCategories);
    setSubCategories(availableSubCategories);
    setSubSubCategories(availableSubSubCategories);

    const productGroups = {};
    (availableSubSubCategories || []).forEach((subSubCat) => {
      const products = (data || [])
        ?.filter((product) => (subSubCat?.items || []).includes(product?.id))
        ?.sort(byPosition) || [];
      if (products.length > 0 || !isNull(activeSubSubCategory)) {
        productGroups[subSubCat?.id] = { name: subSubCat?.name, products };
      }
    });

    let sortedProducts = [];
    if (!isNull(activeSubSubCategory) && activeSubSubCategory?.id in productGroups) {
      sortedProducts.push(...productGroups[activeSubSubCategory.id].products);
      delete productGroups[activeSubSubCategory.id];
    }
    Object.values(productGroups).forEach((group) => {
      sortedProducts.push(...group.products);
    });

    setFilteredProducts(sortedProducts.length > 0 ? sortedProducts : data || []);
  }, [data, activeMainCategory, activeSubCategory, activeSubSubCategory]);

  const handleMainCategoryClick = (category) => {
    if (activeMainCategory === category) {
      return;
    }
    setActiveMainCategory(category);
    setActiveSubCategory(undefined);
    setActiveSubSubCategory(undefined);
  };

  const handleSubCategoryClick = (category) => {
    if (activeSubCategory === category) {
      return;
    }
    setActiveSubCategory(category);
    setActiveSubSubCategory(undefined);
  };

  const handleSubSubCategoryClick = (category) => {
    if (activeSubSubCategory === category) {
      return;
    }
    setActiveSubSubCategory(category);
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <section className={styles.catalog}>
      <div className={styles.container}>
        <div className={styles.catalogTop}>
          <div className={styles.catalogCategories}>
            {(mainCategories || []).map((category) => (
              <button
                key={category?.id}
                className={`${styles.catalogCategoriesLink} ${
                  activeMainCategory?.id === category?.id ? styles.active : ""
                }`}
                onClick={() => handleMainCategoryClick(category)}
                disabled={!category?.id}
              >
                {category?.name}
              </button>
            ))}
          </div>
        </div>

        <ul className={styles.catalogSubcategories}>
          <li>
            <button
              className={`${styles.catalogSubcategory} ${
                activeSubCategory === undefined ? styles.active : ""
              }`}
              onClick={() => handleSubCategoryClick(undefined)}
              type="button"
              disabled={activeSubCategory === undefined}
            >
              Все
            </button>
          </li>
          {(subCategories || []).map((category) => (
            <li key={category?.id}>
              <button
                className={`${styles.catalogSubcategory} ${
                  activeSubCategory?.id === category?.id ? styles.active : ""
                }`}
                onClick={() => handleSubCategoryClick(category)}
                type="button"
                disabled={!category?.id || activeSubCategory?.id === category?.id}
              >
                {category?.name}
              </button>
            </li>
          ))}
        </ul>

        <ul className={styles.catalogSubSubcategories}>
          <li className={styles.catalogSubSubcategoriesItem}>
            <button
              className={`${styles.catalogSubSubcategory} ${
                activeSubSubCategory === undefined ? styles.active : ""
              }`}
              onClick={() => handleSubSubCategoryClick(undefined)}
              type="button"
              disabled={activeSubSubCategory === undefined}
            >
              Все
            </button>
          </li>
          {(subSubCategories || []).map((category) => (
            <li
              className={styles.catalogSubSubcategoriesItem}
              key={category?.id}
            >
              <button
                className={`${styles.catalogSubSubcategory} ${
                  activeSubSubCategory?.id === category?.id ? styles.active : ""
                }`}
                onClick={() => handleSubSubCategoryClick(category)}
                type="button"
                disabled={!category?.id || activeSubSubCategory?.id === category?.id}
              >
                {category?.name}
              </button>
            </li>
          ))}
        </ul>

        {!isNull(activeMainCategory) && (
          <div>
            {activeSubCategory?.name && (
              <h3 className={styles.subCategoriesName}>{activeSubCategory.name}</h3>
            )}
            {(subSubCategories || []).map((subSubCat, index) => {
              const products = (data || [])
                ?.filter((product) => (subSubCat?.items || []).includes(product?.id))
                ?.sort(byPosition) || [];
              const isSelected = activeSubSubCategory?.id === subSubCat?.id;

              return (
                <div key={subSubCat?.id} className={styles.subSubCategoryGroup}>
                  {isSelected && subSubCat?.name && (
                    <h3 className={styles.subSubCategoriesName}>{subSubCat.name}</h3>
                  )}
                  <ul className={styles.catalogList}>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <ProductCard
                          key={product?.id}
                          product={product}
                          onCardClick={handleOpenModal}
                        />
                      ))
                    ) : (
                      <div className={styles.noProducts}></div>
                    )}
                  </ul>
                  {!isSelected && subSubCat?.name && (
                    <h3 className={styles.subSubCategoriesName}>{subSubCat.name}</h3>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.requestBlock}>
          <img
            className={`${styles.requestImg} ${styles.requestImgLeft}`}
            src="../images/8276b9d42395e1f1093dbfe7cdcc029e687c36a5.png"
            alt=""
          />
          <img
            className={`${styles.requestImg} ${styles.requestImgRight}`}
            src="../images/images_right.png"
            alt=""
          />
          <div className={styles.requestText}>
            <h2 className={styles.requestTitle}>
              Не нашли необходимое <br /> или не можете определиться?
            </h2>
            <p className={styles.requestDescription}>
              Оставьте заявку, наши специалисты помогут <br /> с выбором и
              подберут решение
            </p>
          </div>
          <div className={styles.requestForm}>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Ваше имя"
            />
            <input
              type="tel"
              className={styles.formInput}
              placeholder="+7(999)222 22-22"
            />
            <button className={styles.formButton}>
              Отправить заявку
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
      </div>

      {isModalOpen && (
        <ModalWindow product={selectedProduct} onClose={handleCloseModal} />
      )}
    </section>
  );
};

export default CatalogPage;
