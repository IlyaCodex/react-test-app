import { useState, useRef, useEffect } from "react";
import styles from "./Card.module.css";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { convertFiles } from "./Utils";
import { isNull } from "./Utils";

export const Partner = ({ data, onClose }) => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState(1);
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
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
    if (!isNull(data)) {
      api.getPartnerById(data).then((response) => {
        const parter = response.data;
        setName(parter.name);
        setDescription(parter.description);
        setPosition(parter.position);
        setCountry(parter.country);
        Promise.all(
          parter.images?.map((imageId) =>
            api.getPartnerImage(imageId).then((res) => res.data)
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
      <h2>Добавить/Редактировать Партнера</h2>
      <label className={styles.textInput}>
        Название*:
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className={styles.textInput}>
        Описание:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className={styles.textInput}>
        Страна:
        <input value={country} onChange={(e) => setCountry(e.target.value)} />
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
