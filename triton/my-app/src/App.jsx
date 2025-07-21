import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from "./components/Navbar";
import Footer from "./components/Footer";
import CatalogPage from "./catalog/CatalogPage";
import HomeSection from "./components/HomeSection";
import StocksSection from "./components/StocksSection";
import CategoriesSection from "./components/Categories";
import PartnersSection from "./components/Partners";
import DeliveryOrderSections from "./components/DeliveryOrderSections";
import ContactsSection from "./components/ContactsSection";

function App() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={
          <>
            <HomeSection />
            <div id="stocks"><StocksSection /></div>
            <div id="categories"><CategoriesSection /></div>
            <div id="delivery"><DeliveryOrderSections /></div>
            <div id="partners"><PartnersSection /></div>
            <ContactsSection />
          </>
        } />
        <Route path="/catalog" element={<CatalogPage title="Каталог продукции" />} />
        <Route path="/about" element={<div>Страница О нас (добавьте компонент)</div>} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;

