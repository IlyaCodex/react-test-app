import React from 'react';

const ContactsSection = () => {
  return (
    <section className="contacts indent" id="contacts">
      <div className="container">
        <div className="contacts__inner">
          <div className="contacts__content">
            <h2 className="title-section title-section--small">Ждём вас в наших магазинах</h2>
            <div className="contacts__items">
              <div className="contacts__item">
                <h3 className="contacts__subtitle">Москва, ул. Ленина 1</h3>
                <p className="contacts__text">
                  Каждый день с 8:00 до 20:00 <br />
                  Без перерывов и выходных
                </p>
              </div>
              <div className="contacts__item">
                <h3 className="contacts__subtitle">Париж, ул. Сталина 2</h3>
                <p className="contacts__text">
                  Каждый день с 8:00 до 20:00 <br />
                  Без перерывов и выходных
                </p>
              </div>
            </div>
          </div>
          
          <div className="contacts__map" style={{ position: 'relative', overflow: 'hidden' }}>
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