import Header from "../../components/Header/Header";
import Hero from "../components/Hero/Hero";

const Home = ({ userBalance, setUserBalance }) => {
  return (
    <main>
      <Header userBalance={userBalance} />
      <Hero userBalance={userBalance} setUserBalance={setUserBalance} />
    </main>
  );
};


export default Home