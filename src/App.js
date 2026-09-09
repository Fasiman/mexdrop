import { useState, useEffect } from "react";
import Home from "./pages/Home/Home";

const INITIAL_USER_BALANCE = 0.00;

function App() {
  // 1. Берем ID из localStorage
  const [userId, setUserId] = useState(() => localStorage.getItem("userId") || null);

  // 2. Берем полный объект пользователя из localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("userData");
    return saved ? JSON.parse(saved) : null;
  });

  const [userBalance, setUserBalance] = useState(() => {
    const saved = localStorage.getItem("userData");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.balance !== undefined ? parsed.balance : INITIAL_USER_BALANCE;
    }
    return INITIAL_USER_BALANCE;
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("userData");
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed.inventory) ? parsed.inventory : [];
    }
    return [];
  });

  useEffect(() => {
    // Вытягиваем ID из URL, если пришли после авторизации Steam
    const urlParams = new URLSearchParams(window.location.search);
    const steamidFromUrl = urlParams.get("steamid");

    let activeId = userId;

    if (steamidFromUrl) {
      activeId = steamidFromUrl;
      localStorage.setItem("userId", activeId);
      setUserId(activeId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Если есть ID — делаем фетч к серверу и загружаем ВСЕ данные объекта пользователя
    if (activeId) {
      fetch("http://localhost:5000/api/users")
        .then((res) => res.json())
        .then((users) => {
          const foundUser = users.find((u) => String(u.id || u.steamid) === String(activeId));

          if (foundUser) {
            // Сохраняем полный объект в localStorage
            localStorage.setItem("userData", JSON.stringify(foundUser));
            
            // Записываем весь объект пользователя и его свойства в стейты
            setUser(foundUser);
            if (foundUser.balance !== undefined) setUserBalance(foundUser.balance);
            if (Array.isArray(foundUser.inventory)) setInventory(foundUser.inventory);
          }
        })
        .catch((err) => console.error("Ошибка получения данных пользователя:", err));
    }
  }, [userId]);

  return (
    <div className="App">
      <Home
        userId={userId}
        setUserId={setUserId}
        user={user}
        setUser={setUser}
        userBalance={userBalance}
        setUserBalance={setUserBalance}
        inventory={inventory}
        setInventory={setInventory}
      />
    </div>
  );
}

export default App;