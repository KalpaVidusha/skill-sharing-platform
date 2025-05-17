import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import Posts from './pages/Posts/Posts';
import PostDetail from './pages/Posts/PostDetail';
import CreatePost from "./pages/Posts/CreatePost";
import MyPosts from "./pages/Posts/MyPosts";
import EditPost from "./pages/Posts/EditPost";
import MonetizationRequest from "./pages/monetizationAndRewardManagement/monetizationRequestForm";
import MonetizationForm from "./pages/monetizationAndRewardManagement/monetizationRequestForm";
import EditRequest from "./pages/monetizationAndRewardManagement/EditMonetization"; // This will be the edit page
import Applications from "./pages/monetizationAndRewardManagement/Applications";
import Feed from "./pages/Feed";
import Courses from "./pages/Courses";
import Progress from "./pages/Progress/ProgressAll";
import OAuthSuccess from "./pages/OAuthSuccess";
import NotificationsPage from './pages/Notification/NotificationsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import ProgressManagement from './pages/Admin/ProgressManagement';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LearningPlans, LearningPlanDetails } from './pages/LearningPlans';
import ProgreesOfUserdashboard from './pages/Progress/ProgreesOfUserdashboard';
import FollowList from './components/FollowList';
import UserSearch from './components/UserSearch';
import AdminDashboard2 from './pages/monetizationAndRewardManagement/AdminDashboard';

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-center" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* Core Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Post Management */}
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/add-post" element={<CreatePost />} />
        <Route path="/my-posts" element={<MyPosts />} />
        <Route path="/edit-post/:id" element={<EditPost />} />
        
        {/* User Management */}
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/userdashboard/followers" element={<UserDashboard />} />
        <Route path="/userdashboard/following" element={<UserDashboard />} />
        <Route path="/userdashboard/find-users" element={<UserDashboard />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/user-posts/:userId" element={<Posts />} />
        <Route path="/userdashboard/progress" element={<ProgreesOfUserdashboard />} />

        {/* Direct Routes for Followers, Following, and User Search */}
        <Route path="/followers" element={<FollowList type="followers" />} />
        <Route path="/following" element={<FollowList type="following" />} />
        <Route path="/find-users" element={<UserSearch />} />

        {/* New Routes */}
        <Route path="/feed" element={<Feed />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/*Monetization and reward management */}
        <Route path="/monetization/form" element={<MonetizationRequest />} />
        <Route path="/userdashboard/monetize" element={<MonetizationForm />} />
        <Route path="/userdashboard/Applications" element={<Applications />} />
        <Route path="/userdashboard/Applications/edit/:id" element={<EditRequest />} />
        <Route path="/AdminDashboard" element={<AdminDashboard2 />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/user-management" element={<UserManagement />} />
        <Route path="/admin/progress-management" element={<ProgressManagement />} />
        
        {/* Optional: Category Filter */}
        <Route path="/category/:categoryName" element={<Home />} />

        {/* Learning Plans */}
        <Route path="/userdashboard/learning-plans" element={<LearningPlans />} />
        <Route path="/userdashboard/learning-plans/:id" element={<LearningPlanDetails />} />
      </Routes>
    </Router>
  );
}

export default App;