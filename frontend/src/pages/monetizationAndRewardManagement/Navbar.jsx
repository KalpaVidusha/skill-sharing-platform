import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaSignInAlt, FaUserPlus, FaUser, FaBars, FaTimes, FaEnvelope } from 'react-icons/fa';
import { FiBook, FiHome, FiLogOut, FiBookmark } from 'react-icons/fi';
import NotificationDropdown from '../../pages/Notification/NotificationDropdown';
import ChatBox from '../../pages/ChatBox/ChatBox';
import { FiTrendingUp } from 'react-icons/fi';

export const authStateChanged = new Event('authStateChanged');

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkAuthStatus = () => {
    const isLoggedInFlag = localStorage.getItem('isLoggedIn');
    const storedUsername = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    
    if (isLoggedInFlag === 'true' && storedUsername && token) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    } else {
      // If any required auth data is missing, clear all auth data
      if (isLoggedInFlag === 'true' || storedUsername || token) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
      }
      setIsLoggedIn(false);
      setUsername('');
    }
  };

  useEffect(() => {
    checkAuthStatus();
    window.addEventListener('authStateChanged', checkAuthStatus);
    return () => {
      window.removeEventListener('authStateChanged', checkAuthStatus);
    };
  }, []);

  const handleLogout = () => {
    import('../../services/api').then(module => {
      const apiService = module.default;
      apiService.logout().then(() => {
        setIsLoggedIn(false);
        setUsername('');
        setShowLogoutModal(false);
        
        // Force a clean navigation to login page instead of just using navigate
        // This prevents browser back button from showing cached authenticated views
        window.location.href = '/login';
        
        // Dispatch event for other components that might need to react to logout
        window.dispatchEvent(new Event('authStateChanged'));
      });
    });
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
     <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2 border-b border-gray-100/50' : 'bg-gradient-to-r from-indigo-50/95 to-blue-50/95 backdrop-blur-md py-3'}`}>
  <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo and primary navigation */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative transition-transform duration-300 group-hover:rotate-12">
            <div className="flex items-center justify-center w-10 h-10 overflow-hidden rounded-full shadow-lg bg-gradient-to-br from-blue-600 to-indigo-800">
              <div className="absolute inset-0 border-2 rounded-full border-white/20"></div>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text">
            SkillSphere
          </span>
        </Link>
        
        <div className="hidden md:ml-10 md:flex md:items-center md:space-x-1">
          <Link 
            to="/posts" 
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-300 rounded-lg hover:text-indigo-700 hover:bg-indigo-50/50 group"
          >
            <FiBook className="mr-2 text-indigo-500 transition-colors group-hover:text-indigo-600" />
            <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-300 group-hover:after:w-full">
              Courses
            </span>
          </Link>
          <Link 
            to="/userdashboard/progress" 
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-300 rounded-lg hover:text-indigo-700 hover:bg-indigo-50/50 group"
          >
            <FiTrendingUp className="mr-2 text-indigo-500 transition-colors group-hover:text-indigo-600" />
            <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-300 group-hover:after:w-full">
              Progress
            </span>
          </Link>
          <Link 
            to="/userdashboard/learning-plans" 
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-300 rounded-lg hover:text-indigo-700 hover:bg-indigo-50/50 group"
          >
            <FiBookmark className="mr-2 text-indigo-500 transition-colors group-hover:text-indigo-600" />
            <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-300 group-hover:after:w-full">
              Learning Plans
            </span>
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div className="items-center flex-grow hidden max-w-md mx-6 md:flex">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full py-2 pl-10 pr-4 leading-5 placeholder-gray-400 transition-all duration-300 border shadow-sm border-gray-200/80 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent hover:shadow-md"
              placeholder="Search skills, courses..."
            />
          </div>
        </form>
      </div>

      {/* Right side navigation */}
      <div className="hidden md:flex md:items-center md:space-x-3">
        {isLoggedIn ? (
          <div className="flex items-center space-x-3">
            <NotificationDropdown />
            
            <button
              onClick={() => setIsChatOpen(true)}
              className="relative p-2 text-gray-600 transition-colors duration-300 rounded-full shadow-sm bg-white/80 hover:text-indigo-600 hover:shadow-md group"
            >
              <FaEnvelope className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="absolute flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full -top-1 -right-1 animate-pulse">
                3
              </span>
            </button>
            
            <div className="relative group">
              <Link 
                to="/userdashboard"
                className="flex items-center px-3 py-2 space-x-2 text-gray-700 transition-all duration-300 rounded-lg shadow-sm bg-white/80 hover:bg-white hover:shadow-md"
              >
                <div className="relative flex items-center justify-center w-8 h-8 overflow-hidden text-sm font-medium text-white rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                  {username.charAt(0).toUpperCase()}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
                <span className="text-sm font-medium">{username}</span>
              </Link>
              <div className="absolute right-0 z-50 invisible w-48 py-1 mt-1 transition-all duration-300 bg-white rounded-lg shadow-xl opacity-0 group-hover:visible group-hover:opacity-100">
                <Link to="/userdashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50/50">Your Profile</Link>
                <Link to="/userdashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50/50">Settings</Link>
                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50/50"
                >
                  <FiLogOut className="mr-2" /> Sign out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link 
              to="/login" 
              className="flex items-center px-4 py-2 text-sm font-medium text-indigo-700 transition-all duration-300 rounded-lg shadow-sm hover:bg-indigo-50/50 hover:shadow-md"
            >
              <FaSignInAlt className="mr-2" /> Login
            </Link>
            <Link 
              to="/signup" 
              className="flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg"
            >
              <FaUserPlus className="mr-2" /> Register
            </Link>
          </div>
        )}
      </div>
    </div>
  </div>
</nav>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>

            {/* Trick for vertical centering */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal content */}
            <div className="inline-block overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                    <svg 
                      className="w-6 h-6 text-blue-600" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Ready to leave?
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to log out? You'll need to sign in again to access your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCancelLogout}
                >
                  Stay Logged In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Box */}
      <ChatBox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default Navbar;