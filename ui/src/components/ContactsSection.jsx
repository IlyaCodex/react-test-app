import React from 'react';
import styles from './ContactsSection.module.css';

const ContactsSection = () => {
  return (
    <section className={styles.contacts} id="contacts">
      <div className={styles.container}>
        <div className={styles.contactsInner}>
          <div className={styles.contactsContent}>
            <h2 className={styles.titleSection}>Ждём вас в наших магазинах</h2>
            <div className={styles.contactsItems}>
              <div className={styles.contactsItem}>
                <h3 className={styles.contactsSubtitle}>Москва, ул. Ленина 1</h3>
                <p className={styles.contactsText}>
                  Каждый день с 8:00 до 20:00 <br />
                  Без перерывов и выходных
                </p>
              </div>
              <div className={styles.contactsItem}>
                <h3 className={styles.contactsSubtitle}>Париж, ул. Сталина 2</h3>
                <p className={styles.contactsText}>
                  Каждый день с 8:00 до 20:00 <br />
                  Без перерывов и выходных
                </p>
              </div>
            </div>
          </div>
          
          <div className={styles.contactsMap} style={{ position: 'relative', overflow: 'hidden' }}>
            <iframe 
              src="https://yandex.ru/map-widget/v1/?ll=37.741656%2C55.591847&mode=search&oid=1741147695&ol=biz&sctx=ZAAAAAgBEAAaKAoSCZ5eKcsQz0JAEdOgaB7A4EtAEhIJA137Anqh8j8RmPxP%2Fu4d7D8iBgABAgMEBSgKOABAga4HSAFqAnJ1nQHNzMw9oAEAqAEAvQGrE8ZIwgEQr5yfvgbr7YPa9wS%2Fmf%2FgBIICCG1lcmNlZGVzigIAkgIAmgIMZGVza3RvcC1tYXBz&sll=37.741656%2C55.591847&sspn=0.043602%2C0.019418&text=mercedes&utm_source=share&z=15"
              width="560" 
              height="460" 
              frameBorder="0"
              allowFullScreen
              style={{ position: 'relative' }}
              title="Карта расположения магазинов"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactsSection;