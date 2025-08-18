import { useState } from "react";
import styles from "./AdminPage.module.css";
import { EditContent } from "./EditContent";
import { AuthProvider } from "../../context/AuthContext";
import { api } from "../../api";
import { useCookies } from "react-cookie";

const cookieName = "auth";

export const AdminPage = () => {
  const [{ auth }, setAuth] = useCookies([cookieName]);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const authenticate = ({ login, password }) => {
    const newAuth = btoa(`${login}:${password}`);
    api.login(newAuth).then((json) => {
      if (json.error) {
        alert(JSON.stringify(json.error));
      } else {
        setAuth(cookieName, newAuth, { path: "/", maxAge: 60 * 60 * 24 });
      }
    });
  };

  if (!auth) {
    return (
      <div className={styles.container}>
        <div className={styles.loginForm}>
          <h3 className={styles.headerForm}>Добро пожаловать, Админ</h3>
          <input
            onChange={(e) => setLogin(e.target.value ?? "")}
            className={styles.username}
            placeholder="Логин"
          />
          <input
            onChange={(e) => setPassword(e.target.value ?? "")}
            className={styles.password}
            type="password"
            placeholder="Пароль"
          />
          <button
            className={styles.loginButton}
            onClick={() => authenticate({ login, password })}
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider auth={auth}>
      <EditContent />
    </AuthProvider>
  );
};
