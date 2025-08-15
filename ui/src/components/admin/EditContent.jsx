import { useState } from "react";
import styles from "./EditContent.module.css";
import cardData from "../../data/cardData";
import { CategoryCard } from "./CategoryCard";
import { useEffect } from "react";
import { api } from "../../api";
import { Partner } from "./Partner";
import { Promo } from "./Promo";
import { Product } from "./Product";
import { useAuth } from "../../context/AuthContext";
import { Admin } from "./Admin";

function levelFromType(type) {
  switch (type) {
    case "firstLevel":
      return 1;
    case "secondLevel":
      return 2;
    case "thirdLevel":
      return 3;
  }
  return undefined;
}

export const EditContent = () => {
  const [type, setType] = useState("firstLevel");
  const [selected, setSelected] = useState(undefined);
  const [items, setItems] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for burger menu
  const [filter, setFilter] = useState("");
  const { auth } = useAuth();

  const onLinkClick = (t) => {
    if (type === t) {
      return;
    }
    setType(t);
    setFilter("");
    setSelected(undefined);
    setItems([]);
    // Закрываем меню после выбора пункта на мобильных
    setIsMenuOpen(false);
  };

  useEffect(() => {
    ({ selected, type });
    if (selected) {
      return;
    }
    switch (type) {
      case "firstLevel":
        api.getCategoriesByLevel(1).then((cats) => setItems(cats.data));
        return;
      case "secondLevel":
        api.getCategoriesByLevel(2).then((cats) => setItems(cats.data));
        return;
      case "thirdLevel":
        api.getCategoriesByLevel(3).then((cats) => setItems(cats.data));
        return;
      case "items":
        api.getItems().then((response) => setItems(response.data));
        return;
      case "partners":
        api.getPartners().then((response) => setItems(response.data));
        return;
      case "promos":
        api.getPromos().then((response) => setItems(response.data));
        return;
      case "admins":
        api
          .getAdmins(auth)
          .then((response) => {
            if (response.error) {
              alert("У вас нет доступа");
              onLinkClick("partners");
            } else {
              setItems(response.data);
            }
          })
          .catch((error) => {
            alert(error);
            onLinkClick("partners");
          });
        return;
    }
  }, [type, selected, auth]);

  const categoryFilter = (category) => {
    const lcFilter = filter?.toLowerCase();
    return !lcFilter || category.name.toLowerCase().includes(lcFilter);
  };

  const productFilter = (product) => {
    const lcFilter = filter?.toLowerCase();
    return (
      !lcFilter ||
      product.name.toLowerCase().includes(lcFilter) ||
      product.article.toLowerCase().includes(lcFilter) ||
      product.description.toLowerCase().includes(lcFilter)
    );
  };

  const promosFilter = (promo) => {
    const lcFilter = filter?.toLowerCase();
    return !lcFilter || promo.name.toLowerCase().includes(lcFilter);
  };

  const partnersFilter = (partner) => {
    const lcFilter = filter?.toLowerCase();
    return (
      !lcFilter ||
      partner.name.toLowerCase().includes(lcFilter) ||
      partner.country.toLowerCase().includes(lcFilter) ||
      partner.description.toLowerCase().includes(lcFilter)
    );
  };

  const adminsFilter = (admin) => {
    const lcFilter = filter?.toLowerCase();
    return !lcFilter || admin.login.toLowerCase().includes(lcFilter);
  };

  const renderItems = () => {
    const renderItem = (item) => (
      <div
        key={item.id}
        className={styles.item}
        onClick={() => setSelected(item.id)}
      >
        {item.index + 1}. {item.name}
      </div>
    );

    switch (type) {
      case "firstLevel":
      case "secondLevel":
      case "thirdLevel":
        return items
          .filter(categoryFilter)
          .map((item, index) => renderItem({ ...item, index }));
      case "items":
        return items
          .filter(productFilter)
          .map((item, index) => renderItem({ ...item, index }));
      case "promos":
        return items
          .filter(promosFilter)
          .map((item, index) => renderItem({ ...item, index }));
      case "partners":
        return items
          .filter(partnersFilter)
          .map((item, index) => renderItem({ ...item, index }));
      case "admins":
        return items
          .filter(adminsFilter)
          .map((item, index) =>
            renderItem({ ...item, id: item.login, name: item.login, index })
          );
    }
  };

  const onClose = () => setSelected(undefined);

  const renderSelected = () => {
    const id = selected === "new" ? undefined : selected;
    switch (type) {
      case "firstLevel":
      case "secondLevel":
      case "thirdLevel":
        return (
          <CategoryCard
            category={id}
            level={levelFromType(type)}
            onClose={onClose}
          />
        );
      case "items":
        const artciles = items.map((item) => item.article);
        return <Product data={id} onClose={onClose} articles={artciles} />;
      case "partners":
        return <Partner data={id} onClose={onClose} />;
      case "promos":
        return <Promo data={id} onClose={onClose} />;
      case "admins":
        return <Admin data={id} onClose={onClose} />;
    }
  };

  const getSelectedClassName = (t) => {
    return t === type ? styles.selected : "";
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={styles.container}>
      {/* Мобильная кнопка бургера вынесена из навигации */}
      <button
        className={`${styles.burger} ${isMenuOpen ? styles.burgerOpen : ""}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`${styles.navigation} ${isMenuOpen ? styles.open : ""}`}>
        <div className={styles.mobileHeader}>
          <h2>Меню админ панели</h2>
        </div>
        <div className={styles.navHeader}>Меню админ панели</div>
        <div
          className={`${styles.link} ${getSelectedClassName("firstLevel")}`}
          onClick={(e) => onLinkClick("firstLevel")}
        >
          Добавить категории
        </div>
        <div
          className={`${styles.link} ${getSelectedClassName("secondLevel")}`}
          onClick={(e) => onLinkClick("secondLevel")}
        >
          Добавить под(категории)
        </div>
        <div
          className={`${styles.link} ${getSelectedClassName("thirdLevel")}`}
          onClick={(e) => onLinkClick("thirdLevel")}
        >
          Добавить Под*2(категории)
        </div>
        <div
          className={`${styles.link} ${getSelectedClassName("items")}`}
          onClick={(e) => onLinkClick("items")}
        >
          Продукты
        </div>
        <div
          className={`${styles.link} ${getSelectedClassName("promos")}`}
          onClick={(e) => onLinkClick("promos")}
        >
          Акции
        </div>
        <div
          className={`${styles.link} ${getSelectedClassName("partners")}`}
          onClick={(e) => onLinkClick("partners")}
        >
          Партнеры
        </div>
        <div
          className={`${styles.link} ${getSelectedClassName("admins")}`}
          onClick={(e) => onLinkClick("admins")}
        >
          Админы
        </div>
      </div>

      <div className={styles.content}>
        {selected ? (
          renderSelected()
        ) : (
          <>
            <input
              className={styles.filter}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <div className={styles.items}>
              {renderItems()}
              <div className={styles.item} onClick={() => setSelected("new")}>
                Добавить
              </div>
            </div>
          </>
        )}
      </div>

      {/* Overlay для закрытия меню при клике вне его */}
      {isMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

// import { useState } from "react";
// import styles from "./EditContent.module.css";
// import cardData from "../../data/cardData";
// import { CategoryCard } from "./CategoryCard";
// import { useEffect } from "react";
// import { api } from "../../api";
// import { Partner } from "./Partner";
// import { Promo } from "./Promo";
// import { Product } from "./Product";

// function levelFromType(type) {
//   switch (type) {
//     case "firstLevel":
//       return 1;
//     case "secondLevel":
//       return 2;
//     case "thirdLevel":
//       return 3;
//   }
//   return undefined;
// }

// export const EditContent = () => {
//   const [type, setType] = useState("firstLevel");
//   const [selected, setSelected] = useState(undefined);
//   const [items, setItems] = useState([]);

//   const [filter, setFilter] = useState("");

//   const onLinkClick = (e, t) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (type === t) {
//       return;
//     }
//     setType(t);
//     setFilter("");
//     setSelected(undefined);
//     setItems([]);
//   };

//   useEffect(() => {
//     if (selected) {
//       return;
//     }
//     switch (type) {
//       case "firstLevel":
//         api.getCategoriesByLevel(1).then((cats) => setItems(cats.data));
//         return;
//       case "secondLevel":
//         api.getCategoriesByLevel(2).then((cats) => setItems(cats.data));
//         return;
//       case "thirdLevel":
//         api.getCategoriesByLevel(3).then((cats) => setItems(cats.data));
//         return;
//       case "items":
//         api.getItems().then((response) => setItems(response.data));
//         return;
//       case "partners":
//         api.getPartners().then((response) => setItems(response.data));
//         return;
//       case "promos":
//         api.getPromos().then((response) => setItems(response.data));
//         return;
//     }
//   }, [type, selected]);

//   const categoryFilter = (category) => {
//     const lcFilter = filter?.toLowerCase();
//     return !lcFilter || category.name.toLowerCase().includes(lcFilter);
//   };

//   const productFilter = (product) => {
//     const lcFilter = filter?.toLowerCase();
//     return (
//       !lcFilter ||
//       product.name.toLowerCase().includes(lcFilter) ||
//       product.article.toLowerCase().includes(lcFilter) ||
//       product.description.toLowerCase().includes(lcFilter)
//     );
//   };

//   const promosFilter = (promo) => {
//     const lcFilter = filter?.toLowerCase();
//     return !lcFilter || promo.name.toLowerCase().includes(lcFilter);
//   };

//   const partnersFilter = (partner) => {
//     const lcFilter = filter?.toLowerCase();
//     return (
//       !lcFilter ||
//       partner.name.toLowerCase().includes(lcFilter) ||
//       partner.country.toLowerCase().includes(lcFilter) ||
//       partner.description.toLowerCase().includes(lcFilter)
//     );
//   };

//   const renderItems = () => {
//     const renderItem = (item) => (
//       <div
//         key={item.id}
//         className={styles.item}
//         onClick={() => setSelected(item.id)}
//       >
//         {item.index + 1}. {item.name}
//       </div>
//     );

//     switch (type) {
//       case "firstLevel":
//       case "secondLevel":
//       case "thirdLevel":
//         return items
//           .filter(categoryFilter)
//           .map((item, index) => renderItem({ ...item, index }));
//       case "items":
//         return items
//           .filter(productFilter)
//           .map((item, index) => renderItem({ ...item, index }));
//       case "promos":
//         return items
//           .filter(promosFilter)
//           .map((item, index) => renderItem({ ...item, index }));
//       case "partners":
//         return items
//           .filter(partnersFilter)
//           .map((item, index) => renderItem({ ...item, index }));
//     }
//   };

//   const onClose = () => setSelected(undefined);

//   const renderSelected = () => {
//     const id = selected === "new" ? undefined : selected;
//     switch (type) {
//       case "firstLevel":
//       case "secondLevel":
//       case "thirdLevel":
//         return (
//           <CategoryCard
//             category={id}
//             level={levelFromType(type)}
//             onClose={onClose}
//           />
//         );
//       case "items":
//         return <Product data={id} onClose={onClose} />;
//       case "partners":
//         return <Partner data={id} onClose={onClose} />;
//       case "promos":
//         return <Promo data={id} onClose={onClose} />;
//     }
//   };

//   const getSelectedClassName = (t) => {
//     return t === type ? styles.selected : "";
//   };

//   return (

//     <div className={styles.container}>
//       <div className={styles.navigation}>
//         Меню админ панели
//         <div
//           className={`${styles.link} ${getSelectedClassName("firstLevel")}`}
//           onClick={(e) => onLinkClick(e, "firstLevel")}
//         >
//           Добавить категории
//         </div>
//         <div
//           className={`${styles.link} ${getSelectedClassName("secondLevel")}`}
//           onClick={(e) => onLinkClick(e, "secondLevel")}
//         >
//           Добавить под(категории)
//         </div>
//         <div
//           className={`${styles.link} ${getSelectedClassName("thirdLevel")}`}
//           onClick={(e) => onLinkClick(e, "thirdLevel")}
//         >
//           Добавить Под*2(категории)
//         </div>
//         <div
//           className={`${styles.link} ${getSelectedClassName("items")}`}
//           onClick={(e) => onLinkClick(e, "items")}
//         >
//           Продукты
//         </div>
//         <div
//           className={`${styles.link} ${getSelectedClassName("promos")}`}
//           onClick={(e) => onLinkClick(e, "promos")}
//         >
//           Акции
//         </div>
//         <div
//           className={`${styles.link} ${getSelectedClassName("partners")}`}
//           onClick={(e) => onLinkClick(e, "partners")}
//         >
//           Партнеры
//         </div>
//       </div>
//       <div className={styles.content}>
//         {selected ? (
//           renderSelected()
//         ) : (
//           <>
//             <input
//               className={styles.filter}
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//             />
//             <div className={styles.items}>
//               {renderItems()}
//               <div className={styles.item} onClick={() => setSelected("new")}>
//                 Добавить
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };
