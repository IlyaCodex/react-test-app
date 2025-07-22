import React, { useState, useRef, useEffect } from 'react';
import { Search, Heart, User, ShoppingCart, ChevronDown, MapPin } from "lucide-react";
import { Link } from 'react-router-dom';
import CartSidebar from './CartSidebar';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        const input = searchRef.current.querySelector('input');
        if (input) input.focus();
      }, 10);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search submitted');
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    setIsCartOpen(true);
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header__inner">
          <div className="header__logo">
            <Link to="/" className="header__logo-link">
              <img 
                className="header__img" 
                src="../images/logo.png" 
                width="72" 
                height="48" 
                alt="логотип Triton" 
              />
            </Link>
          </div>
          
          <nav className="header__nav">
            <ul className="header__list">
              <li><Link to="/#stocks" className="header__link desktop">Акции</Link></li>
              <li><Link to="/#categories" className="header__link desktop">Категории</Link></li>
              <li><Link to="/catalog" className="header__link">Каталог</Link></li>
              <li><Link to="/about" className="header__link">О нас</Link></li>
              <li><Link to="/#delivery" className="header__link">Доставка</Link></li>
              <li><Link to="/#partners" className="header__link">Партнеры</Link></li>
              <li>
                <Link to="#" id="cartSidebar" className="header__link" onClick={handleCartClick}>
                  Корзина
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="header__right">
            <div ref={searchRef} className={`search-container ${isSearchOpen ? 'active' : ''}`}>
              {isSearchOpen && (
                <form onSubmit={handleSearchSubmit} className="search-form">
                  <input type="text" className="search-input" placeholder="Поиск..." />
                </form>
              )}
              <button className="header__search-btn" onClick={handleSearchToggle} aria-label={isSearchOpen ? "Закрыть поиск" : "Открыть поиск"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <button className="btn open-modal-btn" type="button">Оставить заявку</button>
          </div>
        </div>
      </div>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={handleCartClose}
      />
    </header>
  );
};

export default Header;

// import React, { useState, useRef, useEffect } from 'react';
// import { Search, Heart, User, ShoppingCart, ChevronDown, MapPin } from "lucide-react";
// import { Link } from 'react-router-dom';

// const Header = () => {
//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const [searchValue, setSearchValue] = useState('');
//   const searchRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (searchRef.current && !searchRef.current.contains(event.target)) {
//         setIsSearchOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const handleSearchToggle = () => {
//     setIsSearchOpen(!isSearchOpen);
//     if (!isSearchOpen) {
//       setTimeout(() => {
//         const input = searchRef.current.querySelector('input');
//         if (input) input.focus();
//       }, 10);
//     }
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     console.log('Search submitted:', searchValue);
//   };

//   return (
//     <header className="header">
//       <div className="container">
//         <div className="header__inner">
//           <div className="header__logo">
//             <Link to="/" className="header__logo-link">
//               <img 
//                 className="header__img" 
//                 src="../images/logo.png" 
//                 width="72" 
//                 height="48" 
//                 alt="логотип Triton" 
//               />
//             </Link>
//           </div>
          
//           <nav className="header__nav">
//             <ul className="header__list">
//               <li>
//                 <Link to="/#stocks" className="header__link desktop">Акции</Link>
//               </li>
//               <li>
//                 <Link to="/#categories" className="header__link desktop">Категории</Link>
//               </li>
//               <li>
//                 <Link to="/catalog" className="header__link">Каталог</Link>
//               </li>
//               <li>
//                 <Link to="/about" className="header__link">О нас</Link>
//               </li>
//               <li>
//                 <Link to="/#delivery" className="header__link">Доставка</Link>
//               </li>
//               <li>
//                 <Link to="/#partners" className="header__link">Партнеры</Link>
//               </li>
//               <li>
//                 <Link to="/#" id='cartSidebar' className="header__link">Корзина</Link>
//               </li>
//             </ul>
//           </nav>
  
//           <div className="header__right">
//             <div 
//               ref={searchRef}
//               className={`search-container ${isSearchOpen ? 'active' : ''}`}
//             >
//               {isSearchOpen && (
//                 <form onSubmit={handleSearchSubmit} className="search-form">
//                   <input
//                     type="text"
//                     className="search-input"
//                     value={searchValue}
//                     onChange={(e) => setSearchValue(e.target.value)}
//                     placeholder="Поиск..."
//                   />
//                 </form>
//               )}
//               <button 
//                 className="header__search-btn" 
//                 onClick={handleSearchToggle}
//                 aria-label={isSearchOpen ? "Закрыть поиск" : "Открыть поиск"}
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
//                   <path 
//                     d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
//                     stroke="#171717" 
//                     strokeWidth="2" 
//                     strokeLinecap="round" 
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//               </button>
//             </div>
//             <button className="btn open-modal-btn" type="button">Оставить заявку</button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;