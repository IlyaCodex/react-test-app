import React from 'react';
import styles from './WhyUsSection.module.css';

const WhyUsSection = () => {
  const cards = [
    {
      id: 1,
      icon: "https://i.postimg.cc/cC23pxmX/image.png",
      alt: "Цена",
      title: "Низкие цены",
      description: "Самые выгодные цены на стоматологические материалы и оборудование",
      isGray: false,
      isWide: false
    },
    {
      id: 2,
      isGray: true,
      isWide: false
    },
    {
      id: 3,
      icon: "https://i.postimg.cc/Y2ZmqS6x/image.png",
      alt: "Консультация",
      title: "Профессиональная<br>консультация",
      description: "Наши опытные консультанты всегда готовы помочь с выбором",
      isGray: false,
      isWide: false
    },
    {
      id: 4,
      icon: "https://i.postimg.cc/8zVJMnnJ/image.png",
      alt: "Гибкость",
      title: "Гибкость",
      description: "Найдём индивидуально нужный товар, даже если его нет в каталоге",
      isGray: false,
      isWide: false
    },
    {
      id: 5,
      icon: "https://i.postimg.cc/Y2ZmqS6x/image.png",
      alt: "Гарантия",
      title: "Гарантия",
      description: "Гарантия качества и сервисное обслуживание на все товары",
      isGray: false,
      isWide: false
    },
    {
      id: 6,
      icon: "https://i.postimg.cc/Y2ZmqS6x/image.png",
      alt: "Качество",
      title: "Качество",
      description: "Быстрая и надёжная доставка по Москве и всей России",
      isGray: false,
      isWide: false
    },
    {
      id: 7,
      isGray: true,
      isWide: true
    }
  ];

  return (
    <section id='aboutUs' className={styles.whyUsSection} >
      <h2 className={styles.sectionTitle}>
        Почему
        <br />
        выбирают нас?
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
                  <div className={styles.iconWrapper}>
                    <img src={card.icon} alt={card.alt} />
                  </div>
                  <h3 dangerouslySetInnerHTML={{ __html: card.title }} />
                  <p>{card.description}</p>
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