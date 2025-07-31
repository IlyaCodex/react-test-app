import { useState, useRef, useEffect } from "react";
import styles from "./Card.module.css";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { convertFiles } from "./Utils";
import { isEmptyId } from "./Utils";

export const Product = ({ data, onClose }) => {
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

  const { auth } = useAuth();

  const imageInput = useRef(null);

  const onImageSelect = async (e) => {
    const rawFiles = await convertFiles(e.target.files ?? []);
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
    if (!isEmptyId(data)) {
      api.getItemById(data).then((response) => {
        const product = response.data;
        setName(product.name);
        setDescription(product.description);
        setPosition(product.position);
        setArticle(product.article);
        setDescription(product.description);
        setManufacturer(product.manufacturer);
        setAmount(product.amount);
        setInStock(product.inStock);
        setHasPromo(product.hasPromo);

        Promise.all(
          product.images?.map((imageId) =>
            api.getItemImage(imageId).then((res) => res.data)
          )
        ).then((images) => setImages(images));
      });
    }
  }, [data]);

  const handleSave = () => {
    const newData = {
      id: data || undefined,
      name,
      description,
      images,
      position,
      country,
    };
    api.savePartner(auth, newData).then(onClose);
  };

  const handleDelete = () => {
    api.deletePartner(auth, data).then(onClose);
  };

  const removeImage = (image) => {
    setImages([...images.filter((img) => img !== image)]);
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
        <input value={article} onChange={(e) => setArticle(e.target.value)} />
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

      <div className={styles.actions}>
        <button onClick={handleSave} className={styles.save}>
          Сохранить
        </button>
        {!isEmptyId(data) && (
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
