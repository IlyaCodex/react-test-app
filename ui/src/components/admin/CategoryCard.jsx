// import { useState, useEffect } from "react";
// import styles from "./Card.module.css";
// import { api } from "../../api";
// import { useAuth } from "../../context/AuthContext";
// import { isNull, nonNull } from "./Utils";
// import { Sketch } from "@uiw/react-color";

// function loadCategory(category, level) {
//   if (isNull(category)) {
//     return Promise.resolve({
//       level,
//       name: "",
//       position: 1,
//       parents: [],
//       children: [],
//       items: [],
//     });
//   }
//   return api.getCategoryById(category).then((json) => json.data);
// }

// function loadAvailableCategories(level) {
//   const promises = [];
//   if (level > 1) {
//     promises.push(
//       api.getCategoriesByLevel(level - 1).then((json) => json.data)
//     );
//   } else {
//     promises.push(Promise.resolve([]));
//   }

//   if (level < 3) {
//     promises.push(
//       api.getCategoriesByLevel(level + 1).then((json) => json.data)
//     );
//   } else {
//     promises.push(Promise.resolve([]));
//   }

//   return Promise.all(promises);
// }

// function loadItems() {
//   return api.getItems();
// }

// export const CategoryCard = ({ category: categoryId, level, onClose }) => {
//   const { auth } = useAuth();
//   const [name, setName] = useState("");
//   const [position, setPosition] = useState(1);
//   const [parentCategories, setParentCategories] = useState([]);
//   const [childCategories, setChildCategories] = useState([]);
//   const [items, setItems] = useState([]);
//   const [color, setColor] = useState("");
//   const [description, setDescription] = useState("");

//   const [availableParentCategories, setAvailableParentCategories] = useState(
//     []
//   );
//   const [availableChildCategories, setAvailableChildCategories] = useState([]);
//   const [availableItems, setAvailableItems] = useState([]);

//   useEffect(() => {
//     loadCategory(categoryId, level).then((cat) => {
//       setName(cat.name);
//       setPosition(cat.position);
//       setParentCategories(cat.parents);
//       setChildCategories(cat.children);
//       setColor(cat.color);
//       setDescription(cat.description);
//       loadItems().then((res) => {
//         setAvailableItems(res.data ?? []);
//         setItems(
//           cat.items
//             .map((itemId) =>
//               (res.data ?? []).find((item) => item.id === itemId)
//             )
//             .filter(nonNull)
//         );
//       });
//     });
//     loadAvailableCategories(level).then(([parent, child]) => {
//       setAvailableChildCategories(child);
//       setAvailableParentCategories(parent);
//     });
//   }, [categoryId]);

//   const onChangeParent = (e) => {
//     e.preventDefault();
//     const id = e.target.value;
//     if (id) {
//       setParentCategories([...parentCategories, +id]);
//     }
//     e.target.value = "disabled";
//   };

//   const onChangeChild = (e) => {
//     e.preventDefault();
//     const id = e.target.value;
//     if (id) {
//       setChildCategories([...childCategories, +id]);
//     }
//     e.target.value = "disabled";
//   };

//   const onChangeItems = (e) => {
//     e.preventDefault();
//     const id = e.target.value;
//     if (id) {
//       const newItem = availableItems.find((item) => item.id.toString() === id);
//       if (newItem) {
//         setItems([...items, newItem]);
//       }
//     }
//     e.target.value = "disabled";
//   };

//   const removeParent = (parent) => {
//     setParentCategories([...parentCategories.filter((p) => p !== parent)]);
//   };

//   const removeChild = (child) => {
//     setChildCategories([...childCategories.filter((c) => c !== child)]);
//   };

//   const removeItem = (item) => {
//     setItems([...items.filter((c) => c !== item)]);
//   };

//   const onSave = () => {
//     api.saveCategory(auth, {
//       id: categoryId,
//       name,
//       level,
//       position,
//       color,
//       description,
//       parents: parentCategories.filter(nonNull),
//       children: childCategories.filter(nonNull),
//       items: items.map((item) => item.id),
//     });
//     onClose();
//   };

//   const onDelete = () => {
//     api.deleteCategory(auth, categoryId);
//     onClose();
//   };

//   return (
//     <div className={styles.modalOverlay} onClick={onClose}>
//       <div
//         className={styles.modalContainer}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className={styles.modalHeader}>
//           <h2 className={styles.modalTitle}>
//             {isNull(categoryId)
//               ? "Создать новую категорию"
//               : "Редактировать категорию"}
//           </h2>
//           <button className={styles.closeButton} onClick={onClose}>
//             ×
//           </button>
//         </div>

//         <div className={styles.modalContent}>
//           <div className={styles.imagePlaceholder}>
//             <div className={styles.imageIcon}>
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//                 <path
//                   d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
//                   fill="currentColor"
//                 />
//               </svg>
//             </div>
//           </div>

