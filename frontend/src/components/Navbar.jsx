import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaSignInAlt, FaUserPlus, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { FiBook, FiHome, FiLogOut } from 'react-icons/fi';

export const authStateChanged = new Event('authStateChanged');

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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
    import('../services/api').then(module => {
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
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-gradient-to-r from-indigo-50 to-blue-50 py-3'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and primary navigation */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-800 rounded-full shadow-md">
                    <div className="absolute inset-1 bg-white/30 rounded-full"></div>
                  </div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent">
                  SkillSphere
                </span>
              </Link>
              
              <div className="hidden md:ml-10 md:flex md:items-center md:space-x-6">
                <Link 
                  to="/feed" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-200 flex items-center"
                >
                  <FiHome className="mr-2" /> Feed
                </Link>
                <Link 
                  to="/courses" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-200 flex items-center"
                >
                  <FiBook className="mr-2" /> Courses
                </Link>
                <Link 
                  to="/progress" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-200 flex items-center"
                >
                  <FiBook className="mr-2" /> Progress
                </Link>
              </div>
            </div>

            {/* Search bar */}
            <div className="hidden md:flex items-center flex-grow max-w-md mx-6">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl leading-5 bg-white/80 backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200"
                    placeholder="Search skills, courses..."
                  />
                </div>
              </form>
            </div>

            {/* Right side navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/userdashboard"
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{username}</span>
                  </Link>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
                  >
                    <FiLogOut className="mr-2" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/login" 
                    className="px-4 py-2 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-all duration-200 flex items-center"
                  >
                    <FaSignInAlt className="mr-2" /> Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
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
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            {/* Trick for vertical centering */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal content */}
            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg 
                      className="h-6 w-6 text-blue-600" 
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
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
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCancelLogout}
                >
                  Stay Logged In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;