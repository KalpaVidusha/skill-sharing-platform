import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import AuthRequiredModal from './AuthRequiredModal';

const ProtectedRoute = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      // Check if all required auth data exists
      const authenticated = isLoggedIn && token && userId;
      setIsAuthenticated(authenticated);
      
      if (!authenticated) {
        setIsModalOpen(true);
      }
      
      setIsVerifying(false);
    };
    
    checkAuth();
  }, []);
  
  // If still verifying, show loading
  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If authenticated, render the children
  if (isAuthenticated) {
    return children;
  }
  
  // If not authenticated, show the modal
  return (
    <>
      <AuthRequiredModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          navigate('/');
        }} 
      />
      {/* Display some content behind the modal */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-4 text-center blur-sm">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Protected Content</h2>
          <p className="text-gray-600">Authentication is required to view this content</p>
        </div>
      </div>
    </>
  );
};

export default ProtectedRoute; 