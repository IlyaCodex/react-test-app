import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Navbar";
import Footer from "./components/Footer";
import CatalogPage from "./catalog/CatalogPage";
import HomeSection from "./components/HomeSection";
import StocksSection from "./components/StocksSection";
import CategoriesSection from "./components/Categories";
import PartnersSection from "./components/Partners";
// import DeliveryOrderSections from "./components/DeliveryOrderSections";
import NotFound from "./components/notFound";
import OrderSection from "./components/OrderSections";
import ContactsSection from "./components/ContactsSection";
import WhyUsSection from "./components/WhyUsSection";
import Faq from "./components/Faq";
import { CartContextProvider } from "./context/CartContext";
import { CookiesProvider } from "react-cookie";
import { ProductsContextProvider } from "./context/ProductsContext";
import { FavoriteProvider } from "./context/FavoriteContext";
import { AdminPage } from "./components/admin/AdminPage";
import { ItemModalProvider } from "./context/ItemModalContext";

function HomePage() {
  return (
    <>
      <HomeSection />
      <div id="stocks"><StocksSection /></div>
      <div id="categories"><CategoriesSection /></div>
      <div id="aboutUs"><WhyUsSection /></div>
      <div id="partners"><PartnersSection /></div>
      <div id="delivery"><OrderSection /></div>
       <Faq />
      <ContactsSection />
    </>
  );
}

function LayoutWrapper({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

function MainApp() {
  return (
    <Routes>
      <Route path="/" element={<LayoutWrapper> <HomePage /> </LayoutWrapper>}/>
      <Route path="/catalog/:mainCategory?" element={<LayoutWrapper> <CatalogPage /> </LayoutWrapper>} />
      <Route path="*" element={<LayoutWrapper> <NotFound /> </LayoutWrapper>} />
    </Routes>
  );
}

function App() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <div className="app">
      <CookiesProvider
        defaultSetOptions={{
          path: "/",
          maxAge: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
        }}
      >
        <ProductsContextProvider>
          <CartContextProvider>
            <FavoriteProvider>
              <ItemModalProvider>
                <Routes>
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<MainApp />} />
                </Routes>
              </ItemModalProvider>
            </FavoriteProvider>
          </CartContextProvider>
        </ProductsContextProvider>
      </CookiesProvider>
    </div>
  );
}

export default App;
