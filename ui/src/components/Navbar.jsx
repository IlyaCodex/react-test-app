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
import styles from "./Navbar.module.css";
import { FavoritesSidebar } from "./FavoritesSidebar";
// import CheckoutModal from "./CheckoutModal";
import CheckoutModal from "./CheckoutModalHeader";
import { useDebounce } from "../hooks/debounce";
import { api } from "../api";
import { isNull, chooseImage, nonNull } from "./admin/Utils";
import { CartContext } from "../context/CartContext";
import { useItemModal } from "../context/ItemModalContext";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [foundItems, setFoundItems] = useState(undefined);
  const [foundImages, setFoundImages] = useState([]);
  const { addItems, openCart } = useContext(CartContext);
  const { onOpenItemModal } = useItemModal();
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
    openCart();
  };

  const closeMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
  };

  const handleFavoritesClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavoritesOpen(true);
  };

  const handleFavoritesClose = () => {
    setIsFavoritesOpen(false);
  };

  const onToCart = () => {
    setIsFavoritesOpen(false);
    openCart();
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const onIncrement = (e, item) => {
    e.stopPropagation();

    item.count = item.count + 1;
    setFoundItems([...foundItems]);
  };

  const onDecrement = (e, item) => {
    e.stopPropagation();

    if (item.count <= 0) {
      return;
    }
    item.count = item.count - 1;
    setFoundItems([...foundItems]);
  };

  const toCart = (e, item) => {
    e.stopPropagation();
    addItems(...Array.from({ length: item.count }).map(() => item));
    setIsSearchOpen(false); //
    openCart(); //
  };

  const openItemModal = (e, item) => {
    onOpenItemModal(item);
    setIsSearchOpen(false);
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
      <div key={category.id} className={styles.searchItem}>
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
  const renderFoundItem = (item) => (
    <div key={item.id} className={styles.searchItem}>
      <div className={styles.itemInfo} onClick={(e) => openItemModal(e, item)}>
        <img
          alt="Картинка"
          src={
            foundImages.find((image) => image.id === chooseImage(item))?.data
          }
        />
        <div className={styles.name}>{item.name}</div>
      </div>
      <div className={styles.itemButtons}>
        <div className={styles.counter}>
          <button onClick={(e) => onDecrement(e, item)}>-</button>
          <div>{item.count}</div>
          <button onClick={(e) => onIncrement(e, item)}>+</button>
        </div>
        <button className={styles.toCart} onClick={(e) => toCart(e, item)}>
          В корзину
        </button>
      </div>
    </div>
  );

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
              <button className={styles.modalCloseBtn} onClick={closeMenu}>
                ×
              </button>
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
                      return renderFoundItem(item);
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
