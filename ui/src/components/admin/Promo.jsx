import { useState, useRef, useEffect } from "react";
import styles from "./Card.module.css";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { convertFiles } from "./Utils";
import { isNull } from "./Utils";

export const Promo = ({ data, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [storyImages, setStoryImages] = useState([]);
  const [position, setPosition] = useState(1);

  const { auth } = useAuth();

  const imageInput = useRef(null);
  const storiesImageInput = useRef(null);

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

  const onStoriesImageSelect = async (e) => {
    const rawFiles = (await convertFiles(e.target.files ?? [])).filter(
      (file) => !images.some((image) => image.data === file)
    );
    const biggestPosition = (storyImages ?? []).reduce(
      (biggest, image) => Math.max(biggest, image.position),
      0
    );
    const files = rawFiles.map((file, index) => ({
      data: file,
      position: biggestPosition + 1 + index,
    }));
    const newStoriesImages = [...storyImages, ...files];
    setStoryImages(newStoriesImages);
  };

  useEffect(() => {
    if (!isNull(data)) {
      api.getPromoById(data).then((response) => {
        const promo = response.data;
        setName(promo.name);
        setDescription(promo.description);
        setPosition(promo.position);

        Promise.all(
          promo.images?.map((imageId) =>
            api.getPromoImage(imageId).then((res) => res.data)
          ) ?? []
        ).then((images) => setImages(images));

        Promise.all(
          promo.storyImages?.map((imageId) =>
            api.getPromoStoryImage(imageId).then((res) => res.data)
          ) ?? []
        ).then((storyImages) => setStoryImages(storyImages));
      });
    }
  }, [data]);

  const handleSave = () => {
    const newData = {
      id: data ?? undefined,
      name,
      description,
      images,
      storyImages,
      position,
    };
    api.savePromo(auth, newData).then(onClose);
  };

  const handleDelete = () => {
    api.deletePromo(auth, data).then(onClose);
  };

  const removeImage = (image) => {
    setImages([...images.filter((img) => img !== image)]);
  };

  const removeStoriesImage = (image) => {
    setStoryImages([...storyImages.filter((img) => img !== image)]);
  };

  return (
    <div className={styles.container}>
      <h2>Добавить/Редактировать Акцию</h2>
      <label className={styles.textInput}>
        Заголовок*:
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className={styles.textInput}>
        Описание:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <h3>Основные фото</h3>
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

      <h3>Добавление в сторис</h3>
      <div className={styles.images}>
        <input
          accept="image/*"
          type="file"
          multiple
          ref={storiesImageInput}
          hidden
          onChange={onStoriesImageSelect}
        />
        {storyImages
          .sort((a, b) => a.position - b.position)
          .map((image, index) => (
            <img
              onClick={() => removeStoriesImage(image)}
              key={index}
              className={styles.image}
              src={image.data}
              alt="stories image"
            />
          ))}
        <div
          className={styles.imageButton}
          onClick={() => storiesImageInput.current?.click()}
        >
          <span>&#x2b;</span>
        </div>
      </div>

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
