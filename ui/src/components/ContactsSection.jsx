import React from 'react';
import styles from './ContactsSection.module.css';

const ContactsSection = () => {
  return (
    <section className={styles.contacts} id="contacts">
      <div className={styles.container}>
        <div className={styles.contactsInner}>
          <div className={styles.contactsContent}>
            <h2 className={styles.titleSection}>Ждём вас <br/> в наших магазинах</h2>
            <div className={styles.contactsItems}>
              <div className={styles.contactsItem}>
                <h3 className={styles.contactsSubtitle}>Москва, ул. Петровка 7</h3>
                <p className={styles.contactsText}>
                  Каждый день с 8:00 до 20:00 <br />
                  Без перерывов и выходных
                </p>
              </div>
              <div className={styles.contactsItem}>
                <h3 className={styles.contactsSubtitle}>Краснодар, ул. Красная 12</h3>
                <p className={styles.contactsText}>
                  Каждый день с 8:00 до 20:00 <br />
                  Без перерывов и выходных
                </p>
              </div>
            </div>
          </div>
          
          <div className={styles.contactsMap}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2968.8771552703306!2d37.419023303838!3d55.68310406925035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sru!2sru!4v1754633992314!5m2!1sru!2sru"
              width="100%" 
              height="460" 
              frameBorder="0"
              allowFullScreen
              title="Карта расположения магазинов"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactsSection;