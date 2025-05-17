import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaUsers, FaSearch, FaCompass,FaComments,FaUserShield, FaFileAlt, FaPlusCircle, FaChartLine, FaCoins, FaSignOutAlt, FaBrain, FaArrowRight, FaGraduationCap, FaCog, FaTachometerAlt, FaComment, FaDatabase } from "react-icons/fa";
import Swal from 'sweetalert2';
import apiService from "../../services/api";
import FollowList from "../../components/FollowList";
import UserSearch from "../../components/UserSearch";

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
    
    // Set active tab based on defaultActiveTab prop first, or URL path as fallback
    if (defaultActiveTab) {
      setActiveTab(defaultActiveTab);
    } else {
      // Set based on current URL path - check most specific paths first
      const path = window.location.pathname;
      
      // First priority - check specific userdashboard routes
      if (path.includes('/userdashboard/progress')) {
        setActiveTab('progress_tracker');
      } else if (path.includes('/userdashboard/settings')) {
        setActiveTab('settings');
      } else if (path.includes('/userdashboard/monetize')) {
        setActiveTab('monetization');
      } else if (path.includes('/userdashboard/learning-plans')) {
        setActiveTab('learning_plans');
      } 
      // Second priority - check other specific routes
      else if (path.includes('/my-posts')) {
        setActiveTab('myposts');
      } else if (path.includes('/followers')) {
        setActiveTab('followers');
      } else if (path.includes('/following')) {
        setActiveTab('following');
      } else if (path.includes('/find-users')) {
        setActiveTab('findUsers');  
      } 
      // Last priority - check most general routes
      else if (path === '/') {
        setActiveTab('explore');
      } else if (path.includes('/userdashboard')) {
        setActiveTab('profile');
      }
    }
  }, [userId, defaultActiveTab]);
  
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
  <aside className="flex flex-col h-screen shadow-xl w-72 bg-gradient-to-b from-gray-800 to-gray-900">
    {/* Logo/Branding */}
    <div className="flex items-center gap-3 p-6 pl-8">
      <div className="p-2 rounded-lg bg-white/10">
        <FaUserShield className="text-2xl text-red-400" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-white">User Panel</h2>
    </div>

    {/* Navigation Items */}
    <nav className="flex flex-col flex-1 gap-1 px-4">
      {[
        {
          id: "profile",
          icon: <FaTachometerAlt className="text-lg" />,
          label: "Dashboard",
          action: () => navigateWithTabUpdate("/userdashboard", "profile")
        },
        {
          id: "followers",
          icon: <FaUsers className="text-lg" />,
          label: `User Management (${userData.followers})`,
          action: () => navigate("/followers", { state: { userId } })
        },
        {
          id: "following",
          icon: <FaFileAlt className="text-lg" />,
          label: `Post Management (${userData.following})`,
          action: () => navigate("/following", { state: { userId } })
        },
        {
          id: "comments",
          icon: <FaComments className="text-lg" />,
          label: "Comment Management",
          action: () => navigateWithTabUpdate("/", "comments")
        },
        {
          id: "progress",
          icon: <FaChartLine className="text-lg" />,
          label: "Progress Management",
          action: () => navigateWithTabUpdate("/", "progress")
        },
        {
          id: "monetization",
          icon: <FaCoins className="text-lg" />,
          label: "Monetization List",
          action: () => navigateWithTabUpdate("/", "monetization")
        },
        {
          id: "findUsers",
          icon: <FaSearch className="text-lg" />,
          label: "Find Users",
          action: () => navigate("/find-users")
        },
        {
          id: "settings",
          icon: <FaCog className="text-lg" />,
          label: "Site Settings",
          action: () => navigateWithTabUpdate("/", "settings")
        },
        {
          id: "database",
          icon: <FaDatabase className="text-lg" />,
          label: "Database Management",
          action: () => navigateWithTabUpdate("/", "database")
        },
        
        
      ].map((item) => (
        <button
          key={item.id}
          onClick={item.action}
          className={`
            flex items-center gap-4 py-3 px-4 rounded-xl transition-all
            ${activeTab === item.id
              ? "bg-red-400/20 text-white shadow-md"
              : "text-blue-100 hover:bg-white/10 hover:text-white"}
          `}
        >
          <span className={`transition-transform ${activeTab === item.id ? "scale-110" : ""}`}>
            {item.icon}
          </span>
          <span className="font-medium">{item.label}</span>
          {activeTab === item.id && (
            <span className="w-2 h-2 ml-auto bg-red-300 rounded-full animate-pulse"></span>
          )}
        </button>
      ))}
    </nav>

    {/* User & Logout */}
    <div className="p-4 border-t border-gray-700">
      <div className="flex items-center gap-3 px-4 py-3 text-gray-200 transition rounded-lg hover:bg-white/10">
        <div className="relative">
          <img
            src={userData.avatar || "/default-avatar.png"}
            alt="Profile"
            className="object-cover border-2 rounded-full w-9 h-9 border-white/30"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-gray-800 rounded-full"></span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{userData.name}</p>
          <p className="text-xs text-gray-400 truncate">{userData.email}</p>
        </div>
      </div>

      <div className="flex mt-4 space-x-2">
        
          <FaUserShield className="mr-2" />
          <span>Admin Area</span>
        

        <button
          onClick={showLogoutConfirmation}
          className="flex-1 flex items-center justify-center py-2.5 px-4 text-gray-300 hover:text-white rounded-lg hover:bg-red-500/90 transition-all group bg-gray-700"
        >
          <FaSignOutAlt className="mr-2 text-red-400 transition group-hover:text-white" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  </aside>
);

};

export default Sidebar; 