import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Core Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";

// Post Pages
import Posts from './pages/Posts/Posts';
import PostDetail from './pages/Posts/PostDetail';
import CreatePost from "./pages/Posts/CreatePost";

// Future Features
// import EditPost from "./pages/Posts/EditPost";
// import Profile from "./pages/Profile";
// import LearningPlans from "./pages/Posts/LearningPlans";
// import Search from "./pages/Posts/Search";

function App() {
  return (
    <Router>
      <Routes>
        {/* Core Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Post Management */}
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/add-post" element={<CreatePost />} />
        
        {/* User Dashboard */}
        <Route path="/userdashboard" element={<UserDashboard />} />

        {/* Category Filter */}
        <Route path="/category/:categoryName" element={<Home />} />

        {/* Future Features */}
        {/* <Route path="/edit-post/:id" element={<EditPost />} /> */}
        {/* <Route path="/profile/:userId" element={<Profile />} /> */}
        {/* <Route path="/learning-plans" element={<LearningPlans />} /> */}
        {/* <Route path="/search" element={<Search />} /> */}
      </Routes>
    </Router>
  );
}

export default App;