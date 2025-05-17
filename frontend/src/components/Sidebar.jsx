import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, FaUsers, FaSearch, FaCompass, FaFileAlt, FaPlusCircle, 
  FaChartLine, FaCoins, FaSignOutAlt, FaBrain, FaArrowRight, 
  FaGraduationCap, FaCog
} from "react-icons/fa";
import Swal from 'sweetalert2';
import apiService from "../services/api";

// Update component to accept userId prop
const Sidebar = ({ defaultActiveTab = "profile", userId }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const navigate = useNavigate();
  const isDataFetched = useRef(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Memoize the initial userData to prevent it from being recreated on re-renders
  const initialUserData = useMemo(() => {
    const username = localStorage.getItem('username') || 'User';
    const email = localStorage.getItem('email') || 'user@example.com';
    const firstName = localStorage.getItem('firstName') || username.charAt(0).toUpperCase() || "U";
    const lastName = localStorage.getItem('lastName') || "S";
    
    return {
      name: username,
      firstName,
      lastName,
      email: email,
      followers: parseInt(localStorage.getItem('followersCount') || '0'),
      following: parseInt(localStorage.getItem('followingCount') || '0')
    };
  }, []);
  
  const [userData, setUserData] = useState(initialUserData);
  
  // Memoize user initials to avoid recalculating on re-renders
  const userInitials = useMemo(() => {
    const firstLetter = userData.firstName?.charAt(0) || "U";
    const lastLetter = userData.lastName?.charAt(0) || "";
    return (firstLetter + lastLetter).toUpperCase();
  }, [userData.firstName, userData.lastName]);
  
  // Fetch user data only once on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Only fetch user data once
        if (isDataFetched.current) return;
        
        const userIdToUse = userId || localStorage.getItem('userId');
        if (!userIdToUse) return;
        
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

          // Store counts in localStorage for persistence
          localStorage.setItem('followersCount', followersCount);
          localStorage.setItem('followingCount', followingCount);
        } catch (error) {
          console.error("Error fetching follow data:", error);
        }
        
        // Update only the counts, preserve name and email
        setUserData(prev => ({
          ...prev,
          followers: followersCount,
          following: followingCount
        }));
        
        isDataFetched.current = true;
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserData();
    
    // Listen for follow events to update follower/following counts
    const handleFollowStatusChange = (event) => {
      const { action, targetUserId } = event.detail;
      const currentUserId = localStorage.getItem('userId');
      
      // Update follower count if current user profile is being followed/unfollowed
      if (targetUserId === currentUserId) {
        setUserData(prev => {
          const newFollowers = action === 'follow' 
            ? prev.followers + 1 
            : Math.max(0, prev.followers - 1);
          localStorage.setItem('followersCount', newFollowers);
          return {
            ...prev,
            followers: newFollowers
          };
        });
      }
      
      // Update following count if current user is following/unfollowing someone
      if (event.detail.currentUserId === currentUserId) {
        setUserData(prev => {
          const newFollowing = action === 'follow' 
            ? prev.following + 1 
            : Math.max(0, prev.following - 1);
          localStorage.setItem('followingCount', newFollowing);
          return {
            ...prev,
            following: newFollowing
          };
        });
      }
    };
    
    window.addEventListener('followStatusChanged', handleFollowStatusChange);
    
    // Set active tab based on URL path
    const updateActiveTabFromURL = () => {
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
    };
    
    if (defaultActiveTab) {
      setActiveTab(defaultActiveTab);
    } else {
      updateActiveTabFromURL();
    }
    
    // Check if sidebar should be collapsed on mobile
    const checkWindowSize = () => {
      setCollapsed(window.innerWidth < 768);
    };
    
    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);
    
    return () => {
      window.removeEventListener('resize', checkWindowSize);
      window.removeEventListener('followStatusChanged', handleFollowStatusChange);
    };
  // Remove dependency on defaultActiveTab to prevent re-fetching
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
      isDataFetched.current = false;
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
  
  // Memoize user profile component to prevent re-renders when switching tabs
  // Moved after showLogoutConfirmation is defined to fix "Cannot access before initialization" error
  const UserProfileSection = useMemo(() => {
    return (
      <div className="mt-auto">
        <div className={`mx-4 px-3 py-3 ${collapsed ? 'flex justify-center' : ''} 
                        border-t border-indigo-500/30`}>
          <div className={`flex items-center gap-3`}>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium bg-indigo-600 text-white border-2 border-indigo-300/30">
                {userInitials}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-800"></span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{userData.name}</p>
                <p className="text-xs text-indigo-200/80 truncate">{userData.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="py-3 px-4">
          <button 
            onClick={showLogoutConfirmation}
            className="w-full flex items-center gap-3 py-2.5 px-4 text-indigo-100 hover:text-white rounded-lg hover:bg-red-500/90 transition-all group"
          >
            <FaSignOutAlt className="text-red-300 group-hover:text-white transition" />
            {!collapsed && <span>Logout</span>}
            {!collapsed && (
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                <FaArrowRight />
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }, [userData.name, userData.email, userInitials, collapsed, navigate]);

  // Organize navigation items by category
  const navigationItems = {
    profile: [
      { 
        id: "profile", 
        icon: <FaUser />, 
        label: "Profile", 
        action: () => navigateWithTabUpdate("/userdashboard", "profile") 
      },
      { 
        id: "followers", 
        icon: <FaUsers />, 
        label: `Followers ${userData.followers > 0 ? `(${userData.followers})` : ''}`, 
        action: () => navigate("/followers", { state: { userId } })
      },
      { 
        id: "following", 
        icon: <FaUsers />, 
        label: `Following ${userData.following > 0 ? `(${userData.following})` : ''}`, 
        action: () => navigate("/following", { state: { userId } })
      },
      { 
        id: "findUsers", 
        icon: <FaSearch />, 
        label: "Find Users", 
        action: () => navigate("/find-users") 
      },
    ],
    content: [
      // Explore removed as per user request
      { 
        id: "myposts", 
        icon: <FaFileAlt />, 
        label: "My Posts", 
        action: () => navigateWithTabUpdate("/my-posts", "myposts") 
      },
      { 
        id: "addpost", 
        icon: <FaPlusCircle />, 
        label: "Create Post", 
        action: handleAddPost
      },
    ],
    learning: [
      { 
        id: "learning_plans", 
        icon: <FaGraduationCap />, 
        label: "Learning Plans", 
        action: () => navigateWithTabUpdate("/userdashboard/learning-plans", "learning_plans") 
      },
      { 
        id: "progress_tracker", 
        icon: <FaChartLine />, 
        label: "My Progress", 
        action: () => navigateWithTabUpdate("/userdashboard/progress", "progress_tracker") 
      },
    ],
    settings: [
      { 
        id: "monetization", 
        icon: <FaCoins />, 
        label: "Monetization", 
        action: () => navigateWithTabUpdate("/userdashboard/monetize", "monetization") 
      },
      { 
        id: "settings", 
        icon: <FaCog />, 
        label: "Settings", 
        action: () => navigateWithTabUpdate("/userdashboard/settings", "settings") 
      },
    ]
  };

  const renderNavItem = (item) => (
    <button 
      key={item.id}
      onClick={item.action}
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      className={`
        flex items-center justify-between ${activeTab === item.id ? 'py-3.5' : 'py-3'} px-5 rounded-xl transition-all duration-200 w-full
        ${activeTab === item.id 
          ? "bg-indigo-500/30 text-white font-medium shadow-md" 
          : item.highlight  
            ? "text-indigo-100 bg-indigo-500/20 hover:bg-indigo-500/30"
            : "text-indigo-100 hover:bg-white/10 hover:text-white"
        }
        ${hoveredItem === item.id && activeTab !== item.id ? "translate-x-1" : ""}
        group relative
      `}
    >
      <div className="flex items-center gap-3">
        <span className={`transition-all duration-200 text-lg ${activeTab === item.id ? "text-white scale-110" : "text-indigo-200"}`}>
          {item.icon}
        </span>
        <span className={`transition-all duration-200 ${collapsed ? "opacity-0 w-0" : "opacity-100"} ${activeTab === item.id ? "font-medium" : ""}`}>
          {item.label}
        </span>
      </div>
      
      {activeTab === item.id && (
        <div className="h-2 w-2 rounded-full bg-blue-300 animate-pulse"></div>
      )}
    </button>
  );

  return (
    <aside className={`
      flex flex-col ${collapsed ? "w-20" : "w-72"} h-full max-h-[calc(100vh-5rem)] 
      transition-all duration-300 ease-in-out overflow-hidden
      bg-gradient-to-b from-indigo-900 to-indigo-800 shadow-xl
    `}>
      {/* Navigation Sections - Centered vertically */}
      <div className="flex flex-col flex-1 p-4 justify-center space-y-3 py-10">
        {/* Profile Section */}
        <div className="mb-3">
          {!collapsed && (
            <div className="flex items-center mb-2 px-2">
              <span className="text-xs font-medium uppercase tracking-wider text-indigo-300/80">Profile</span>
              <span className="ml-3 flex-grow h-px bg-indigo-500/20"></span>
            </div>
          )}
          <div className="space-y-1">
            {navigationItems.profile.map(renderNavItem)}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="mb-3">
          {!collapsed && (
            <div className="flex items-center mb-2 px-2">
              <span className="text-xs font-medium uppercase tracking-wider text-indigo-300/80">Content</span>
              <span className="ml-3 flex-grow h-px bg-indigo-500/20"></span>
            </div>
          )}
          <div className="space-y-1">
            {navigationItems.content.map(renderNavItem)}
          </div>
        </div>
        
        {/* Learning Section */}
        <div className="mb-3">
          {!collapsed && (
            <div className="flex items-center mb-2 px-2">
              <span className="text-xs font-medium uppercase tracking-wider text-indigo-300/80">Learning</span>
              <span className="ml-3 flex-grow h-px bg-indigo-500/20"></span>
            </div>
          )}
          <div className="space-y-1">
            {navigationItems.learning.map(renderNavItem)}
          </div>
        </div>
        
        {/* Settings Section */}
        <div>
          {!collapsed && (
            <div className="flex items-center mb-2 px-2">
              <span className="text-xs font-medium uppercase tracking-wider text-indigo-300/80">Settings</span>
              <span className="ml-3 flex-grow h-px bg-indigo-500/20"></span>
            </div>
          )}
          <div className="space-y-1">
            {navigationItems.settings.map(renderNavItem)}
          </div>
        </div>
      </div>

      {/* Use the memoized user profile section */}
      {UserProfileSection}
    </aside>
  );
};

export default Sidebar; 