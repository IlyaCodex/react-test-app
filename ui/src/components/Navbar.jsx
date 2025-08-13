import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Search,
  Heart,
  User,
  ShoppingCart,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CartSidebar from "./CartSidebar";
import styles from "./Navbar.module.css";
import { FavoritesSidebar } from "./FavoritesSidebar";
import CheckoutModal from "./CheckoutModal";
import { useDebounce } from "../hooks/debounce";
import { api } from "../api";
import { isNull, chooseImage, nonNull } from "./admin/Utils";
import { CartContext } from "../context/CartContext";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [foundItems, setFoundItems] = useState(undefined);
  const [foundImages, setFoundImages] = useState([]);
  const { addItems } = useContext(CartContext);
  const navigate = useNavigate();

  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (
        isMenuOpen &&
        !event.target.closest(`.${styles.menuBtn}`) &&
        !event.target.closest(`.${styles.mobileMenuInner}`)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        const input = searchRef.current.querySelector("input");
        if (input) input.focus();
      }, 10);
    }
  };

  const onSearchChange = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (debouncedSearchQuery) {
      api.searchItems(debouncedSearchQuery).then((res) => {
        const items = res.data.items;
        setFoundItems([...items, ...res.data.categories]);
        Promise.all(
          items.map((item) => {
            item.count = 1;
            const imageId = chooseImage(item);
            if (isNull(imageId)) {
              return Promise.resolve(undefined);
            }
            return api.getItemImage(imageId).then((res) => res.data);
          })
        ).then((arr) => {
          setFoundImages(arr.filter((image) => !!image));
        });
      });
    } else {
      setFoundItems(undefined);
      setFoundImages([]);
    }
  }, [debouncedSearchQuery]);

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.innerWidth <= 768) {
      setIsMenuOpen(false);
    }
    setIsCartOpen(true);
  };

  const handleFavoritesClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavoritesOpen(true);
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
  };

  const handleFavoritesClose = () => {
    setIsFavoritesOpen(false);
  };

  const onToCart = () => {
    setIsFavoritesOpen(false);
    setIsCartOpen(true);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const onIncrement = (item) => {
    item.count = item.count + 1;
    setFoundItems([...foundItems]);
  };

  const onDecrement = (item) => {
    if (item.count <= 0) {
      return;
    }
    item.count = item.count - 1;
    setFoundItems([...foundItems]);
  };

  const toCart = (item) => {
    addItems(...Array.from({ length: item.count }).map(() => item));
  };

  const handleOpenCheckoutModal = () => {
    setIsCheckoutModalOpen(true);
  };

  const handleCloseCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };

  const renderFoundCategory = (category) => {
    const cats = [];
    if (category.level === 3) {
      cats.push(category.parent.parent);
    }
    if (category.level >= 2) {
      cats.push(category.parent);
    }
    cats.push(category);
    return (
      <div className={styles.searchCategory}>
        <div className={styles.categoryList}>
          {category.level === 3 ? (
            <>{`${category.parent.parent.name} > `}</>
          ) : null}
          {category.level >= 2 ? <>{`${category.parent.name} > `}</> : null}
          <strong>{category.name}</strong>
        </div>
        <button
          className={styles.toCatalog}
          onClick={() => {
            const p = {};
            if (nonNull(cats[0])) {
              p.maincategory = cats[0].id;
            }
            if (nonNull(cats[1])) {
              p.subcategory = cats[1].id;
            }
            if (nonNull(cats[2])) {
              p.subsubcategory = cats[2].id;
            }
            const params = new URLSearchParams(p);
            navigate(`/catalog?${params.toString()}`);
            setIsSearchOpen(false);
          }}
        >
          В каталог
        </button>
      </div>
    );
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerInner}>
          <div className={styles.headerLogo}>
            <Link to="/" className={styles.headerLogoLink}>
              <img
                className={styles.headerImg}
                src="../images/logo.png"
                width="72"
                height="48"
                alt="логотип Triton"
              />
            </Link>
          </div>

          <nav
            className={`${styles.headerNav} ${
              isSearchOpen ? styles.hidden : ""
            }`}
          >
            <ul className={styles.headerList}>
              <li>
                <Link
                  to="/#stocks"
                  className={`${styles.headerLink} ${styles.desktop}`}
                >
                  Акции
                </Link>
              </li>
              <li>
                <Link
                  to="/#categories"
                  className={`${styles.headerLink} ${styles.desktop}`}
                >
                  Категории
                </Link>
              </li>
              <li>
                <Link to="/catalog" className={styles.headerLink}>
                  Каталог
                </Link>
              </li>
              <li>
                <Link to="/#aboutUs" className={styles.headerLink}>
                  О нас
                </Link>
              </li>
              <li>
                <Link to="/#delivery" className={styles.headerLink}>
                  Доставка
                </Link>
              </li>
              <li>
                <Link to="/#partners" className={styles.headerLink}>
                  Партнеры
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  id="cartSidebar"
                  className={styles.headerLink}
                  onClick={handleCartClick}
                >
                  Корзина
                </Link>
              </li>
            </ul>
          </nav>

          <div className={styles.headerRight}>
            <div
              ref={searchRef}
              className={`${styles.searchContainer} ${
                isSearchOpen ? styles.active : ""
              }`}
            >
              {isSearchOpen && (
                <div className={styles.searchForm}>
                  <input
                    type="text"
                    className={styles.searchInput}
                    onChange={onSearchChange}
                    value={searchQuery}
                    placeholder="Поиск..."
                  />
                  {isNull(foundItems) ? null : (
                    <div className={styles.itemContainer}>
                      {foundItems.length === 0 ? (
                        <div className={styles.notFound}>Ничего не найдено</div>
                      ) : (
                        foundItems.map((item) => {
                          if (item.level) {
                            return renderFoundCategory(item);
                          }
                          return (
                            <div className={styles.searchItem}>
                              <div className={styles.itemInfo}>
                                <img
                                  alt="Картинка"
                                  src={
                                    foundImages.find(
                                      (image) => image.id === chooseImage(item)
                                    )?.data
                                  }
                                />
                                <div className={styles.name}>{item.name}</div>
                              </div>
                              <div className={styles.itemButtons}>
                                <div className={styles.counter}>
                                  <button onClick={() => onDecrement(item)}>
                                    -
                                  </button>
                                  <div>{item.count}</div>
                                  <button onClick={() => onIncrement(item)}>
                                    +
                                  </button>
                                </div>
                                <button
                                  className={styles.toCart}
                                  onClick={() => toCart(item)}
                                >
                                  В корзину
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
              <button
                className={`${styles.headerSearchBtn} ${
                  isSearchOpen ? styles.hidden : ""
                }`}
                onClick={handleSearchToggle}
                aria-label={isSearchOpen ? "Закрыть поиск" : "Открыть поиск"}
              >
                <Search size={20} color="#fff" />
              </button>
            </div>
            <button
              className={styles.favoritesBtn}
              aria-label="Избранное"
              onClick={handleFavoritesClick}
            >
              <Heart size={20} color="#fff" />
            </button>
            <button
              className={styles.requestBtn}
              type="button"
              onClick={handleOpenCheckoutModal}
            >
              Оставить заявку
            </button>
          </div>
          <button className={styles.menuBtn} onClick={handleMenuToggle}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={handleCartClose} />
      <FavoritesSidebar
        isOpen={isFavoritesOpen}
        onClose={handleFavoritesClose}
        onToCart={onToCart}
      />

      {isMenuOpen && (
        <div
          className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ""}`}
        >
          <div className={styles.mobileMenuInner}>
            <nav className={styles.mobileNav}>
              <ul className={styles.mobileList}>
                <li>
                  <Link
                    to="/#stocks"
                    className={styles.mobileLink}
                    onClick={handleMenuToggle}
                  >
                    Акции
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#categories"
                    className={styles.mobileLink}
                    onClick={handleMenuToggle}
                  >
                    Категории
                  </Link>
                </li>
                <li>
                  <Link
                    to="/catalog"
                    className={styles.mobileLink}
                    onClick={handleMenuToggle}
                  >
                    Каталог
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#aboutUs"
                    className={styles.mobileLink}
                    onClick={handleMenuToggle}
                  >
                    О нас
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#delivery"
                    className={styles.mobileLink}
                    onClick={handleMenuToggle}
                  >
                    Доставка
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#partners"
                    className={styles.mobileLink}
                    onClick={handleMenuToggle}
                  >
                    Партнеры
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    id="cartSidebar"
                    className={styles.mobileLink}
                    onClick={handleCartClick}
                  >
                    Корзина
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {isCheckoutModalOpen && (
        <CheckoutModal onClose={handleCloseCheckoutModal} />
      )}
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
