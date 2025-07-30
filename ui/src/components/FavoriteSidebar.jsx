import { useFavorites } from "../context/FavoriteContext";

const FavoriteSidebar = () => {
  const { favorites } = useFavorites();

  return (
    <div className="sidebar favorite-sidebar">
      <h2>Избранное</h2>
      {favorites.length === 0 ? (
        <p>Вы пока ничего не добавили.</p>
      ) : (
        <ul>
          {favorites.map((item) => (
            <li key={item.id} className="favorite-item">
              <img src={item.image} alt={item.name} />
              <div>
                <p>{item.name}</p>
                <span>{item.price.toLocaleString("ru-RU")} ₽</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoriteSidebar;