//           <div className={styles.formSection}>
//             <label className={styles.fieldLabel}>
//               Название категории
//               <span className={styles.optional}>Обязательно</span>
//             </label>
//             <input
//               className={styles.textInput}
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Введите название категории"
//             />
//           </div>

//           <div className={styles.formSection}>
//             <label className={styles.fieldLabel}>Описание</label>
//             <textarea
//               className={styles.textArea}
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Введите описание"
//             />
//           </div>

//           <div className={styles.formRow}>
//             <div className={styles.formSection}>
//               <label className={styles.fieldLabel}>Позиция</label>
//               <input
//                 className={styles.numberInput}
//                 type="number"
//                 value={position}
//                 min="1"
//                 step="1"
//                 onChange={(e) => setPosition(e.target.value)}
//               />
//             </div>

//             <div className={styles.formSection}>
//               <label className={styles.fieldLabel}>Цвет</label>
//               <div className={styles.colorPickerWrapper}>
//                 <Sketch
//                   color={color || undefined}
//                   onChange={(color) => setColor(color.hex)}
//                 />
//               </div>
//             </div>
//           </div>

//           {level > 1 && (
//             <div className={styles.categorySection}>
//               <label className={styles.sectionTitle}>
//                 Создать Подкатегории
//               </label>
//               <div className={styles.categoryGrid}>
//                 {parentCategories
//                   .map((parentId) =>
//                     availableParentCategories.find(
//                       (parent) => parent.id === parentId
//                     )
//                   )
//                   .filter((parent) => !!parent)
//                   .map((parent, index) => (
//                     <div
//                       key={parent.id}
//                       className={styles.categoryPill}
//                       onClick={() => removeParent(parent.id)}
//                     >
//                       {parent.name}
//                     </div>
//                   ))}
//                 <div className={styles.addButton}>
//                   <select
//                     className={styles.hiddenSelect}
//                     value={"disabled"}
//                     onChange={onChangeParent}
//                   >
//                     <option value={"disabled"}>Добавить</option>
//                     {availableParentCategories
//                       .filter(
//                         (parent) =>
//                           !parentCategories.some(
//                             (parentId) => parent.id === parentId
//                           )
//                       )
//                       .map((parent) => (
//                         <option key={parent.id} value={parent.id}>
//                           {parent.name}
//                         </option>
//                       ))}
//                   </select>
//                   <span className={styles.plusIcon}>+</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {level < 3 && (
//             <div className={styles.categorySection}>
//               <label className={styles.sectionTitle}>
//                 Создать ПодПодкатегории
//               </label>
//               <div className={styles.categoryGrid}>
//                 {childCategories
//                   .map((childId) =>
//                     availableChildCategories.find(
//                       (child) => child.id === childId
//                     )
//                   )
//                   .filter((child) => !!child)
//                   .map((child, index) => (
//                     <div
//                       key={child.id}
//                       className={styles.categoryPill}
//                       onClick={() => removeChild(child.id)}
//                     >
//                       {child.name}
//                     </div>
//                   ))}
//                 <div className={styles.addButton}>
//                   <select
//                     className={styles.hiddenSelect}
//                     value={"disabled"}
//                     onChange={onChangeChild}
//                   >
//                     <option value={"disabled"}>Добавить</option>
//                     {availableChildCategories
//                       .filter(
//                         (child) =>
//                           !childCategories.some(
//                             (childId) => child.id === childId
//                           )
//                       )
//                       .map((child) => (
//                         <option key={child.id} value={child.id}>
//                           {child.name}
//                         </option>
//                       ))}
//                   </select>
//                   <span className={styles.plusIcon}>+</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className={styles.categorySection}>
//             <label className={styles.sectionTitle}>Продукты</label>
//             <div className={styles.categoryGrid}>
//               {items.map((item) => (
//                 <div
//                   key={item.id}
//                   className={styles.categoryPill}
//                   onClick={() => removeItem(item)}
//                 >
//                   {item.name}
//                 </div>
//               ))}
//               <div className={styles.addButton}>
//                 <select
//                   className={styles.hiddenSelect}
//                   value={"disabled"}
//                   onChange={onChangeItems}
//                 >
//                   <option value={"disabled"}>Добавить</option>
//                   {availableItems
//                     .filter((item) => !items.some((i) => i.id === item.id))
//                     .map((item) => (
//                       <option key={item.id} value={item.id}>
//                         {item.name}
//                       </option>
//                     ))}
//                 </select>
//                 <span className={styles.plusIcon}>+</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className={styles.modalActions}>
//           <button onClick={onSave} className={styles.primaryButton}>
//             Готово
//           </button>
//           {!isNull(categoryId) && (
//             <button onClick={onDelete} className={styles.dangerButton}>
//               Удалить
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };


// Прошлый код админки
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
