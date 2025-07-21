import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import cardData from '../data/cardData';

const CatalogPage = () => {
  const { mainCategory: urlMainCategory } = useParams();
  const [searchParams] = useSearchParams();
  const initialSubcategory = searchParams.get('subcategory') || 'Все';

  // Фиксированные категории
  const mainCategories = ["Врачам", "Зуботехникам", "Ученикам"];
  const categorySubcategories = {
    "Врачам": ["Перчатки", "Шприцы", "Маски", "Профессиональные инструменты", "Антисептики"],
    "Ученикам": ["Учебные модели", "Фантомы", "Базовые инструменты", "Учебные пособия", "Наборы для практики"],
    "Зуботехникам": ["Зубопротезные материалы", "Артикуляторы", "Воски и восковки", "Керамика", "Полировочные материалы"],
  };
  const subcategories = ["Все", "Анестезия", "Шовный материал", "Гигиена и профилактика", "Гигиена и профилактика", "Гигиена и профилактика", "Гигиена", "Гигиена и профилактика", "Гигиена и профилактика", "Гигиена"];

  // Состояния для фильтрации
  const [filteredProducts, setFilteredProducts] = useState(cardData);
  const [activeMainCategory, setActiveMainCategory] = useState(urlMainCategory || "Врачам");
  const [activeCategory, setActiveCategory] = useState('Все');
  const [activeSubcategory, setActiveSubcategory] = useState(initialSubcategory);

  // Фильтрация товаров
  useEffect(() => {
    let result = cardData;

    // Фильтр по основной категории
    if (activeMainCategory !== 'Все') {
      result = result.filter(item => item.mainCategory === activeMainCategory);
    }

    // Фильтр по категории
    if (activeCategory !== 'Все' && categorySubcategories[activeMainCategory].includes(activeCategory)) {
      result = result.filter(item => item.category === activeCategory);
    }

    // Фильтр по подкатегории
    if (activeSubcategory !== 'Все' && subcategories.includes(activeSubcategory)) {
      result = result.filter(item => item.subcategory === activeSubcategory);
    }

    setFilteredProducts(result);
  }, [activeMainCategory, activeCategory, activeSubcategory, urlMainCategory]);

  // Обработчики кликов
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

  return (
    <section className="catalog">
      <div className="container">
        <div className="catalog__top">
          <h1 className="catalog__title">{activeMainCategory}</h1>
          <div className="catalog__categories">
            {mainCategories.map((category, index) => (
              <button
                key={index}
                className={`catalog__categories-link ${activeMainCategory === category ? 'active' : ''}`}
                onClick={() => handleMainCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Категории (подкатегории из CategoriesSection) */}
        <ul className="catalog__subcategories">
          {['Все', ...categorySubcategories[activeMainCategory]].map((category, index) => (
            <li key={index}>
              <button
                className={`catalog__subcategory ${activeCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
                type="button"
                disabled={activeCategory === category}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
        
        {/* Подкатегории */}
        <ul className="catalog__sub-subcategories">
          {subcategories.map((subcategory, index) => (
            <li className="catalog__sub-subcategories-item" key={index}>
              <button
                className={`catalog__sub-subcategory ${activeSubcategory === subcategory ? 'active' : ''}`}
                onClick={() => handleSubcategoryClick(subcategory)}
                type="button"
                disabled={activeSubcategory === subcategory}
              >
                {subcategory}
              </button>
            </li>
          ))}
        </ul>
        
        {/* Список товаров */}
        <ul className="catalog__list">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default CatalogPage;