import Header from "../../components/Header/Header";
import Hero from "../components/Hero/Hero";

const Home = ({ userBalance, setUserBalance, inventory, setInventory }) => {
  return (
    <main>
      <Header userBalance={userBalance} inventory={inventory} />
      <Hero
        userBalance={userBalance}
        setUserBalance={setUserBalance}
        inventory={inventory}
        setInventory={setInventory}
      />
    </main>
  );
};


export default Home