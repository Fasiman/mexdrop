import { useState, useEffect } from "react";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";
import Profile from "../Profile/Profile";
import { FaCoins } from "react-icons/fa6";
import { FaSteam } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

import "./Header.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Header = ({ userBalance, inventory, user }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Состояние пользователя и загрузки
  const [userData, setUserData] = useState(user || null);
  const [loading, setLoading] = useState(!user);

  // Состояния для чекеров модалки входа
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  // Проверка user и localStorage при монтировании
  useEffect(() => {
    if (user) {
      setUserData(user);
      setLoading(false);
      return;
    }

    const storedUserId = localStorage.getItem("userId");

    if (storedUserId) {
      setLoading(true);
      fetch(`${API_URL}/api/user/${storedUserId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Ошибка загрузки пользователя");
          return res.json();
        })
        .then((data) => {
          setUserData(data);
        })
        .catch((err) => {
          console.error("Ошибка при получении профиля:", err);
          setUserData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [user]);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  // Редирект на авторизацию Steam
  const handleSteamLogin = () => {
    if (!isAgeConfirmed || !isTermsAccepted) {
      alert("Пожалуйста, подтвердите возраст и согласие с политикой конфиденциальности.");
      return;
    }
    window.location.href = `${API_URL}/api/auth/steam`;
  };

  // Выход из аккаунта
  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUserData(null);
    closeProfileModal();
  };

  const avatarUrl =
    userData?.avatar ||
    userData?.avatarfull ||
    "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";

  return (
    <header className="header">
      <Container>
        <Logo />
        <div className="header__balance">
          <FaCoins />{" "}
          <span className="header__balance-number">
            {userBalance?.toLocaleString("ru-RU", { minimumFractionDigits: 2 }) || "0.00"}
          </span>
          <button className="header__balance-add">+</button>
        </div>

        {!loading &&
          (userData ? (
            <div className="header__user-profile" onClick={openProfileModal}>
              <img
                src={avatarUrl}
                alt={userData.username || userData.personaname || "Avatar"}
                className="header__avatar"
              />
            </div>
          ) : (
            <button className="header__auth" onClick={openAuthModal}>
              Войти через Steam <FaSteam className="header__steam" />
            </button>
          ))}
      </Container>

      {/* Модалка входа */}
      {isAuthModalOpen && (
        <div className="header__backdrop" onClick={closeAuthModal}>
          <div className="header__modal" onClick={(e) => e.stopPropagation()}>
            <button className="header__close" onClick={closeAuthModal}>
              <IoClose />
            </button>
            <h3 className="header__modal-title">Авторизация</h3>

            <label className="header__modal-aprove" style={{ cursor: "pointer" }}>
              <input
                className="header__modal-checkbox"
                type="checkbox"
                checked={isAgeConfirmed}
                onChange={(e) => setIsAgeConfirmed(e.target.checked)}
              />
              <span>Я подтверждаю, что мне 18 лет</span>
            </label>

            <label className="header__modal-aprove" style={{ cursor: "pointer" }}>
              <input
                className="header__modal-checkbox"
                type="checkbox"
                checked={isTermsAccepted}
                onChange={(e) => setIsTermsAccepted(e.target.checked)}
              />
              <span>Я принимаю сервисную политику конфиденциальности</span>
            </label>

            <button
              className="header__steam-login"
              onClick={handleSteamLogin}
              disabled={!isAgeConfirmed || !isTermsAccepted}
              style={{
                opacity: isAgeConfirmed && isTermsAccepted ? 1 : 0.6,
                cursor: isAgeConfirmed && isTermsAccepted ? "pointer" : "not-allowed",
              }}
            >
              Войти в аккаунт через Steam <FaSteam className="header__steam" />
            </button>
          </div>
        </div>
      )}

      {/* Модалка профиля */}
      {isProfileModalOpen && (
        <Profile
          user={userData}
          userId={userData?.steamid || userData?.id || localStorage.getItem("userId")}
          userBalance={userBalance}
          onClose={closeProfileModal}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
};

export default Header;