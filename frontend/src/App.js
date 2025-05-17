import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//user
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import ProgreesOfUserdashboard from './pages/Userdashboard/Progress/ProgreesOfUserdashboard';
import FollowList from './components/FollowList';
import UserSearch from './components/UserSearch';
import Settings from './pages/Userdashboard/Settings';

//posts
import Posts from './pages/Posts/Posts';
import PostDetail from './pages/Posts/PostDetail';
import CreatePost from "./pages/Posts/CreatePost";
import MyPosts from "./pages/Posts/MyPosts";
import EditPost from "./pages/Posts/EditPost";

//Monetization
import MonetizationRequest from "./pages/monetizationAndRewardManagement/monetizationRequestForm";
import MonetizationForm from "./pages/monetizationAndRewardManagement/monetizationRequestForm";
import EditRequest from "./pages/monetizationAndRewardManagement/EditMonetization"; // This will be the edit page
import Applications from "./pages/monetizationAndRewardManagement/Applications";

import Feed from "./pages/Feed";
import Courses from "./pages/Courses";

//progress
import Progress from "./pages/Progress/ProgressAll";

//OAuth
import OAuthSuccess from "./pages/OAuthSuccess";

//Notifications
import NotificationsPage from './pages/Notification/NotificationsPage';

//Admin
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import ProgressManagement from './pages/Admin/ProgressManagement';
import PostManagement from './pages/Admin/PostManagement';
import CommentManagement from './pages/Admin/CommentManagement';
import AdminProtectedRoute from './pages/Admin/AdminProtectedRoute';

//Learning Plans
import { LearningPlans, LearningPlanDetails } from './pages/LearningPlans';

//Auth Protection
import ProtectedRoute from './components/ProtectedRoute';

//Toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


//ScrollToTop
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
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
        <Route path="/add-post" element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        } />
        <Route path="/my-posts" element={
          <ProtectedRoute>
            <MyPosts />
          </ProtectedRoute>
        } />
        <Route path="/edit-post/:id" element={
          <ProtectedRoute>
            <EditPost />
          </ProtectedRoute>
        } />
        
        {/* User Management - Protected */}
        <Route path="/userdashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/userdashboard/followers" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/userdashboard/following" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/userdashboard/find-users" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>} />
          
        <Route path="/user-posts/:userId" element={<Posts />} />
        <Route path="/userdashboard/progress" element={
          <ProtectedRoute>
            <ProgreesOfUserdashboard />
          </ProtectedRoute>
        } />
        <Route path="/userdashboard/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        {/* Direct Routes for Followers, Following, and User Search - Protected */}
        <Route path="/followers" element={
          <ProtectedRoute>
            <FollowList type="followers" />
          </ProtectedRoute>
        } />
        <Route path="/following" element={
          <ProtectedRoute>
            <FollowList type="following" />
          </ProtectedRoute>
        } />
        <Route path="/find-users" element={
          <ProtectedRoute>
            <UserSearch />
          </ProtectedRoute>
        } />

        {/* New Routes */}
        <Route path="/feed" element={<Feed />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/progress" element={<Progress />} />

        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />

        {/*Monetization and reward management - Protected */}
        <Route path="/monetization/form" element={
          <ProtectedRoute>
            <MonetizationRequest />
          </ProtectedRoute>
        } />
        <Route path="/userdashboard/monetize" element={
          <ProtectedRoute>
            <MonetizationForm />
          </ProtectedRoute>
        } />
        <Route path="/userdashboard/Applications" element={
          <ProtectedRoute>
            <Applications />
          </ProtectedRoute>
        } />
        <Route path="/userdashboard/Applications/edit/:id" element={
          <ProtectedRoute>
            <EditRequest />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes - Protected with AdminProtectedRoute for enhanced security */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/user-management" element={
          <AdminProtectedRoute>
            <UserManagement />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/progress-management" element={
          <AdminProtectedRoute>
            <ProgressManagement />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/post-management" element={
          <AdminProtectedRoute>
            <PostManagement />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/comment-management" element={
          <AdminProtectedRoute>
            <CommentManagement />
          </AdminProtectedRoute>
        } />
        
        {/* Optional: Category Filter */}
        <Route path="/category/:categoryName" element={<Home />} />

        {/* Learning Plans - Protected */}
        <Route path="/userdashboard/learning-plans" element={
          <ProtectedRoute>
            <LearningPlans />
          </ProtectedRoute>
        } />
        <Route path="/userdashboard/learning-plans/:id" element={
          <ProtectedRoute>
            <LearningPlanDetails />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;