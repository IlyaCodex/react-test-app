import React from 'react';
import styles from './WhyUsSection.module.css';

const WhyUsSection = () => {
  const cards = [
    {
      id: 1,
      icon: "../images/image_2025-08-06_20-53-57.png",
      alt: "Цена",
      title: "Низкие цены",
      description: "Самые выгодные цены на стоматологические материалы и оборудование",
      backgroundColor: '#f9e9e9',
    },
    {
      id: 3,
      icon: "../images/image_2025-08-06_20-54-29.png",
      alt: "Гибкость",
      title: "Гибкость",
      description: "Найдём индивидуально нужный товар, даже если его нет в каталоге",
      backgroundColor: '#f7cbe6',
    },
    {
      id: 4,
      icon: "../images/image_2025-08-06_20-54-48.png",
      alt: "Гарантия",
      title: "Гарантия",
      description: "Гарантия качества и сервисное обслуживание на все товары",
      backgroundColor: '#fe9e26',
    },
    {
      id: 5,
      icon: "../images/image_2025-08-06_20-55-00.png",
      alt: "Качество",
      title: "Качество",
      description: "Быстрая и надёжная доставка по Москве и всей России",
      backgroundColor: '#adeaff',
    },
    {
      id: 2,
      icon: "../images/doc_2025-08-06_21-19-43.png",
      alt: "Консультация",
      title: "Профессиональная<br>консультация",
      description: "Наши опытные консультанты всегда готовы помочь с выбором",
      backgroundColor: '#ebf9ea',
    },
    // {
    //   id: 6,
    //   image: "../images/image_2025-08-06_20-55-15.png",
    //   alt: "Special Image",
    // },
  ];

  return (
    <section id='aboutUs' className={styles.whyUsSection}>
      <h2 className={styles.sectionTitle}>
        Почему выбирают нас?
      </h2>
      
      <div className={styles.whyUsGrid}>
        {cards.map(card => {
          const cardClasses = [
            styles.whyUsCard,
            card.isGray ? styles.gray : '',
            card.isWide ? styles.wide : ''
          ].filter(Boolean).join(' ');

          return (
            <div key={card.id} className={cardClasses}>
              {!card.isGray && (
                <>
                  {card.icon && (
                    <div className={styles.iconWrapper} style={{ backgroundColor: card.backgroundColor }}>
                      <img src={card.icon} alt={card.alt} />
                    </div>
                  )}
                  {card.image && (
                    <div className={styles.imageWrapper}>
                      <img src={card.image} alt={card.alt} className={styles.cardImage} />
                    </div>
                  )}
                  {card.title && <h3 dangerouslySetInnerHTML={{ __html: card.title }} />}
                  {card.description && <p>{card.description}</p>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default WhyUsSection;