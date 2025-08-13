import { useState, useRef, useEffect } from "react";
import styles from "./Card.module.css";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { convertFiles } from "./Utils";
import { isNull } from "./Utils";

export const Admin = ({ data, onClose }) => {
  const [login, setLogin] = useState(data);
  const [password, setPassword] = useState("");

  const { auth } = useAuth();

  const handleSave = () => {
    const newData = {
      login,
      password,
    };
    api.saveAdmin(auth, newData).then(onClose);
  };

  const handleDelete = () => {
    api.deleteAdmin(auth, data).then(onClose);
  };

  return (
    <div className={styles.container}>
      <h2>Добавить/Редактировать Админа</h2>
      <label className={styles.textInput}>
        Логин:
        <input value={login} onChange={(e) => setLogin(e.target.value)} />
      </label>
      <label className={styles.textInput}>
        Пароль:
        <input
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
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
