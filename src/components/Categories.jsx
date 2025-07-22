import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CategoriesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      title: "Врачам",
      description: "Перчатки, шприцы, маски, профессиональные инструменты и многое другое",
      subcategories: ["Перчатки", "Шприцы", "Маски", "Профессиональные инструменты", "Антисептики"],
    },
    {
      id: 2,
      title: "Ученикам",
      description: "Модели, манекены, базовые инструменты и другое",
      subcategories: ["Учебные модели", "Фантомы", "Базовые инструменты", "Учебные пособия", "Наборы для практики"],
    },
    {
      id: 3,
      title: "Зуботехникам",
      description: "Модели, манекены, базовые инструменты и другое",
      subcategories: ["Зубопротезные материалы", "Артикуляторы", "Воски и восковки", "Керамика", "Полировочные материалы"],
    },
  ];

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleSubcategoryClick = (mainCategory, subcategory) => {
    navigate(`/catalog/${encodeURIComponent(mainCategory)}?subcategory=${encodeURIComponent(subcategory)}`);
  };

  const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="16" viewBox="0 0 9 16" fill="none">
      <path d="M8.70711 8.70711C9.09763 8.31658 9.09763 7.68342 8.70711 7.29289L2.34315 0.928932C1.95262 0.538408 1.31946 0.538408 0.928932 0.928932C0.538408 1.31946 0.538408 1.95262 0.928932 2.34315L6.58579 8L0.928932 13.6569C0.538408 14.0474 0.538408 14.6805 0.928932 15.0711C1.31946 15.4616 1.95262 15.4616 2.34315 15.0711L8.70711 8.70711ZM7 8V9H8V8V7H7V8Z" fill="#F0F0F0"/>
    </svg>
  );

  return (
    <section className="categories indent" id="categories">
      <div className="container">
        <h2 className="title-section">Категории товаров</h2>
        
        <ul className="categories__list">
          {categories.map((category) => (
            <li 
              key={category.id}
              className={`categories__item ${selectedCategory === category.id ? 'active' : ''}`}
              tabIndex={0}
              onClick={() => handleCategoryClick(category.id)}
              onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(category.id)}
            >
              <div className="categories__head">
                {category.title}
                <div className="categories__btn">
                  <ArrowIcon />
                </div>
              </div>
              <p className="categories__text">
                {category.description}
              </p>
              
              {selectedCategory === category.id && (
                <div className="subcategories">
                  <ul className="subcategories__list">
                    {category.subcategories.map((sub, index) => (
                      <li 
                        key={index} 
                        className="subcategories__item"
                        onClick={() => handleSubcategoryClick(category.title, sub)}
                        style={{ cursor: 'pointer' }}
                      >
                        {sub}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default CategoriesSection;