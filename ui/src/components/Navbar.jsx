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
// import CheckoutModal from "./CheckoutModal";
import CheckoutModal from "./CheckoutModalHeader"
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

  const handleSearchOverlayClick = (e) => {
    setIsSearchOpen(false);
  };

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
      <div className={styles.searchItem}>
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
    <>
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
                className={`${styles.searchContainer} ${
                  isSearchOpen ? styles.active : ""
                }`}
              >
                <button
                  className={styles.headerSearchBtn}
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
      {isSearchOpen && (
        <div
          className={styles.searchOverlay}
          onClick={handleSearchOverlayClick}
        >
          <div className={styles.searchModal}>
            <div className={styles.searchForm} ref={searchRef}>
              <input
                type="text"
                className={styles.searchInput}
                onChange={onSearchChange}
                value={searchQuery}
                placeholder="Поиск..."
                onClick={(e) => e.stopPropagation()}
              />
              {isNull(foundItems) ? null : (
                <div
                  className={styles.itemContainer}
                  onClick={(e) => e.stopPropagation()}
                >
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
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
