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
    api.getItems().then((res) => setData(res.data));
  }, []);

  const [searchParams] = useSearchParams();
  const initialMainCategory = searchParams.get("maincategory");
  const initialSubcategory = searchParams.get("subcategory");

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
          (category) => category.id.toString() === initialMainCategory
        ) || undefined
      );
    }
    if (nonNull(initialSubcategory)) {
      setActiveSubCategory(
        categories.find(
          (category) => category.id.toString() === initialSubcategory
        ) || undefined
      );
    }
  }, [initialMainCategory, initialSubcategory, categories]);

  useEffect(() => {
    Promise.all([
      api.getCategoriesByLevel(1),
      api.getCategoriesByLevel(2),
      api.getCategoriesByLevel(3),
    ]).then((arr) => setCategories(arr.flatMap((res) => res.data)));
  }, []);

  useEffect(() => {
    const availableMainCategories = categories.filter((cat) => cat.level === 1);
    const activeMainCategories = isNull(activeMainCategory)
      ? availableMainCategories
      : categories.filter((cat) => cat.id === activeMainCategory.id);

    let tempIds = [];
    for (const cat of activeMainCategories) {
      for (const id of cat.children) {
        if (!tempIds.includes(id)) {
          tempIds.push(id);
        }
      }
    }
    const availableSubCategories = categories.filter((cat) =>
      tempIds.includes(cat.id)
    );
    const activeSubCategories = isNull(activeSubCategory)
      ? availableSubCategories
      : availableSubCategories.filter((cat) => cat.id === activeSubCategory.id);

    tempIds = [];
    for (const cat of activeSubCategories) {
      for (const id of cat.children) {
        if (!tempIds.includes(id)) {
          tempIds.push(id);
        }
      }
    }
    const availableSubSubCategories = categories.filter((cat) =>
      tempIds.includes(cat.id)
    );
    const activeSubSubCategories = isNull(activeSubSubCategory)
      ? availableSubSubCategories
      : availableSubSubCategories.filter(
          (cat) => cat.id === activeSubSubCategory.id
        );

    setMainCategories(availableMainCategories.sort(byPosition));
    setSubCategories(availableSubCategories.sort(byPosition));
    setSubSubCategories(availableSubSubCategories.sort(byPosition));

    let categoriesWithItems = [];
    if (isNull(activeSubSubCategory)) {
      categoriesWithItems.push(...availableSubSubCategories);
      if (isNull(activeSubCategory)) {
        categoriesWithItems.push(...availableSubCategories);
        if (isNull(activeMainCategory)) {
          setFilteredProducts(data.sort(byPosition));
          return;
        } else {
          categoriesWithItems.push(activeMainCategory);
        }
      } else {
        categoriesWithItems.push(activeSubCategory);
      }
    } else {
      categoriesWithItems.push(activeSubSubCategory);
    }

    tempIds = [];
    for (const cat of categoriesWithItems) {
      for (const id of cat.items) {
        if (!tempIds.includes(id)) {
          tempIds.push(id);
        }
      }
    }

    setFilteredProducts(
      data.filter((product) => tempIds.includes(product.id)).sort(byPosition)
    );
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
          <h1 className={styles.catalogTitle}>
            {activeMainCategory?.name ?? "Все"}
          </h1>
          <div className={styles.catalogCategories}>
            <button
              className={`${styles.catalogCategoriesLink} ${
                activeMainCategory === undefined ? styles.active : ""
              }`}
              onClick={() => handleMainCategoryClick(undefined)}
            >
              Все
            </button>
            {mainCategories.map((category) => (
              <button
                key={category.id}
                className={`${styles.catalogCategoriesLink} ${
                  activeMainCategory?.id === category.id ? styles.active : ""
                }`}
                onClick={() => handleMainCategoryClick(category)}
              >
                {category.name}
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
          {subCategories.map((category) => (
            <li key={category.id}>
              <button
                className={`${styles.catalogSubcategory} ${
                  activeSubCategory?.id === category.id ? styles.active : ""
                }`}
                onClick={() => handleSubCategoryClick(category)}
                type="button"
                disabled={activeSubCategory?.id === category.id}
              >
                {category.name}
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
          {subSubCategories.map((category) => (
            <li
              className={styles.catalogSubSubcategoriesItem}
              key={category.id}
            >
              <button
                className={`${styles.catalogSubSubcategory} ${
                  activeSubSubCategory?.id === category.id ? styles.active : ""
                }`}
                onClick={() => handleSubSubCategoryClick(category)}
                type="button"
                disabled={activeSubSubCategory?.id === category.id}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>

        <ul className={styles.catalogList}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onCardClick={handleOpenModal}
            />
          ))}
        </ul>

        <div className={styles.requestBlock}>
          <div className={styles.requestText}>
            <h2 className={styles.requestTitle}>
              Не нашли необходимое или не можете определиться?
            </h2>
            <p className={styles.requestDescription}>
              Оставьте заявку, наши специалисты помогут с выбором и подберут
              решение
            </p>
          </div>
          <div className={styles.requestForm}>
            <label className={styles.formLabel}>ФИО</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Введите ФИО"
            />
            <label className={styles.formLabel}>Номер телефона</label>
            <input
              type="tel"
              className={styles.formInput}
              placeholder="+7 (___) ___-__-__"
            />
            <button className={styles.formButton}>Отправить заявку</button>
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
