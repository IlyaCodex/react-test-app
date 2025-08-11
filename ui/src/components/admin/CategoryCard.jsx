import { useState, useRef, useMemo } from "react";
import styles from "./Card.module.css";
import cardData from "../../data/cardData";
import { api } from "../../api";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { isNull, nonNull } from "./Utils";
import { Sketch } from "@uiw/react-color";

function loadCategory(category, level) {
  if (isNull(category)) {
    return Promise.resolve({
      level,
      name: "",
      //   images: [],
      position: 1,
      parents: [],
      children: [],
      items: [],
    });
  }
  return api.getCategoryById(category).then((json) => json.data);
}

function loadAvailableCategories(level) {
  const promises = [];
  if (level > 1) {
    promises.push(
      api.getCategoriesByLevel(level - 1).then((json) => json.data)
    );
  } else {
    promises.push(Promise.resolve([]));
  }

  if (level < 3) {
    promises.push(
      api.getCategoriesByLevel(level + 1).then((json) => json.data)
    );
  } else {
    promises.push(Promise.resolve([]));
  }

  return Promise.all(promises);
}

function loadItems() {
  return api.getItems();
}

export const CategoryCard = ({ category: categoryId, level, onClose }) => {
  const { auth } = useAuth();
  const [name, setName] = useState("");
  //   const [images, setImages] = useState([]);
  const [position, setPosition] = useState(1);
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");

  const [availableParentCategories, setAvailableParentCategories] = useState(
    []
  );
  const [availableChildCategories, setAvailableChildCategories] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

  useEffect(() => {
    loadCategory(categoryId, level).then((cat) => {
      setName(cat.name);
      //   setImages(cat.images);
      setPosition(cat.position);
      setParentCategories(cat.parents);
      setChildCategories(cat.children);
      setColor(cat.color);
      setDescription(cat.description);
      loadItems().then((res) => {
        setAvailableItems(res.data ?? []);
        setItems(
          cat.items
            .map((itemId) =>
              (res.data ?? []).find((item) => item.id === itemId)
            )
            .filter(nonNull)
        );
      });
    });
    loadAvailableCategories(level).then(([parent, child]) => {
      setAvailableChildCategories(child);
      setAvailableParentCategories(parent);
    });
  }, [categoryId]);

  //   const onImageSelect = (e) => {
  //     for (const file of e.target.files ?? []) {
  //       images.push(file);
  //     }
  //     setImages([...images]);
  //   };

  const onChangeParent = (e) => {
    e.preventDefault();
    const id = e.target.value;
    if (id) {
      setParentCategories([...parentCategories, +id]);
    }
    e.target.value = "disabled";
  };

  const onChangeChild = (e) => {
    e.preventDefault();
    const id = e.target.value;
    if (id) {
      setChildCategories([...childCategories, +id]);
    }
    e.target.value = "disabled";
  };

  const onChangeItems = (e) => {
    e.preventDefault();
    const id = e.target.value;
    if (id) {
      const newItem = availableItems.find((item) => item.id.toString() === id);
      if (newItem) {
        setItems([...items, newItem]);
      }
    }
    e.target.value = "disabled";
  };

  const removeParent = (parent) => {
    setParentCategories([...parentCategories.filter((p) => p !== parent)]);
  };

  const removeChild = (child) => {
    setChildCategories([...childCategories.filter((c) => c !== child)]);
  };

  const removeItem = (item) => {
    setItems([...items.filter((c) => c !== item)]);
  };

  const onSave = () => {
    api.saveCategory(auth, {
      id: categoryId,
      name,
      level,
      position,
      color,
      description,
      //   images,
      parents: parentCategories.filter(nonNull),
      children: childCategories.filter(nonNull),
      items: items.map((item) => item.id),
    });
    onClose();
  };

  const onDelete = () => {
    api.deleteCategory(auth, categoryId);
    onClose();
  };

  return (
    <div className={styles.container}>
      <label className={styles.textInput}>
        Название*:{" "}
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className={styles.textInput}>
        Описание:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className={styles.position}>
        Позиция:{" "}
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={position}
          min="1"
          step="1"
          onChange={(e) => setPosition(e.target.value)}
        />
      </label>
      <label className={styles.colorPicker}>
        Цвет:
        <Sketch
          color={color || undefined}
          onChange={(color) => setColor(color.hex)}
        />
      </label>

      {level > 1 ? (
        <label>
          Родительские категории:{" "}
          <div className={styles.categories}>
            {parentCategories
              .map((parentId) =>
                availableParentCategories.find(
                  (parent) => parent.id === parentId
                )
              )
              .filter((parent) => !!parent)
              .map((parent) => (
                <div
                  onClick={() => removeParent(parent.id)}
                  className={styles.category}
                >
                  {parent.name}
                </div>
              ))}
            <select value={"disabled"} onChange={onChangeParent}>
              <option value={"disabled"} selected disabled>
                Добавить
              </option>
              {availableParentCategories
                .filter(
                  (parent) =>
                    !parentCategories.some((parentId) => parent.id === parentId)
                )
                .map((parent) => (
                  <option value={parent.id}>{parent.name}</option>
                ))}
            </select>
          </div>
        </label>
      ) : null}
      {level < 3 ? (
        <label>
          Потомственные категории:{" "}
          <div className={styles.categories}>
            {childCategories
              .map((childId) =>
                availableChildCategories.find((child) => child.id === childId)
              )
              .filter((child) => !!child)
              .map((child) => (
                <div
                  onClick={() => removeChild(child.id)}
                  className={styles.category}
                >
                  {child.name}
                </div>
              ))}
            <select value={"disabled"} onChange={onChangeChild}>
              <option value={"disabled"} selected disabled>
                Добавить
              </option>
              {availableChildCategories
                .filter(
                  (child) =>
                    !childCategories.some((childId) => child.id === childId)
                )
                .map((child) => (
                  <option value={child.id}>{child.name}</option>
                ))}
            </select>
          </div>
        </label>
      ) : null}
      <label>
        Продукты:{" "}
        <div className={styles.categories}>
          {items.map((item) => {
            return (
              <div
                onClick={() => removeItem(item)}
                className={styles.item}
                key={item.id}
              >
                {item.name}
              </div>
            );
          })}
          <select value={"disabled"} onChange={onChangeItems}>
            <option value={"disabled"} selected disabled>
              Добавить
            </option>
            {availableItems
              .filter((item) => !items.some((i) => i.id === item.id))
              .map((item) => (
                <option value={item.id}>{item.name}</option>
              ))}
          </select>
        </div>
      </label>
      <div className={styles.actions}>
        <div onClick={onSave} className={styles.save}>
          Сохранить
        </div>
        {!isNull(categoryId) && (
          <div onClick={onDelete} className={styles.delete}>
            Удалить
          </div>
        )}
        <div onClick={onClose} className={styles.cancel}>
          Отмена
        </div>
      </div>
    </div>
  );
};
