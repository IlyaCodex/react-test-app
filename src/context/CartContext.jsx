import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";


export const CartContext = createContext({items: [], addItems: (...items) => {}, removeItems: (...items) => {}});

const cookieName = 'cart';

export const CartContextProvider = ({children}) => {
    const [cookies, setCookie] = useCookies([cookieName]);

    const items = useMemo(() => (cookies[cookieName]?.filter(item => !!item)) ?? [], [cookies[cookieName]]);

    useEffect(() => {
        if (!cookies[cookieName]) {
            setCookie(cookieName, items);
        }
    }, [cookies[cookieName]]);

    const addItems = useCallback((...newItems) => {
        for (const newItem of newItems) {
            let item = items.find(item => item?.id === newItem);
            if (!item) {
                item = {id: newItem, count: 0};
                items.push(item);
            }

            item.count++;
        }
        console.log(`Add items: ${JSON.stringify(items)}`);
        setCookie(cookieName, [...items]);
    }, [items]);

    const removeItems = useCallback((...newItems) => {
        console.log(JSON.stringify(newItems));
        for (const newItem of newItems) {
            let item = items.find(item => item?.id === newItem);
            if (item) {
                item.count--;
                if (item.count <= 0) {
                    const index = items.indexOf(item);
                    items.splice(index, 1);
                }
            }
        }
        setCookie(cookieName, [...items]);
    }, [items]);

    return (
        <CartContext value={{ items, addItems, removeItems }}>
            { children }
        </CartContext>
    )
};