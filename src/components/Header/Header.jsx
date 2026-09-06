import Container from "../Container/Container";
import Logo from "../Logo/Logo";
import { FaCoins } from "react-icons/fa6";
import { FaSteam } from "react-icons/fa";



import "./Header.css"

const Header = () => {
  return (
    <header className="header">
      <Container>
        <Logo></Logo>
        <div className="header__balance">
           <FaCoins /> <span className="header__balance-number">0,00</span>
           <button className="header__balance-add">+</button>
        </div>
        <button className="header__auth">
            Войти через Steam <FaSteam className="header__steam"></FaSteam>
        </button>
      </Container>
    </header>
  );
};

export default Header;
