import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const AuthRequiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with blur effect */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-700 bg-opacity-60 backdrop-blur-sm" 
          onClick={onClose}
          aria-hidden="true"
        ></div>

        {/* This element centers the modal contents */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div 
          className="inline-block overflow-hidden text-left align-middle transition-all transform bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/70 sm:my-8 sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative header line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          
          <div className="px-6 pt-8 pb-6">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full">
                <FaUserLock className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-md text-gray-600 mb-6 max-w-md mx-auto">
                You need to be signed in to access this section of the platform. Join our community to track your learning progress and connect with others.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <button
                onClick={handleLogin}
                className="flex items-center justify-center gap-2 px-5 py-3 font-medium text-white transition-all duration-200 bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <FaSignInAlt /> 
                <span>Sign In</span>
              </button>
              <button
                onClick={handleSignup}
                className="flex items-center justify-center gap-2 px-5 py-3 font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <FaUserPlus />
                <span>Create Account</span>
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
              >
                Return to previous page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal; 