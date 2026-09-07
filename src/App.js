import { useState } from "react";
import Home from "./pages/Home/Home";

const INITIAL_USER_BALANCE = 1000.00;

function App() {
  const [userBalance, setUserBalance] = useState(INITIAL_USER_BALANCE);

  return (
    <div className="App">
      <Home userBalance={userBalance} setUserBalance={setUserBalance} />
    </div>
  );
}

export default App;
