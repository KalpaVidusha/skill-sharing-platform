import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaExclamationTriangle, FaUserShield, FaHome, FaSignInAlt } from 'react-icons/fa';

const AdminAuthRequiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with stronger blur effect */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-75 backdrop-blur-md" 
          onClick={onClose}
          aria-hidden="true"
        ></div>

        {/* This element centers the modal contents */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel with alert styling */}
        <div 
          className="inline-block overflow-hidden text-left align-middle transition-all transform bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border-2 border-red-500 sm:my-8 sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Red security strip */}
          <div className="h-2 bg-gradient-to-r from-red-500 to-red-700"></div>
          
          <div className="px-6 pt-8 pb-6">
            {/* Security shield icon */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
                <div className="relative">
                  <FaExclamationTriangle className="w-10 h-10 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-2">
                Administrative Access Restricted
              </h3>
              
              <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm border border-red-200 rounded-md">
                <div className="flex justify-center items-center mb-1">
                  <FaShieldAlt className="mr-2 text-red-600" />
                  <span className="font-semibold">Security Notice</span>
                </div>
                <p>
                  You are attempting to access a protected administrative area that requires elevated permissions.
                </p>
              </div>
              
              <p className="text-md text-gray-600 mb-2">
                This section is restricted to authorized administrative personnel only. If you are an administrator, please sign in with your administrative credentials.
              </p>
              
              <p className="text-sm text-gray-500 mb-6">
                Unauthorized access attempts may be logged and monitored for security purposes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <button
                onClick={handleLogin}
                className="flex items-center justify-center gap-2 px-5 py-3 font-medium text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaUserShield /> 
                <span>Administrator Login</span>
              </button>
              <button
                onClick={handleGoHome}
                className="flex items-center justify-center gap-2 px-5 py-3 font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <FaHome />
                <span>Return to Home</span>
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthRequiredModal; 