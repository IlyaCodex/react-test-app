import { useMemo, useState, useRef } from "react";
import styles from './CategoryCard.module.css';
import cardData from "../../data/cardData";

function loadCategory(category, level) {
    if (category === 'new') {
        return {level, name: '', images: [], position: 1, parent: [], children: [], items: []};
    }
    return {id : 1, level: 2, name: category.name, images: [], position: 1, parent: [], children: [], items: []};
}

function loadAvailableCategories(category) {
    return [[{id: 1, name: 'Врачам'}], [{id: 2, name: 'Завупа'}]];
}

function loadItems() {
    return cardData;
}

function saveCategory() {

}

function deleteCategory(category) {

}

export const CategoryCard = ({
    category,
    level,
    onClose
}) => {
    const info = useMemo(() => loadCategory(category, level), category);
    const [name, setName] = useState(info.name);
    const [images, setImages] = useState(info.images ?? []);
    const [position, setPosition] = useState(info.position);
    const [parentCategories, setParentCategories] = useState(info.parent ?? []);
    const [childCategories, setChildCategories] = useState(info.children ?? []);
    const [items, setItems] = useState(info.items ?? []);

    const [availableParentCategories, availableChildCategories] = useMemo(() => loadAvailableCategories(category), [category])

    const availableItems = useMemo(() => loadItems(), [category]);
    const imageInput = useRef(null);

    const onImageSelect = e => {
        for (const file of (e.target.files ?? [])) {
            images.push(file);
        }
        setImages([...images]);
    }

    const onChangeParent = e => {
        e.preventDefault();
        const id = e.target.value;
        if (id) {
            const newCat = availableParentCategories.find(parent => parent.id.toString() === id);
            if (newCat) {
                setParentCategories([...parentCategories, newCat]);
            }
        }
        e.target.value = 'disabled';
    }

    const onChangeChild = e => {
        e.preventDefault();
        const id = e.target.value;
        if (id) {
            const newCat = availableChildCategories.find(child => child.id.toString() === id);
            if (newCat) {
                setChildCategories([...childCategories, newCat]);
            }
        }
        e.target.value = 'disabled';
    }

    const onChangeItems = e => {
        e.preventDefault();
        const id = e.target.value;
        if (id) {
            const newItem = availableItems.find(item => item.id.toString() === id);
            if (newItem) {
                setItems([...items, newItem]);
            }
        }
        e.target.value = 'disabled';
    }

    const removeParent = parent => {
        setParentCategories([...(parentCategories.filter(p => p !== parent))])
    }

    const removeChild = child => {
        setChildCategories([...(childCategories.filter(c => c !== child))])
    }

    const removeItem = item => {
        setItems([...(items.filter(c => c !== item))])
    }

    const onSave = () => {
        saveCategory();
        onClose();
    }

    const onDelete = () => {
        deleteCategory(category);
        onClose();
    }

    return (
        <div className={styles.container}>

            <label className={styles.textInput}>Название*: <input value={name} onChange={e => setName(e.target.value)}/></label>
            <div className={styles.images}>
                <input accept="image/*" type='file' multiple ref={imageInput} hidden onChange={onImageSelect}/>
                { (images ?? []).map(image => (<img className={styles.image} src={URL.createObjectURL(image)} alt="your image" />)) }
                <div className={styles.imageButton} onClick={ () => imageInput.current?.click()}><span>&#x2b;</span></div>
            </div>
            <label className={styles.position}>Позиция: <input type="number" id="quantity" name="quantity" value={position} min="1" step="1" onChange={ e => setPosition(e.target.value)}/></label>
            {
                info.level > 1 ? (
                    <label>Родительские категории: <div className={styles.categories}>
                        { parentCategories.map(parent => (<div onClick={() => removeParent(parent)} className={styles.category}>{parent.name}</div>))}
                        <select value={'disabled'} onChange={ onChangeParent }>
                            <option value={'disabled'} selected disabled>Добавить</option>
                            { availableParentCategories.filter(parent => !parentCategories.includes(parent)).map(parent => (<option value={parent.id}>{parent.name}</option>))}
                        </select>
                    </div></label>
                ) : null
            }
            {
                info.level < 3 ? (
                    <label>Потомственные категории: <div className={styles.categories}>
                        { childCategories.map(child => (<div onClick={() => removeChild(child)} className={styles.category}>{child.name}</div>))}
                        <select value={'disabled'} onChange={ onChangeChild }>
                            <option value={'disabled'} selected disabled>Добавить</option>
                            { availableChildCategories.filter(child => !childCategories.includes(child)).map(child => (<option value={child.id}>{child.name}</option>))}
                        </select>
                    </div></label>
                ) : null
            }
            <label>Продукты: <div className={styles.categories}>
                    {items.map(item => (<div onClick={() => removeItem(item)} className={styles.item} key={item.id}>{item.name}</div>))}
                    <select value={'disabled'} onChange={ onChangeItems }>
                        <option value={'disabled'} selected disabled>Добавить</option>
                        { availableItems.filter(item => !items.includes(item)).map(item => (<option value={item.id}>{item.name}</option>))}
                    </select>
                </div>
            </label>
            <div className={styles.actions}>
                <div onClick={onSave} className={styles.save}>Сохранить</div>
                {category !== 'new' && <div onClick={onDelete} className={styles.delete}>Удалить</div>}
                <div onClick={onClose} className={styles.cancel}>Отмена</div>
            </div>
        </div>
    )
};