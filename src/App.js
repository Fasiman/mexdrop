import { useState, useEffect, useCallback } from "react";
import Home from "./pages/Home/Home";

const API_BASE_URL = "https://tim-starsmerchant-along-extends.trycloudflare.com/api";
const INITIAL_USER_BALANCE = 0.00;

// Безопасное получение userId из localStorage
const getStoredUserId = () => {
  const id = localStorage.getItem("userId");
  if (!id || id === "null" || id === "undefined" || id.trim() === "") {
    return null;
  }
  return id;
};

function App() {
  // Инициализация state с немедленной очисткой localStorage, если юзер не залогинен
  const [userId, setUserId] = useState(() => {
    const savedId = getStoredUserId();
    if (!savedId) {
      localStorage.clear();
    }
    return savedId;
  });

  const [user, setUser] = useState(null);
  const [userBalance, setUserBalance] = useState(INITIAL_USER_BALANCE);
  const [inventory, setInventory] = useState([]);

  // Жесткая очистка всего состояния и localStorage
  const clearAllData = useCallback(() => {
    localStorage.clear();
    setUserId(null);
    setUser(null);
    setUserBalance(INITIAL_USER_BALANCE);
    setInventory([]);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const steamidFromUrl = urlParams.get("steamid");

    // 1. Если пришёл steamid из URL (новое войти)
    if (steamidFromUrl && steamidFromUrl !== "null" && steamidFromUrl !== "undefined") {
      clearAllData();
      localStorage.setItem("userId", steamidFromUrl);
      setUserId(steamidFromUrl);

      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // 2. Если userId НЕТ или он невалидный
    const currentUserId = getStoredUserId();
    if (!currentUserId) {
      clearAllData();
      return;
    }

    // 3. Загружаем пользователей с актуального Cloudflare API
    let isMounted = true;

    fetch(`${API_BASE_URL}/users`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки пользователей");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;

        // Преобразуем ответ в массив, даже если с бэкенда пришел 1 объект
        const usersArray = Array.isArray(data) ? data : (data ? [data] : []);

        // Строгий поиск ТОЛЬКО по совпадающему ID / steamid
        const foundUser = usersArray.find((u) => {
          if (!u) return false;
          const uId = String(u.id ?? u.steamid ?? "");
          return uId.length > 0 && uId === String(currentUserId);
        });

        // Если пользователь НЕ найден в базе — сразу всё чистим
        if (!foundUser) {
          clearAllData();
          return;
        }

        // Пользователь найден — сохраняем данные
        localStorage.setItem("userData", JSON.stringify(foundUser));
        setUser(foundUser);
        setUserBalance(
          foundUser.balance !== undefined && foundUser.balance !== null
            ? Number(foundUser.balance) || INITIAL_USER_BALANCE
            : INITIAL_USER_BALANCE
        );
        setInventory(Array.isArray(foundUser.inventory) ? foundUser.inventory : []);
      })
      .catch((err) => {
        console.error("Ошибка при получении данных пользователя:", err);
        if (isMounted) {
          clearAllData();
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId, clearAllData]);

  // Флаг полной авторизации: юзер считается залогиненным ТОЛЬКО когда есть и userId, и объект user
  const isLoggedIn = Boolean(userId && user);

  return (
    <div className="App">
      <Home
        userId={isLoggedIn ? userId : null}
        setUserId={setUserId}
        user={isLoggedIn ? user : null}
        setUser={setUser}
        // Если юзер НЕ залогинен — строго 0.00, никакой чужой баланс не пройдет
        userBalance={isLoggedIn ? userBalance : INITIAL_USER_BALANCE}
        setUserBalance={setUserBalance}
        inventory={isLoggedIn ? inventory : []}
        setInventory={setInventory}
      />
    </div>
  );
}

export default App;