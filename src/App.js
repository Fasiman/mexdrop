import { useState } from "react";
import Home from "./pages/Home/Home";

const INITIAL_USER_BALANCE = 1000.00;

function App() {
  const [userBalance, setUserBalance] = useState(
    INITIAL_USER_BALANCE
  );

  const [inventory, setInventory] = useState([]);

  return (
    <div className="App">
      <Home
        userBalance={userBalance}
        setUserBalance={setUserBalance}
        inventory={inventory}
        setInventory={setInventory}
      />
    </div>
  );
}

export default App;