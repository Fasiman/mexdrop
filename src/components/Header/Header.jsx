import { useState } from "react";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";
import { FaCoins } from "react-icons/fa6";
import { FaSteam } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

import "./Header.css";

const Header = ({ userBalance, inventory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <header className="header">
      <Container>
        <Logo />
        <div className="header__balance">
          <FaCoins />{" "}
          <span className="header__balance-number">
            {userBalance.toLocaleString("ru-RU", { minimumFractionDigits: 2 })}
          </span>
          <button className="header__balance-add">+</button>
        </div>
        {/* <span className="header__inventory">Инвентарь: {inventory.length}</span> */}
        <button className="header__auth" onClick={openModal}>
          Войти через Steam <FaSteam className="header__steam" />
        </button>
      </Container>

      {isModalOpen && (
        <div className="header__backdrop" onClick={closeModal}>
          <div className="header__modal" onClick={(e) => e.stopPropagation()}>
            <button className="header__close" onClick={closeModal}>
              <IoClose />
            </button>
            <h3 className="header__modal-title">Авторизация</h3>
            <div className="header__modal-aprove">
              <input className="header__modal-checkbox" type="checkbox" />
              <span>Я подтверждаю что мне 18 лет</span>
            </div>
            <div className="header__modal-aprove">
              <input className="header__modal-checkbox" type="checkbox" />
              <span>Я принимаю сервисную политику конфиденциальности</span>
            </div>

            <button className="header__steam-login">
              Войти в аккаунт через Steam <FaSteam className="header__steam" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;