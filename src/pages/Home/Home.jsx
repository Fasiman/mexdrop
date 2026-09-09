import Header from "../../components/Header/Header";
import Hero from "../components/Hero/Hero";
import Profile from "../../components/Profile/Profile";

const Home = ({ 
  userId, 
  setUserId, 
  user, 
  setUser, 
  userBalance, 
  setUserBalance, 
  inventory, 
  setInventory 
}) => {
  return (
    <main>
      <Header userBalance={userBalance} inventory={inventory} user={user} />
      <Hero
        userBalance={userBalance}
        setUserBalance={setUserBalance}
        inventory={inventory}
        setInventory={setInventory}
      />
      <Profile
        user={user}
        setUser={setUser}
        userId={userId}
        setUserId={setUserId}
        userBalance={userBalance}
        setUserBalance={setUserBalance}
        inventory={inventory}
        setInventory={setInventory}
      />
    </main>
  );
};

export default Home;