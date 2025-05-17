import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaUsers, 
  FaFileAlt, 
  FaChartLine, 
  FaSignOutAlt, 
  FaBrain, 
  FaUserShield,
  FaComments,
  FaTachometerAlt,
  FaCog,
  FaDatabase,
  FaCoins,
  FaSearch
} from "react-icons/fa";
import Swal from 'sweetalert2';
import apiService from "../../services/api";

const AdminSidebar = ({ activeTab = "dashboard" }) => {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const navigate = useNavigate();
  
  // Update currentTab when activeTab prop changes
  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);
  
  // Update activeTab when navigating to a page
  const navigateWithTabUpdate = (path, tabId) => {
    setCurrentTab(tabId);
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

  return (
    <aside className="flex flex-col h-screen shadow-xl w-72 bg-gradient-to-b from-gray-800 to-gray-900">
      {/* Logo/Branding */}
      <div className="flex items-center gap-3 p-6 pl-8">
        <div className="p-2 rounded-lg bg-white/10">
          <FaUserShield className="text-2xl text-red-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Admin Panel</h2>
      </div>
      
      {/* Navigation Items - Fixed height with no overflow */}
      <nav className="flex flex-col flex-1 gap-1 px-4">
        {[
          { 
            id: "dashboard", 
            icon: <FaTachometerAlt className="text-lg" />, 
            label: "Dashboard", 
            action: () => navigateWithTabUpdate("/admin", "dashboard") 
          },
          { 
            id: "users", 
            icon: <FaUsers className="text-lg" />, 
            label: "Users Management", 
            action: () => navigateWithTabUpdate("/admin/user-management", "users") 
          },
          { 
            id: "posts", 
            icon: <FaFileAlt className="text-lg" />, 
            label: "Posts Management", 
            action: () => navigateWithTabUpdate("/admin/post-management", "posts") 
          },
          { 
            id: "comments", 
            icon: <FaComments className="text-lg" />, 
            label: "Comments Management", 
            action: () => navigateWithTabUpdate("/admin/comment-management", "comments") 
          },
          { 
            id: "progress", 
            icon: <FaChartLine className="text-lg" />, 
            label: "Progress Management", 
            action: () => navigateWithTabUpdate("/admin/progress-management", "progress") 
          },
          { 
            id: "monetization", 
            icon: <FaCoins className="text-lg" />, 
            label: "Monetization List", 
            action: () => navigateWithTabUpdate("AdminMonetize", "monetization") 
          },
          { 
            id: "settings", 
            icon: <FaCog className="text-lg" />, 
            label: "Site Settings", 
            action: () => navigateWithTabUpdate("#") 
          },
          { 
            id: "database", 
            icon: <FaDatabase className="text-lg" />, 
            label: "Database Management", 
            action: () => navigateWithTabUpdate("#") 
          },
        ].map((item) => (
          <button 
            key={item.id}
            onClick={item.action}
            className={`
              flex items-center gap-4 py-3 px-4 rounded-xl transition-all
              ${currentTab === item.id 
                ? "bg-red-500/20 text-white shadow-md" 
                : "text-gray-300 hover:bg-white/10 hover:text-white"}
            `}
          >
            <span className={`transition-transform ${currentTab === item.id ? "scale-110" : ""}`}>
              {item.icon}
            </span>
            <span className="font-medium">{item.label}</span>
            {currentTab === item.id && (
              <span className="w-2 h-2 ml-auto bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
        ))}
      </nav>
      
      {/* User & Logout - Fixed at bottom */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3 text-gray-200 transition rounded-lg hover:bg-white/10">
          <div className="relative">
            <div className="flex items-center justify-center text-white bg-red-500 rounded-full w-9 h-9">
              <FaUserShield />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-gray-800 rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">Administrator</p>
            <p className="text-xs text-gray-400 truncate">Admin Control Panel</p>
          </div>
        </div>
        
        <div className="flex mt-4 space-x-2">
          <Link 
            to="/userdashboard"
            className="flex-1 flex items-center justify-center py-2.5 px-4 text-gray-300 hover:text-white rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
          >
            <FaBrain className="mr-2" />
            <span>User Area</span>
          </Link>
          
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

export default AdminSidebar; 