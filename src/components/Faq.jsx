import { faqData } from "../data/faqData";
import { useState } from "react";
import styles from './Faq.module.css';

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className={styles.faqSection}>
      <div className={styles.faqHeader}>
        <h2 className={styles.gradientText}>FAQ</h2>
      </div>

      <div className={styles.faqContainer}>
        {faqData.map((item, index) => (
          <div 
            key={index} 
            className={`${styles.faqItem} ${activeIndex === index ? styles.active : ''}`}
          >
            <div 
              className={styles.faqQuestion} 
              onClick={() => toggleAnswer(index)}
            >
              <h4>{item.question}</h4>
              <span className={styles.faqIcon}>
                {activeIndex === index ? '−' : '+'}
              </span>
            </div>
            
            {activeIndex === index && (
              <div className={styles.faqAnswer}>
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Faq;