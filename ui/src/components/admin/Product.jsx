import { useState, useRef, useEffect } from "react";
import styles from "./Card.module.css";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { convertFiles, nonNull } from "./Utils";
import { isNull } from "./Utils";

const generateArticle = (articles) => {
  let newArticle;
  const fixedPart = "11701";
  do {
    const randomPart = Math.floor(Math.random() * 1000000);
    newArticle = `${fixedPart}${randomPart}`;
  } while (articles.includes(newArticle));
  return newArticle;
};

export const Product = ({ data, onClose, articles }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [position, setPosition] = useState(1);
  const [article, setArticle] = useState("");
  const [description, setDescription] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [amount, setAmount] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [hasPromo, setHasPromo] = useState(false);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [attributeName, setAttributeName] = useState("");
  const [attributeValue, setAttributeValue] = useState("");
  const [recomended, setRecomended] = useState([]);

  const { auth } = useAuth();

  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [availableSubSubcategories, setAvailableSubSubcategories] = useState(
    []
  );
  const [availableRecomended, setAvailableRecomended] = useState([]);

  const imageInput = useRef(null);

  const onImageSelect = async (e) => {
    const rawFiles = (await convertFiles(e.target.files ?? [])).filter(
      (file) => !images.some((image) => image.data === file)
    );
    const biggestPosition = (images ?? []).reduce(
      (biggest, image) => Math.max(biggest, image.position),
      0
    );
    const files = rawFiles.map((file, index) => ({
      data: file,
      position: biggestPosition + 1 + index,
    }));
    const newImages = [...images, ...files];
    setImages(newImages);
  };

  useEffect(() => {
    if (!isNull(data)) {
      api.getItemById(data).then((response) => {
        const product = response.data;
        setName(product.name);
        setPrice(product.price);
        setDescription(product.description);
        setPosition(product.position);
        setArticle(product.article);
        setDescription(product.description);
        setManufacturer(product.manufacturer);
        setAmount(product.amount);
        setInStock(product.in_stock);
        setHasPromo(product.has_promo);
        setCategories(product.categories);
        setAttributes(product.attributes);
        Promise.all(
          product.images?.map((imageId) =>
            api.getItemImage(imageId).then((res) => res.data)
          )
        ).then((images) => setImages(images));
      });
      api
        .getRecomendedItems(data)
        .then((response) =>
          setRecomended((response.data ?? []).map((rec) => rec.id))
        );
    } else if (!article) {
      // Генерация артикула для нового продукта
      setArticle(generateArticle(articles));
    }

    api
      .getItems()
      .then((response) => setAvailableRecomended(response.data ?? []));

    // Загружаем категории по уровням отдельно
    Promise.all([
      api.getCategoriesByLevel(1),
      api.getCategoriesByLevel(2),
      api.getCategoriesByLevel(3),
    ]).then((responses) => {
      setAvailableCategories(responses[0].data ?? []);
      setAvailableSubcategories(responses[1].data ?? []);
      setAvailableSubSubcategories(responses[2].data ?? []);
    });
  }, [data]);

  const handleSave = () => {
    const newData = {
      id: data || undefined,
      price,
      name,
      description,
      images,
      position,
      manufacturer,
      inStock,
      hasPromo,
      categories,
      amount,
      article,
      attributes,
      recomended,
    };
    api.saveItem(auth, newData).then(onClose);
  };

  const handleDelete = () => {
    api.deleteItem(auth, data).then(onClose);
  };

  const removeImage = (image) => {
    setImages([...images.filter((img) => img !== image)]);
  };

  const onChangeCategory = (e) => {
    e.preventDefault();
    const id = e.target.value;
    if (id) {
      setCategories([...categories, +id]);
    }
    e.target.value = "disabled";
  };

  const removeCategory = (category) => {
    setCategories([...categories.filter((c) => c !== category)]);
  };

  const onChangeRecomended = (e) => {
    e.preventDefault();
    const id = e.target.value;
    if (id) {
      setRecomended([...recomended, +id]);
    }
    e.target.value = "disabled";
  };

  const removeRecomended = (rec) => {
    setRecomended([...recomended.filter((c) => c !== rec)]);
  };

  const addAttribute = () => {
    if (
      attributeName &&
      !attributes.some((attribute) => attribute.name === attributeName)
    ) {
      setAttributes([
        ...attributes,
        { name: attributeName, value: attributeValue },
      ]);
    }
  };

  const removeAttribute = (att) => {
    setAttributes(attributes.filter((a) => a !== att));
  };

  // Функция для получения всех категорий
  const getAllCategories = () => {
    return [
      ...availableCategories,
      ...availableSubcategories,
      ...availableSubSubcategories,
    ];
  };

  // Функция для получения категорий по уровню
  const getCategoriesByLevel = (level) => {
    switch (level) {
      case 1:
        return availableCategories;
      case 2:
        return availableSubcategories;
      case 3:
        return availableSubSubcategories;
      default:
        return [];
    }
  };

  return (
    <div className={styles.container}>
      <h2>Добавить/Редактировать Продукт</h2>
      <label className={styles.textInput}>
        Название*:
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className={styles.position}>
        Цена:
        <input
          type="number"
          value={price}
          min="0"
          step="1"
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>

      <label className={styles.position}>
        Позиция:
        <input
          type="number"
          value={position}
          min="1"
          step="1"
          onChange={(e) => setPosition(e.target.value)}
        />
      </label>

      <label className={styles.textInput}>
        Артикул:
        <input
          value={article}
          onChange={(e) => setArticle(e.target.value)}
          disabled // Поле только для чтения
        />
      </label>

      <label className={styles.textInput}>
        Производитель:
        <input
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
        />
      </label>

      <label className={styles.textInput}>
        Описание:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className={styles.position}>
        Количество:
        <input
          type="number"
          value={amount}
          min="0"
          step="1"
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <label className={styles.position}>
        В наличии:
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
        />
      </label>

      <label className={styles.position}>
        По акции:
        <input
          type="checkbox"
          checked={hasPromo}
          onChange={(e) => setHasPromo(e.target.checked)}
        />
      </label>

      <div className={styles.images}>
        <input
          accept="image/*"
          type="file"
          multiple
          ref={imageInput}
          hidden
          onChange={onImageSelect}
        />
        {images
          .sort((a, b) => a.position - b.position)
          .map((image, index) => (
            <img
              onClick={() => removeImage(image)}
              key={index}
              className={styles.image}
              src={image.data}
              alt="your image"
            />
          ))}
        <div
          className={styles.imageButton}
          onClick={() => imageInput.current?.click()}
        >
          <span>&#x2b;</span>
        </div>
      </div>

      <label>
        Категории:
        <div className={styles.categories}>
          {categories
            .map((category) =>
              availableCategories.find((available) => available.id === category)
            )
            .filter((category) => !!category)
            .map((category) => (
              <div
                key={category.id}
                onClick={() => removeCategory(category.id)}
                className={styles.category}
              >
                {category.name}
              </div>
            ))}
          <select value={"disabled"} onChange={onChangeCategory}>
            <option value={"disabled"} selected disabled>
              Добавить категорию
            </option>
            {availableCategories
              .filter(
                (category) =>
                  !categories.some((categoryId) => category.id === categoryId)
              )
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
      </label>

      <label>
        Подкатегории:
        <div className={styles.categories}>
          {categories
            .map((category) =>
              availableSubcategories.find(
                (available) => available.id === category
              )
            )
            .filter((category) => !!category)
            .map((category) => (
              <div
                key={category.id}
                onClick={() => removeCategory(category.id)}
                className={styles.category}
              >
                {category.name}
              </div>
            ))}
          <select value={"disabled"} onChange={onChangeCategory}>
            <option value={"disabled"} selected disabled>
              Добавить подкатегорию
            </option>
            {availableSubcategories
              .filter(
                (category) =>
                  !categories.some((categoryId) => category.id === categoryId)
              )
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
      </label>

      <label>
        Подподкатегории:
        <div className={styles.categories}>
          {categories
            .map((category) =>
              availableSubSubcategories.find(
                (available) => available.id === category
              )
            )
            .filter((category) => !!category)
            .map((category) => (
              <div
                key={category.id}
                onClick={() => removeCategory(category.id)}
                className={styles.category}
              >
                {category.name}
              </div>
            ))}
          <select value={"disabled"} onChange={onChangeCategory}>
            <option value={"disabled"} selected disabled>
              Добавить подподкатегорию
            </option>
            {availableSubSubcategories
              .filter(
                (category) =>
                  !categories.some((categoryId) => category.id === categoryId)
              )
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
      </label>

      <label>
        Рекомендации:
        <div className={styles.categories}>
          {recomended
            .map((rec) =>
              availableRecomended.find((available) => available.id === rec)
            )
            .filter(nonNull)
            .map((rec) => (
              <div
                key={rec.id}
                onClick={() => removeRecomended(rec.id)}
                className={styles.category}
              >
                {rec.name}
              </div>
            ))}
          <select value={"disabled"} onChange={onChangeRecomended}>
            <option value={"disabled"} selected disabled>
              Добавить
            </option>
            {availableRecomended
              .filter((rec) => !recomended.some((recId) => rec.id === recId))
              .map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.name}
                </option>
              ))}
          </select>
        </div>
      </label>

      <label>
        Аттрибуты:
        <div className={styles.attrInput}>
          <input
            value={attributeName}
            onChange={(e) => setAttributeName(e.target.value)}
          />
          <input
            value={attributeValue}
            onChange={(e) => setAttributeValue(e.target.value)}
          />
          <button onClick={addAttribute}>Добавить</button>
        </div>
        <div className={styles.attributes}>
          {attributes.map((att, index) => (
            <div key={index} className={styles.attribute}>
              {att.name}: {att.value}
              <button onClick={() => removeAttribute(att)}>Удалить</button>
            </div>
          ))}
        </div>
      </label>

      <div className={styles.actions}>
        <button onClick={handleSave} className={styles.save}>
          Сохранить
        </button>
        {!isNull(data) && (
          <button onClick={handleDelete} className={styles.delete}>
            Удалить
          </button>
        )}
        <button onClick={onClose} className={styles.cancel}>
          Отмена
        </button>
      </div>
    </div>
  );
};
