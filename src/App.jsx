import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from "./components/Navbar";
import Footer from "./components/Footer";
import CatalogPage from "./catalog/CatalogPage";
import HomeSection from "./components/HomeSection";
import StocksSection from "./components/StocksSection";
import CategoriesSection from "./components/Categories";
import PartnersSection from "./components/Partners";
// import DeliveryOrderSections from "./components/DeliveryOrderSections";
import OrderSection from './components/OrderSections';
import ContactsSection from "./components/ContactsSection";
import WhyUsSection from './components/WhyUsSection';
import Faq from './components/Faq';
import { CartContextProvider } from './context/CartContext';
import { CookiesProvider } from 'react-cookie';
import { ProductsContextProvider } from './context/ProductsContext';
import { FavoriteProvider } from './context/FavoriteContext';

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
      <CookiesProvider defaultSetOptions={{path: '/', maxAge: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30)}}>
        <ProductsContextProvider>
          <CartContextProvider>
            <FavoriteProvider>
            <Header />
            <Routes>
              <Route path="/" element={
                <>
                  <HomeSection />
                  <div id="stocks"><StocksSection /></div>
                  <div id="categories"><CategoriesSection /></div>
                  <div id="aboutUs"><WhyUsSection /></div>
                  <div id="delivery"><OrderSection /></div>
                  <div id="partners"><PartnersSection /></div>
                  <Faq />
                  <ContactsSection />
                </>
              } />
              <Route path="/catalog" element={<CatalogPage title="Каталог продукции" />} />
              <Route path="/catalog/:mainCategory?" element={<CatalogPage />} />
            </Routes>
            <Footer />
            </FavoriteProvider>
          </CartContextProvider>
        </ProductsContextProvider>
      </CookiesProvider>
    </div>
  );
}

export default App;

