import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaUsers, FaSearch, FaCompass, FaFileAlt, FaPlusCircle, FaChartLine, FaCoins, FaSignOutAlt, FaBrain, FaArrowRight } from "react-icons/fa";
import Swal from 'sweetalert2';
import apiService from "../services/api";
import FollowList from "./FollowList";
import UserSearch from "./UserSearch";

// Update component to accept userId prop
const Sidebar = ({ defaultActiveTab = "profile", userId }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    avatar: "",
    followers: 0,
    following: 0
  });
  
  const navigate = useNavigate();
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userIdToUse = userId || localStorage.getItem('userId');
        if (!userIdToUse) return;
        
        // Get basic user info from localStorage
        const username = localStorage.getItem('username');
        const email = localStorage.getItem('email');
        
        // Fetch followers and following counts
        let followersCount = 0;
        let followingCount = 0;
        try {
          const followersResponse = await apiService.getFollowers(userIdToUse);
          const followingResponse = await apiService.getFollowing(userIdToUse);
          
          if (followersResponse && followersResponse.count) {
            followersCount = followersResponse.count;
          }
          
          if (followingResponse && followingResponse.count) {
            followingCount = followingResponse.count;
          }
        } catch (error) {
          console.error("Error fetching follow data:", error);
        }
        
        setUserData({
          name: username || 'User',
          email: email || 'user@example.com',
          avatar: "/default-avatar.png", // You can fetch actual avatar if available
          followers: followersCount,
          following: followingCount
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserData();
    
    // Set active tab based on current URL path
    const path = window.location.pathname;
    if (path.includes('/userdashboard/progress')) {
      setActiveTab('progress_tracker');
    } else if (path.includes('/my-posts')) {
      setActiveTab('myposts');
    } else if (path === '/') {
      setActiveTab('explore');
    } else if (path.includes('/followers')) {
      setActiveTab('followers');
    } else if (path.includes('/following')) {
      setActiveTab('following');
    } else if (path.includes('/find-users')) {
      setActiveTab('findUsers');  
    } else if (path.includes('/userdashboard')) {
      setActiveTab('profile');
    } else if (path.includes('/monetize')) {
      setActiveTab('monetization');
    }
  }, [userId]);
  
  // Update activeTab when navigating to a page
  const navigateWithTabUpdate = (path, tabId) => {
    setActiveTab(tabId);
    navigate(path);
  };
  
  const showLogoutConfirmation = () => {
    Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      background: '#ffffff',
      backdrop: 'rgba(79, 70, 229, 0.1)'
    }).then((result) => {
      if (result.isConfirmed) {
        performLogout();
      }
    });
  };
  
  const performLogout = () => {
    apiService.logout().then(() => {
      localStorage.clear();
      Swal.fire({
        title: 'Logged Out!',
        text: 'You have been successfully logged out.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff'
      }).then(() => {
        navigate('/login');
      });
    }).catch(error => {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate('/login');
    });
  };
  
  const handleAddPost = () => navigate("/add-post");

  return (
    <aside className="flex flex-col w-72 h-full max-h-[calc(100vh-5rem)] overflow-y-auto gap-6 p-6 bg-gradient-to-b from-blue-700 to-blue-600 shadow-xl">
      {/* Logo/Branding */}
      <div className="flex items-center gap-3 mb-8 pl-2">
        <div className="p-2 bg-white/10 rounded-lg">
          <FaBrain className="text-2xl text-blue-200" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">SkillSphere</h2>
      </div>
      {/* Navigation Items */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {[
          { 
            id: "profile", 
            icon: <FaUser className="text-lg" />, 
            label: "Profile", 
            action: () => navigateWithTabUpdate("/userdashboard", "profile") 
          },
          { 
            id: "followers", 
            icon: <FaUsers className="text-lg" />, 
            label: `Followers (${userData.followers})`, 
            action: () => navigate("/followers", 
              { state: { userId } }) 
          },
          { 
            id: "following", 
            icon: <FaUsers className="text-lg" />, 
            label: `Following (${userData.following})`, 
            action: () => navigate("/following", 
              { state: { userId } }) 
            },
          { 
            id: "findUsers", 
            icon: <FaSearch className="text-lg" />, 
            label: "Find Users", 
            action: () => navigate("/find-users") 
          },
          { 
            id: "explore", 
            icon: <FaCompass className="text-lg" />, 
            label: "Explore", 
            action: () => navigateWithTabUpdate("/", "explore") 
          },
          { 
            id: "myposts", 
            icon: <FaFileAlt className="text-lg" />, 
            
            label: "My Posts", action: () => navigateWithTabUpdate("/my-posts", "myposts") 
          },
          { 
            id: "addpost", 
            icon: <FaPlusCircle className="text-lg" />, 
            label: "Create Post", action: handleAddPost 
          },
          { 
            id: "progress_tracker", 
            icon: <FaChartLine className="text-lg" />, 
            label: "My Progress", 
            action: () => navigateWithTabUpdate("/userdashboard/progress", "progress_tracker") 
          },
          { 
            id: "monetization", 
            icon: <FaCoins className="text-lg" />, 
            label: "Monetization", 
            action: () => navigateWithTabUpdate("/userdashboard/monetize", "monetization") 
          },
          
        ].map((item) => (
          <button 
            key={item.id}
            onClick={item.action}
            className={`
              flex items-center gap-4 py-3 px-4 rounded-xl transition-all
              ${activeTab === item.id 
                ? "bg-white/20 text-white shadow-md" 
                : "text-blue-100 hover:bg-white/10 hover:text-white"}
            `}
            data-tab={item['data-tab']}
          >
            <span className={`transition-transform ${activeTab === item.id ? "scale-110" : ""}`}>
              {item.icon}
            </span>
            <span className="font-medium">{item.label}</span>
            {activeTab === item.id && (
              <span className="ml-auto w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
            )}
          </button>
        ))}
      </div>
      {/* User & Logout */}
      <div className="mt-auto border-t border-blue-500/30 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 text-blue-50 rounded-lg hover:bg-white/10 transition">
          <div className="relative">
            <img 
              src={userData.avatar || "/default-avatar.png"} 
              alt="Profile" 
              className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-600"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{userData.name}</p>
            <p className="text-xs text-blue-200/80 truncate">{userData.email}</p>
          </div>
        </div>
        <button 
          onClick={showLogoutConfirmation}
          className="w-full mt-4 flex items-center gap-3 py-2.5 px-4 text-blue-100 hover:text-white rounded-lg hover:bg-red-500/90 transition-all group"
        >
          <FaSignOutAlt className="text-red-300 group-hover:text-white transition" />
          <span>Logout</span>
          <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs">
            <FaArrowRight />
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 