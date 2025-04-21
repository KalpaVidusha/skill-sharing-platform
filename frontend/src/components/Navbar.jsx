import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaSignInAlt, FaUserPlus, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { FiBook, FiHome, FiLogOut } from 'react-icons/fi';
import Swal from 'sweetalert2';

export const authStateChanged = new Event('authStateChanged');

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
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
    
    if (isLoggedInFlag === 'true' && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    } else {
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
    import('../services/api').then(module => {
      const apiService = module.default;
      apiService.logout().then(() => {
        setIsLoggedIn(false);
        setUsername('');
        
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#ffffff'
        }).then(() => {
          navigate('/login');
          window.dispatchEvent(new Event('authStateChanged'));
        });
      });
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
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
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{username}</span>
                </div>
                <button
                  onClick={showLogoutConfirmation}
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
  );
};

export default Navbar;