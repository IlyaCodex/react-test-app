import { useState } from 'react';
import styles from './EditContent.module.css';
import cardData from '../../data/cardData';
import { CategoryCard } from './CategoryCard';

function levelFromType(type) {
    switch (type) {
        case 'firstLevel':
            return 1;
        case 'secondLevel':
            return 2;
        case 'thirdLevel':
            return 3;
    }
    return undefined;
}

function loadData(level) {
    
    return [];
}

export const EditContent = () => {
    const [type, setType] = useState('firstLevel');
    const [selected, setSelected] = useState(undefined);

    const [filter, setFilter] = useState('');

    const onLinkClick = (e, t) => {
        e.preventDefault();
        e.stopPropagation();

        setType(t);
        setFilter('');
        setSelected(undefined);
    };

    const distinctFilter = (array, key) => {
        if (!array?.length) {
            return array;
        }
        const result = [];
        const lcFilter = filter?.toLowerCase();
        for (let item of array) {
            if (key) {
                if (!result.some(i => i[key] === item[key]) && (!filter || item[key].toLowerCase().includes(lcFilter))) {
                    result.push(item);
                }
            } else {
                if (!result.includes(item) && (!filter || item.toLowerCase().includes(lcFilter))) {
                    result.push(item);
                }
            }
            
        }
        return result;
    }

    const renderItems = () => {

        const renderItem = item => (<div key={item.id} className={styles.item} onClick={() => setSelected(item)}>
            {item.index + 1}. { item.name }
        </div>);
        
        if (type === 'firstLevel') {
        return distinctFilter(cardData.map(card => card.mainCategory)).map((name, index) => renderItem({id: name, name: name, index}));
        }
        if (type === 'secondLevel') {
            return distinctFilter(cardData.map(card => card.category)).map((name, index) => renderItem({id: name, name: name, index}));
        }
        if (type === 'thirdLevel') {
            return distinctFilter(cardData.map(card => card.subcategory)).map((name, index) => renderItem({id: name, name: name, index}));
        }
        if (type === 'items') {
            return distinctFilter(cardData, 'name').map((card, index) => renderItem({ ...card, index}));
        }
    };

    const onClose = () => setSelected(undefined);

    const renderSelected = () => {
         switch (type) {
            case 'firstLevel':
            case 'secondLevel':
            case 'thirdLevel':
                return (<CategoryCard category={selected} level={levelFromType(type)} onClose={onClose}/>);
         }
    }

    return (
        <div className={styles.container}>
            <div className={styles.navigation}>
                <div className={styles.link}  onClick={ e => onLinkClick(e, 'firstLevel') }>Первый уровень</div>
                <div className={styles.link}  onClick={ e => onLinkClick(e, 'secondLevel') }>Второй уровень</div>
                <div className={styles.link}  onClick={ e => onLinkClick(e, 'thirdLevel') }>Третий уровень</div>
                <div className={styles.link}  onClick={ e => onLinkClick(e, 'items') }>Продукты</div>
                <div className={styles.link}  onClick={ e => onLinkClick(e, 'promo') }>Акции</div>
                <div className={styles.link}  onClick={ e => onLinkClick(e, 'partners') }>Партнеры</div>
            </div>
            <div className={styles.content}>
                {
                    selected 
                    ? (renderSelected())
                    : (<><input className={styles.filter} value={ filter } onChange={ e => setFilter(e.target.value) }/>
                        <div className={styles.items}>
                            { renderItems() }
                            <div className={styles.item} onClick={() => setSelected('new')}>
                                Добавить
                            </div>
                        </div></>)
                }
            </div>
        </div>
    )
};