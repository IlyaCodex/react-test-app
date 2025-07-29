import { useState } from "react";
import styles from './AdminPage.module.css';
import { EditContent } from "./EditContent";



export const AdminPage = () => {
    const [auth, setAuth] = useState(undefined);
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const authenticate = ({ login, password }) => {
        if (login === 'admin' && password === 'admin') {
            setAuth(login);
        }
    }

    if (!auth) {
        return (
            <div className={styles.container}>
                <div className={styles.loginForm}>
                    <input onChange={e => setLogin(e.target.value ?? '')} className={styles.username}/>
                    <input onChange={e => setPassword(e.target.value ?? '')} className={styles.password} type="password"/>
                    <button className={styles.loginButton} onClick={() => authenticate({login, password})}>Войти</button>
                </div>
            </div>
        );
    }

    return (<EditContent/>);
};