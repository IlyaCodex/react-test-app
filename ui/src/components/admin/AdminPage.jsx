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

  // ВРЕМЕННАЯ ФУНКЦИЯ ДЛЯ БЫСТРОГО ВХОДА
  const quickLogin = () => {
    // Используем фиксированные учетные данные для разработки
    const devAuth = btoa("admin:admin123");
    setAuth(cookieName, devAuth, { path: "/", maxAge: 60 * 60 * 24 });
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

          {/* ВРЕМЕННАЯ КНОПКА ДЛЯ ВХОДА БЕЗ ПАРОЛЯ */}
          {process.env.NODE_ENV === "development" && (
            <>
              <div
                style={{
                  margin: "20px 0 10px 0",
                  borderTop: "1px solid #ddd",
                  paddingTop: "15px",
                  textAlign: "center",
                  color: "#666",
                  fontSize: "12px",
                }}
              >
                Режим разработки
              </div>
              <button
                className={styles.loginButton}
                onClick={quickLogin}
                style={{
                  backgroundColor: "#ff6b35",
                  border: "2px dashed #ff6b35",
                }}
              >
                🔓 Быстрый вход (DEV)
              </button>
            </>
          )}
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

// import { useState } from "react";
// import styles from "./AdminPage.module.css";
// import { EditContent } from "./EditContent";
// import { AuthProvider } from "../../context/AuthContext";
// import { api } from "../../api";
// import { useCookies } from "react-cookie";

// const cookieName = "auth";

// export const AdminPage = () => {
//   const [{ auth }, setAuth] = useCookies([cookieName]);

//   const [login, setLogin] = useState("");
//   const [password, setPassword] = useState("");

//   const authenticate = ({ login, password }) => {
//     const newAuth = btoa(`${login}:${password}`);
//     api.login(newAuth).then((json) => {
//       if (json.error) {
//         alert(JSON.stringify(json.error));
//       } else {
//         setAuth(cookieName, newAuth, { path: "/", maxAge: 60 * 60 * 24 });
//       }
//     });
//   };

//   if (!auth) {
//     return (
//       <div className={styles.container}>
//         <div className={styles.loginForm}>
//           <h3 className={styles.headerForm}>Добро пожаловать, Админ</h3>
//           <input
//             onChange={(e) => setLogin(e.target.value ?? "")}
//             className={styles.username}
//             placeholder="Логин"
//           />
//           <input
//             onChange={(e) => setPassword(e.target.value ?? "")}
//             className={styles.password}
//             type="password"
//             placeholder="Пароль"
//           />
//           <button
//             className={styles.loginButton}
//             onClick={() => authenticate({ login, password })}
//           >
//             Войти
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <AuthProvider auth={auth}>
//       <EditContent />
//     </AuthProvider>
//   );
// };
