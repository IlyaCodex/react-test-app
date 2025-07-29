import { useState } from 'react';
import styles from './EditContent.module.css';
import cardData from '../../data/cardData';
import { CategoryCard } from './CategoryCard';

function loadItems({firstLevel, secondLevel, thirdLevel}) {
    return cardData.filter(card => card.mainCategory === firstLevel && card.category === secondLevel && card.subcategory === thirdLevel);
}

function distinct(array) {
    if (!array?.length) {
        return array;
    }
    const result = [];
    for (let item of array) {
        if (!result.includes(item)) {
            result.push(item);
        }
    }
    return result;
}

function loadCategories({ firstLevel, secondLevel }) {
    if (secondLevel && firstLevel) {
        return distinct(cardData.filter(card => card.mainCategory === firstLevel && card.category === secondLevel).map(card => card.subcategory));
    }
    if (firstLevel) {
        return distinct(cardData.filter(card => card.mainCategory === firstLevel).map(card => card.category));
    }
    return distinct(cardData.map(card => card.mainCategory));

}

export const EditContent = () => {
    const [firstLevel, setFirstLevel] = useState('');
    const [secondLevel, setSecondLevel] = useState('');
    const [thirdLevel, setThirdLevel] = useState('');

    const onCategoryClick = category => {
        if (secondLevel) {
            setThirdLevel(category);
        } else if (firstLevel) {
            setSecondLevel(category);
        } else {
            setFirstLevel(category);
        }
    }

    const renderItems = () => {
        if (thirdLevel) {
            return loadItems({ firstLevel, secondLevel, thirdLevel })
                .map(item => (<div key={item.id} className={styles.item}>
                    { item.name }
                </div>));
            
        }

        return loadCategories({ firstLevel, secondLevel })
            .map(category => (<div className={styles.category} onClick={ () => onCategoryClick(category)}>
                { category }
                <div className={styles.edit}>изменить</div>
            </div>));
    };

    return (
        <div className={styles.container}>
            <div className={styles.navigation}>

            </div>
            <div className={styles.content}>
                { renderItems() }
            </div>
        </div>
    )
};