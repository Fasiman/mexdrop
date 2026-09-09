import { useState, useEffect } from "react";
import Home from "./pages/Home/Home";

const INITIAL_USER_BALANCE = 0.00;

function App() {
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem("userId") || null;
  });

  const [user, setUser] = useState(null);
  const [userBalance, setUserBalance] = useState(INITIAL_USER_BALANCE);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const steamidFromUrl = urlParams.get("steamid");

    // Если пришёл новый steamid — авторизуем именно этого пользователя
    if (steamidFromUrl) {
      localStorage.setItem("userId", steamidFromUrl);

      // Очень важно: очищаем старые данные предыдущего пользователя
      localStorage.removeItem("userData");

      setUserId(steamidFromUrl);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      return;
    }

    // НЕТ авторизации
    if (!userId) {
      localStorage.removeItem("userData");

      setUser(null);
      setUserBalance(INITIAL_USER_BALANCE);
      setInventory([]);

      return;
    }

    // Есть userId — получаем данные именно этого пользователя
    fetch("http://localhost:5000/api/users")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка загрузки пользователей");
        }

        return res.json();
      })
      .then((users) => {
        const foundUser = users.find(
          (u) => String(u.id || u.steamid) === String(userId)
        );

        // Пользователь не найден
        if (!foundUser) {
          localStorage.removeItem("userData");

          setUser(null);
          setUserBalance(INITIAL_USER_BALANCE);
          setInventory([]);

          return;
        }

        // Пользователь найден
        localStorage.setItem("userData", JSON.stringify(foundUser));

        setUser(foundUser);

        setUserBalance(
          foundUser.balance !== undefined
            ? foundUser.balance
            : INITIAL_USER_BALANCE
        );

        setInventory(
          Array.isArray(foundUser.inventory)
            ? foundUser.inventory
            : []
        );
      })
      .catch((err) => {
        console.error(
          "Ошибка получения данных пользователя:",
          err
        );

        // При ошибке тоже НЕ показываем старые чужие данные
        localStorage.removeItem("userData");

        setUser(null);
        setUserBalance(INITIAL_USER_BALANCE);
        setInventory([]);
      });
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