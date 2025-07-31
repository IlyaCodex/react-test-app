import { useState } from "react";
import styles from "./EditContent.module.css";
import cardData from "../../data/cardData";
import { CategoryCard } from "./CategoryCard";
import { useEffect } from "react";
import { api } from "../../api";
import { Partner } from "./Partner";
import { Promo } from "./Promo";
import { Product } from "./Product";

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

  const [filter, setFilter] = useState("");

  const onLinkClick = (e, t) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === t) {
      return;
    }
    setType(t);
    setFilter("");
    setSelected(undefined);
    setItems([]);
  };

  useEffect(() => {
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
    }
  }, [type, selected]);

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
        return <Product data={id} onClose={onClose} />;
      case "partners":
        return <Partner data={id} onClose={onClose} />;
      case "promos":
        return <Promo data={id} onClose={onClose} />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <div
          className={styles.link}
          onClick={(e) => onLinkClick(e, "firstLevel")}
        >
          Первый уровень
        </div>
        <div
          className={styles.link}
          onClick={(e) => onLinkClick(e, "secondLevel")}
        >
          Второй уровень
        </div>
        <div
          className={styles.link}
          onClick={(e) => onLinkClick(e, "thirdLevel")}
        >
          Третий уровень
        </div>
        <div className={styles.link} onClick={(e) => onLinkClick(e, "items")}>
          Продукты
        </div>
        <div className={styles.link} onClick={(e) => onLinkClick(e, "promos")}>
          Акции
        </div>
        <div
          className={styles.link}
          onClick={(e) => onLinkClick(e, "partners")}
        >
          Партнеры
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
    </div>
  );
};
