import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import Posts from './pages/Posts/Posts';
import PostDetail from './pages/Posts/PostDetail';
//import CreatePost from "./pages/Posts/CreatePost";

//import Profile from "./pages/Profile";
//import LearningPlans from "./pages/Posts/LearningPlans";
//import Search from "./pages/Posts/Search";
//import EditPost from "./pages/Posts/EditPost"; // Create this component

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
        
        {/* User Management */}
        <Route path="/userdashboard" element={<UserDashboard />} />
        
        
       
        
        {/* Optional: Category Filter */}
        <Route path="/category/:categoryName" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;