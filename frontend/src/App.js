import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import Posts from './pages/Posts/Posts';
import PostDetail from './pages/Posts/PostDetail';
import CreatePost from "./pages/Posts/CreatePost";
import MonetizationRequest from "./pages/monetizationAndRewardManagement/monetizationRequestForm";
import MonetizationForm from "./pages/monetizationAndRewardManagement/monetizationRequestForm";

function App() {
  return (
    <Router>
      <Routes>
        {/* Core Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Post Management */}
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/add-post" element={<CreatePost />} />
        
        {/* User Management */}
        <Route path="/userdashboard" element={<UserDashboard />} />

        {/*Monetization and reward management */}

        <Route path="/monetization/form" element={<MonetizationRequest />} />
        <Route path="/monetize" element={<MonetizationForm />} />
        
        {/* Optional: Category Filter */}
        <Route path="/category/:categoryName" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;