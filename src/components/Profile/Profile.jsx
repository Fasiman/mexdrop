import "./Profile.css";
import { FaPen, FaPlus, FaSignOutAlt } from "react-icons/fa";
import { IoSettings, IoClose } from "react-icons/io5";

const Profile = ({ user, userId, userBalance, isOpen, onClose, onLogout }) => {
  if (!isOpen) {
    return null;
  }

  const handleLogout = () => {
    if (onLogout) onLogout();
    localStorage.clear();
    if (onClose) onClose();
  };

  const avatarUrl =
    user?.avatar ||
    user?.avatarfull ||
    "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";
  const username = user?.username || user?.personaname || "Авторизуйтесь";
  const displayId = userId || user?.steamid || user?.id || "Не авторизован";
  const currentBalance = userBalance !== undefined ? userBalance : user?.balance || 0;

  return (
    <div className="profile__backdrop" onClick={onClose}>
      <div className="profile__modal" onClick={(e) => e.stopPropagation()}>
        <button className="profile__close" onClick={onClose}>
          <IoClose />
        </button>
        <ul className="profile__modal__list">
          <li className="profile__data">
            <img className="profile__avatar" src={avatarUrl} alt={username} />
            <div className="profile__texts">
              <span className="profile__nickname">{username}</span>
              <span className="profile__id">ID {displayId}</span>
              <div className="profile__icons">
                <button className="profile__icons-button" title="Редактировать">
                  <FaPen />
                </button>
                <button className="profile__icons-button" title="Настройки">
                  <IoSettings />
                </button>
                <button
                  className="profile__icons-button profile__logout-icon"
                  title="Выйти из аккаунта"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
          </li>
          <li className="profile__data">
            <h4 className="profile__balance">
              {Number(currentBalance).toFixed(2)} <span>₽</span>
            </h4>
            <a className="profile__history" href="./">
              История пополнений
            </a>
            <button className="profile__pay">
              Пополнить баланс <FaPlus />
            </button>
          </li>
        </ul>

        <button className="profile__logout" onClick={handleLogout}>
          <FaSignOutAlt /> Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};

export default Profile;