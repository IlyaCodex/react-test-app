import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import styles from "./CatalogPage.module.css";
import { api } from "../api";
import { byPosition, isNull, nonNull } from "../components/admin/Utils";
import { useItemModal } from "../context/ItemModalContext";

const CatalogPage = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    api
      .getItems()
      .then((res) => setData(Array.isArray(res.data) ? res.data : []));
  }, []);

  const [searchParams] = useSearchParams();
  const initialMainCategory = searchParams.get("maincategory");
  const initialSubcategory = searchParams.get("subcategory");
  const initialSubSubCategory = searchParams.get("subsubcategory");

  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [sortedProducts, setSortedProducts] = useState({});

  const [activeMainCategory, setActiveMainCategory] = useState(undefined);
  const [activeSubCategory, setActiveSubCategory] = useState(undefined);
  const [activeSubSubCategory, setActiveSubSubCategory] = useState(undefined);

  // Состояния для формы
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error'

  const { onOpenItemModal } = useItemModal();

  useEffect(() => {
    if (nonNull(initialMainCategory)) {
      setActiveMainCategory(
        categories.find(
          (category) => category?.id?.toString() === initialMainCategory
        ) || undefined
      );
    } else {
      setActiveMainCategory(
        categories.filter((cat) => cat.level === 1).sort(byPosition)?.[0] ??
          undefined
      );
    }
    if (nonNull(initialSubcategory)) {
      setActiveSubCategory(
        categories.find(
          (category) => category?.id?.toString() === initialSubcategory
        ) || undefined
      );
    } else {
      setActiveSubCategory(undefined);
    }
    if (nonNull(initialSubSubCategory)) {
      setActiveSubSubCategory(
        categories.find(
          (category) => category?.id?.toString() === initialSubSubCategory
        ) || undefined
      );
    } else {
      setActiveSubSubCategory(undefined);
    }
  }, [
    initialMainCategory,
    initialSubcategory,
    initialSubSubCategory,
    categories,
  ]);

  useEffect(() => {
    Promise.all([
      api.getCategoriesByLevel(1),
      api.getCategoriesByLevel(2),
      api.getCategoriesByLevel(3),
    ]).then((arr) =>
      setCategories(
        Array.isArray(arr) ? arr.flatMap((res) => res?.data || []) : []
      )
    );
  }, []);

  useEffect(() => {
    const dataByCategory = {};

    for (const item of data) {
      for (const catId of item.categories) {
        let items = dataByCategory[catId] ?? [];
        items.push(item);
        dataByCategory[catId] = items;
      }
    }
    Object.values(dataByCategory).forEach((arr) => arr.sort(byPosition));
    setSortedProducts(dataByCategory);
  }, [data]);

  useEffect(() => {
    const availableMainCategories =
      categories?.filter((cat) => cat?.level === 1)?.sort(byPosition) || [];
    const activeMainCategories = isNull(activeMainCategory)
      ? availableMainCategories
      : categories?.filter((cat) => cat?.id === activeMainCategory?.id) || [];

    let tempIds = [];
    for (const cat of activeMainCategories || []) {
      tempIds = [...tempIds, ...(cat?.children || [])];
    }
    const availableSubCategories =
      categories
        ?.filter((cat) => tempIds.includes(cat?.id))
        ?.sort(byPosition) || [];

    setMainCategories(availableMainCategories);
    setSubCategories(availableSubCategories);
  }, [activeMainCategory, activeSubCategory, activeSubSubCategory, categories]);

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
  
  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, "");

    let formatted = phoneNumber;
    if (formatted.startsWith("8")) {
      formatted = "7" + formatted.slice(1);
    }

    if (!formatted.startsWith("7") && formatted.length > 0) {
      formatted = "7" + formatted;
    }

    if (formatted.length > 11) {
      formatted = formatted.slice(0, 11);
    }

    if (formatted.length === 0) return "";
    if (formatted.length <= 1) return "+7";
    if (formatted.length <= 4) return `+7 (${formatted.slice(1)}`;
    if (formatted.length <= 7)
      return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4)}`;
    if (formatted.length <= 9)
      return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(
        4,
        7
      )} ${formatted.slice(7)}`;
    if (formatted.length <= 11)
      return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(
        4,
        7
      )} ${formatted.slice(7, 9)} ${formatted.slice(9)}`;

    return value;
  };

  const handlePhoneFocus = (e) => {
    if (!formData.phone) {
      setFormData((prev) => ({
        ...prev,
        phone: "+7 ",
      }));
    }
  };

  const handlePhoneKeyDown = (e) => {
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      formData.phone.length <= 3
    ) {
      e.preventDefault();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        phone: formattedPhone,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  

  const validateForm = () => {
    if (!formData.name.trim()) return false;
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 11) return false;
    return true;
  };
  

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(null), 5000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const checkoutData = {
      fullName: formData.name,
      phone: formData.phone,
      email: "",
      deliveryAddress: "Заявка с каталога - консультация по товарам",
      selfPickup: false,
      type: "individual",
      contactMethod: "tel",
    };

    api
      .checkout(checkoutData, [])
      .then((response) => {
        if (response && !response.error) {
          setSubmitStatus("success");

          setFormData({
            name: "",
            phone: "",
          });
        } else {
          setSubmitStatus("error");
          console.error(
            "Ошибка при отправке заявки:",
            response?.error || "Неизвестная ошибка"
          );
        }
      })
      .catch((error) => {
        setSubmitStatus("error");
        console.error("Ошибка при отправке заявки:", error);
      })
      .finally(() => {
        setIsSubmitting(false);

        setTimeout(() => {
          setSubmitStatus(null);
        }, 2000);
      });
  };

  const renderItems = useCallback(() => {
    const subCats = [];
    if (activeSubCategory) {
      subCats.push(activeSubCategory);
    } else {
      if (activeSubSubCategory) {
        const parent = categories.find(
          (cat) => cat.id === activeSubSubCategory.parents[0]
        );
        if (parent) {
          subCats.push(parent);
        } else {
          subCats.push(...subCategories);
        }
      } else {
        subCats.push(...subCategories);
      }
    }

    return subCats.map((subCat) => {
      let subSubCategories = subCat.children
        .map((childId) => categories.find((cat) => cat.id === childId))
        .filter(nonNull)
        .sort(byPosition);
      if (activeSubSubCategory) {
        const activeIndex = subSubCategories.indexOf(activeSubSubCategory);
        if (activeIndex > -1) {
          const active = subSubCategories.splice(activeIndex, 1);
          subSubCategories = [...active, ...subSubCategories];
        }
      }

      return (
        <div key={subCat.id} className={styles.products}>
          <h3 className={styles.subCategoriesName}>{subCat.name}</h3>
          {subSubCategories.map((subSubCategory) => {
            return (
              <div
                key={subSubCategory.id}
                className={styles.subSubCategoryGroup}
              >
                <h3 className={styles.subSubCategoriesName}>
                  {subSubCategory.name}
                </h3>

                <ul className={styles.catalogList}>
                  {sortedProducts[subSubCategory.id]?.length ? (
                    sortedProducts[subSubCategory.id].map((product) => (
                      <ProductCard
                        key={product?.id}
                        product={product}
                        onCardClick={onOpenItemModal}
                        backgroundColor={activeMainCategory?.color}
                      />
                    ))
                  ) : (
                    <div className={styles.noProducts}></div>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      );
    });
  }, [
    subCategories,
    activeMainCategory,
    activeSubCategory,
    activeSubSubCategory,
    categories,
    sortedProducts,
  ]);

  const getAvailableSubSubCategories = useCallback(() => {
    return (
      (activeSubCategory ? [activeSubCategory] : subCategories).flatMap(
        (subCat) =>
          subCat.children
            .map((childId) => categories.find((cat) => cat.id === childId))
            .filter(nonNull)
            .sort(byPosition)
      ) || []
    );
  }, [subCategories, activeSubCategory, categories]);

  return (
    <section className={styles.catalog}>
      <div className={styles.container}>
        <div
          className={styles.catalogTop}
          style={{ backgroundColor: activeMainCategory?.color }}
        >
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
                disabled={
                  !category?.id || activeSubCategory?.id === category?.id
                }
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
          {getAvailableSubSubCategories().map((category) => (
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
                disabled={
                  !category.id || activeSubSubCategory?.id === category.id
                }
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>

        {renderItems()}

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
          <form className={styles.requestForm} onSubmit={handleFormSubmit}>
            <input
              type="text"
              name="name"
              className={styles.formInput}
              placeholder="Ваше имя"
              value={formData.name}
              onChange={handleInputChange}
              required
              maxLength="255"
            />
            <input
              type="tel"
              name="phone"
              className={styles.formInput}
              placeholder="+7 (999) 999 99 99"
              value={formData.phone}
              onChange={handleInputChange}
              onFocus={handlePhoneFocus}
              onKeyDown={handlePhoneKeyDown}
              required
              maxLength="18"
            />

            {submitStatus === "success" && (
              <div className={styles.successMessage}>
                Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.
              </div>
            )}
            {submitStatus === "error" && (
              <div className={styles.errorMessage}>
                Ошибка при отправке заявки. Пожалуйста, проверьте заполнение
                полей и попробуйте позже.
              </div>
            )}

            <button
              className={`${styles.formButton} ${
                isSubmitting ? styles.loading : ""
              }`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Отправка..." : "Отправить заявку"}
              {!isSubmitting && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12H19M19 12L13 6M19 12L13 18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CatalogPage;
