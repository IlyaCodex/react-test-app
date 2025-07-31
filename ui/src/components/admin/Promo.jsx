import { useState, useRef } from 'react';
import styles from './Promo.module.css';

const PromoModal = ({ data, onSave, onClose }) => {
    const [title, setTitle] = useState(data?.title || '');
    const [description, setDescription] = useState(data?.description || '');
    const [images, setImages] = useState(data?.images || []);
    const [position, setPosition] = useState(data?.position || 1);

    const imageInput = useRef(null);

    const onImageSelect = (e) => {
        const files = e.target.files ?? [];
        const newImages = [...images, ...files];
        setImages(newImages);
    };

    const handleSave = () => {
        const newData = {
            id: data?.id || `new-promo-${Date.now()}`, // Generate unique ID for new entries
            title,
            description,
            images,
            position,
        };
        onSave(newData);
        onClose();
    };

    return (
        <div className={styles.container}>
                <h2>Добавить/Редактировать Акцию</h2>
                <label className={styles.textInput}>
                    Заголовок*: <input value={title} onChange={e => setTitle(e.target.value)} />
                </label>
                <label className={styles.textInput}>
                    Описание: <textarea value={description} onChange={e => setDescription(e.target.value)} />
                </label>
                <div className={styles.images}>
                    <input accept="image/*" type="file" multiple ref={imageInput} hidden onChange={onImageSelect} />
                    {images.map((image, index) => (
                        <img key={index} className={styles.image} src={URL.createObjectURL(image)} alt="your image" />
                    ))}
                    <div className={styles.imageButton} onClick={() => imageInput.current?.click()}><span>&#x2b;</span></div>
                </div>
                <label className={styles.position}>
                    Позиция: <input type="number" value={position} min="1" step="1" onChange={e => setPosition(e.target.value)} />
                </label>
                <div className={styles.actions}>
                    <button onClick={handleSave} className={styles.save}>Сохранить</button>
                    {data?.id && <button onClick={onClose} className={styles.delete}>Удалить</button>}
                    <button onClick={onClose} className={styles.cancel}>Отмена</button>
                </div>
            </div>
    );
};

export default PromoModal;