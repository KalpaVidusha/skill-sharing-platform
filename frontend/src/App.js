import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard"; 
import MonetizationForm from "./pages/monetizationAndRewardManagement/monetizationRequestForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/userdashboard" element={<UserDashboard />} /> 

        {/*monetization and reward managemrnt*/}
        <Route path="/monetizationform" element={<MonetizationForm/>} />
        
      </Routes>
    </Router>
  );
}

export default App;
