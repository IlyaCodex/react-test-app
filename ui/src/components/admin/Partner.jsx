import { useState, useRef } from 'react';
import styles from './Partner.module.css';

const PartnerModal = ({ data, onSave, onClose }) => {
    const [title, setTitle] = useState(data?.title || '');
    const [description, setDescription] = useState(data?.description || '');
    const [images, setImages] = useState(data?.images || []);
    const [position, setPosition] = useState(data?.position || 1);
    const [modalText, setModalText] = useState(data?.modalText || { section1: [], section2: [] });

    const imageInput = useRef(null);

    const onImageSelect = (e) => {
        const files = e.target.files ?? [];
        const newImages = [...images, ...files];
        setImages(newImages);
    };

    const addParagraph = (section) => {
        setModalText(prev => ({
            ...prev,
            [section]: [...prev[section], '']
        }));
    };

    const updateParagraph = (section, index, value) => {
        setModalText(prev => ({
            ...prev,
            [section]: prev[section].map((p, i) => i === index ? value : p)
        }));
    };

    const removeParagraph = (section, index) => {
        setModalText(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const handleSave = () => {
        const newData = {
            id: data?.id || `new-partner-${Date.now()}`,
            title,
            description,
            images,
            position,
            modalText,
        };
        onSave(newData);
        onClose();
    };

    return (
        <div className={styles.container}>
                <h2>Добавить/Редактировать Партнера</h2>
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
                <label>Текст модального окна (Секция 1):
                    <div className={styles.modalText}>
                        {modalText.section1.map((para, index) => (
                            <div key={index} className={styles.paragraph}>
                                <input value={para} onChange={e => updateParagraph('section1', index, e.target.value)} />
                                <button onClick={() => removeParagraph('section1', index)}>Удалить</button>
                            </div>
                        ))}
                        <button onClick={() => addParagraph('section1')}>Добавить параграф</button>
                    </div>
                </label>
                <label>Текст модального окна (Секция 2):
                    <div className={styles.modalText}>
                        {modalText.section2.map((para, index) => (
                            <div key={index} className={styles.paragraph}>
                                <input value={para} onChange={e => updateParagraph('section2', index, e.target.value)} />
                                <button onClick={() => removeParagraph('section2', index)}>Удалить</button>
                            </div>
                        ))}
                        <button onClick={() => addParagraph('section2')}>Добавить параграф</button>
                    </div>
                </label>
                <div className={styles.actions}>
                    <button onClick={handleSave} className={styles.save}>Сохранить</button>
                    {data?.id && <button onClick={onClose} className={styles.delete}>Удалить</button>}
                    <button onClick={onClose} className={styles.cancel}>Отмена</button>
                </div>
            </div>
    );
};

export default PartnerModal;