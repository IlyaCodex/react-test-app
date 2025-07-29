import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ModalWindow from './ModalWindow';
import { ProductsContext } from '../context/ProductsContext';
import styles from './CatalogPage.module.css';

const CatalogPage = () => {
  const cardData = useContext(ProductsContext).data;

  const { mainCategory: urlMainCategory } = useParams();
  const [searchParams] = useSearchParams();
  const initialSubcategory = searchParams.get('subcategory') || 'Все';

  const mainCategories = ["Врачам", "Зуботехникам", "Ученикам"];
  const categorySubcategories = {
    "Врачам": ["Перчатки", "Шприцы", "Маски", "Профессиональные инструменты", "Антисептики"],
    "Ученикам": ["Учебные модели", "Фантомы", "Базовые инструменты", "Учебные пособия", "Наборы для практики"],
    "Зуботехникам": ["Зубопротезные материалы", "Артикуляторы", "Воски и восковки", "Керамика", "Полировочные материалы"],
  };
  const subcategories = ["Все", "Анестезия", "Шовный материал", "Гигиена и профилактика", "Гигиена и профилактика", "Гигиена и профилактика", "Гигиена", "Гигиена и профилактика", "Гигиена и профилактика", "Гигиена"];

  const [filteredProducts, setFilteredProducts] = useState(cardData);
  const [activeMainCategory, setActiveMainCategory] = useState(urlMainCategory || "Врачам");
  const [activeCategory, setActiveCategory] = useState('Все');
  const [activeSubcategory, setActiveSubcategory] = useState(initialSubcategory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    let result = cardData;

    if (activeMainCategory !== 'Все') {
      result = result.filter(item => item.mainCategory === activeMainCategory);
    }

    if (activeCategory !== 'Все' && categorySubcategories[activeMainCategory].includes(activeCategory)) {
      result = result.filter(item => item.category === activeCategory);
    }

    if (activeSubcategory !== 'Все' && subcategories.includes(activeSubcategory)) {
      result = result.filter(item => item.subcategory === activeSubcategory);
    }

    setFilteredProducts(result);
  }, [cardData, activeMainCategory, activeCategory, activeSubcategory, urlMainCategory]);

  const handleMainCategoryClick = (category) => {
    setActiveMainCategory(category);
    setActiveCategory('Все');
    setActiveSubcategory('Все');
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setActiveSubcategory('Все');
  };

  const handleSubcategoryClick = (subcategory) => {
    setActiveSubcategory(subcategory);
  };

  const handleOpenModal = (productId) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  return (
    <section className={styles.catalog}>
      <div className={styles.container}>
        <div className={styles.catalogTop}>
          <h1 className={styles.catalogTitle}>{activeMainCategory}</h1>
          <div className={styles.catalogCategories}>
            {mainCategories.map((category, index) => (
              <button
                key={index}
                className={`${styles.catalogCategoriesLink} ${activeMainCategory === category ? styles.active : ''}`}
                onClick={() => handleMainCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <ul className={styles.catalogSubcategories}>
          {['Все', ...categorySubcategories[activeMainCategory]].map((category, index) => (
            <li key={index}>
              <button
                className={`${styles.catalogSubcategory} ${activeCategory === category ? styles.active : ''}`}
                onClick={() => handleCategoryClick(category)}
                type="button"
                disabled={activeCategory === category}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
        
        <ul className={styles.catalogSubSubcategories}>
          {subcategories.map((subcategory, index) => (
            <li className={styles.catalogSubSubcategoriesItem} key={index}>
              <button
                className={`${styles.catalogSubSubcategory} ${activeSubcategory === subcategory ? styles.active : ''}`}
                onClick={() => handleSubcategoryClick(subcategory)}
                type="button"
                disabled={activeSubcategory === subcategory}
              >
                {subcategory}
              </button>
            </li>
          ))}
        </ul>
        
        <ul className={styles.catalogList}>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onCardClick={handleOpenModal}
            />
          ))}
        </ul>

          <div className={styles.requestBlock}>
          <div className={styles.requestText}>
            <h2 className={styles.requestTitle}>Не нашли необходимое или не можете определиться?</h2>
            <p className={styles.requestDescription}>Оставьте заявку, наши специалисты помогут с выбором и подберут решение</p>
          </div>
          <div className={styles.requestForm}>
            <label className={styles.formLabel}>ФИО</label>
            <input type="text" className={styles.formInput} placeholder="Введите ФИО" />
            <label className={styles.formLabel}>Номер телефона</label>
            <input type="tel" className={styles.formInput} placeholder="+7 (___) ___-__-__" />
            <button className={styles.formButton}>Отправить заявку</button>
          </div>
        </div> 

      </div>

      {isModalOpen && (
        <ModalWindow
          productId={selectedProductId}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
};

export default CatalogPage;