import { useState, useEffect } from "react";
import Home from "./pages/Home/Home";

const INITIAL_USER_BALANCE = 0.00;

function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem("userId") || null);

  const [user, setUser] = useState(() => {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) return null;
    const saved = localStorage.getItem("userData");
    return saved ? JSON.parse(saved) : null;
  });

  const [userBalance, setUserBalance] = useState(() => {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) return INITIAL_USER_BALANCE;
    const saved = localStorage.getItem("userData");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.balance !== undefined ? parsed.balance : INITIAL_USER_BALANCE;
    }
    return INITIAL_USER_BALANCE;
  });

  const [inventory, setInventory] = useState(() => {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) return [];
    const saved = localStorage.getItem("userData");
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed.inventory) ? parsed.inventory : [];
    }
    return [];
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const steamidFromUrl = urlParams.get("steamid");

    let activeId = userId;

    if (steamidFromUrl) {
      activeId = steamidFromUrl;
      localStorage.setItem("userId", activeId);
      setUserId(activeId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (activeId) {
      fetch("http://localhost:5000/api/users")
        .then((res) => res.json())
        .then((users) => {
          const foundUser = users.find((u) => String(u.id || u.steamid) === String(activeId));

          if (foundUser) {
            localStorage.setItem("userData", JSON.stringify(foundUser));
            setUser(foundUser);
            if (foundUser.balance !== undefined) setUserBalance(foundUser.balance);
            if (Array.isArray(foundUser.inventory)) setInventory(foundUser.inventory);
          }
        })
        .catch((err) => console.error("Ошибка получения данных пользователя:", err));
    } else {
      // Если по какой-то причине userId удалили, сбрасываем данные у клиента
      localStorage.removeItem("userData");
      setUser(null);
      setUserBalance(INITIAL_USER_BALANCE);
      setInventory([]);
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