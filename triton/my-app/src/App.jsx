import Header from "./components/Navbar"
import HomeSection from "./components/HomeSection"
import StocksSection from "./components/StocksSection";
import CategoriesSection from "./components/Categories";
import PartnersSection from "./components/Partners";
import DeliveryOrderSections from "./components/DeliveryOrderSections";
import ContactsSection from "./components/ContactsSection";
import Footer from "./components/Footer";

function App() {
  return (
    <div className='app'>
    <Header/>
    <HomeSection/>
    <StocksSection/>
    <CategoriesSection/>
    <PartnersSection/>
    <DeliveryOrderSections/>
    <ContactsSection/>
    <Footer/>
    </div>
  );
}

export default App;
