import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaSignInAlt, FaUserPlus, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';

// Create a custom event for auth state changes
export const authStateChanged = new Event('authStateChanged');

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Function to check auth status
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
    // Initial check
    checkAuthStatus();
    
    // Listen for auth state changes
    window.addEventListener('authStateChanged', checkAuthStatus);
    
    // Clean up
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
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        performLogout();
      }
    });
  };

  const performLogout = () => {
    // Call the API service logout method
    import('../services/api').then(module => {
      const apiService = module.default;
      apiService.logout().then(() => {
        setIsLoggedIn(false);
        setUsername('');
        
        // Show success message
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          navigate('/login');
          
          // Dispatch auth state change event
          window.dispatchEvent(new Event('authStateChanged'));
        });
      });
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">SkillSphere</Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <Link to="/feed" className="px-3 py-2 rounded-md text-sm font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-700 transition duration-150">
                Feed
              </Link>
              <Link to="/courses" className="px-3 py-2 rounded-md text-sm font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-700 transition duration-150">
                Courses
              </Link>
            </div>
          </div>

          {/* Search bar - hidden on mobile, visible on medium screens and up */}
          <div className="hidden md:flex items-center flex-grow max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search for skills, courses..."
                />
              </div>
            </form>
          </div>

          {/* Right side navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-blue-900">
                  <FaUser className="h-4 w-4" />
                  <span className="text-sm font-medium">{username}</span>
                </div>
                <button
                  onClick={showLogoutConfirmation}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition duration-150"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 flex items-center rounded-md text-sm font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-700 transition duration-150">
                  <FaSignInAlt className="mr-2" /> Login
                </Link>
                <Link to="/signup" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition duration-150 flex items-center">
                  <FaUserPlus className="mr-2" /> Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-700 hover:text-blue-900 hover:bg-blue-50 focus:outline-none"
            >
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/feed" 
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Feed
            </Link>
            <Link 
              to="/courses" 
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Courses
            </Link>
          </div>
          
          {/* Mobile search */}
          <div className="px-2 py-3">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search..."
                />
              </div>
            </form>
          </div>
          
          {/* Mobile auth */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isLoggedIn ? (
              <div className="px-2 space-y-1">
                <div className="block px-3 py-2 rounded-md text-base font-medium text-blue-900">
                  <FaUser className="inline mr-2 h-4 w-4" />
                  <span>{username}</span>
                </div>
                <button
                  onClick={() => {
                    showLogoutConfirmation();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-1">
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-900 hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaSignInAlt className="inline mr-2" /> Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserPlus className="inline mr-2" /> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;