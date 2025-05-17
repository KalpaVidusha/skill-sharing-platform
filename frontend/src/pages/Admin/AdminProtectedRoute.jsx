import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminAuthRequiredModal from './AdminAuthRequiredModal';
import apiService from '../../services/api';

const AdminProtectedRoute = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Verify both authentication and admin status
    const verifyAdminAccess = async () => {
      try {
        // First check if user is authenticated
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        // Authentication check
        const authenticated = isLoggedIn && token && userId;
        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          setIsAdmin(false);
          setIsModalOpen(true);
          setIsVerifying(false);
          return;
        }
        
        // Admin privilege check
        const hasAdminRights = await apiService.isUserAdmin();
        setIsAdmin(hasAdminRights);
        
        if (!hasAdminRights) {
          // User is authenticated but not an admin
          console.warn("Unauthorized admin access attempt", { 
            userId,
            path: location.pathname,
            timestamp: new Date().toISOString()
          });
          setIsModalOpen(true);
        }
        
        setIsVerifying(false);
      } catch (error) {
        console.error("Error verifying admin status:", error);
        setIsAdmin(false);
        setIsModalOpen(true);
        setIsVerifying(false);
      }
    };
    
    verifyAdminAccess();
  }, [location]);
  
  // If still verifying, show enhanced admin loading
  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="w-20 h-20 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-blue-200 font-medium tracking-wide animate-pulse">Verifying administrative access...</p>
      </div>
    );
  }
  
  // If authenticated and admin, render the children
  if (isAuthenticated && isAdmin) {
    return children;
  }
  
  // If not authorized, show the admin auth modal
  return (
    <>
      <AdminAuthRequiredModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          navigate('/');
        }} 
      />
      {/* Blurred sensitive content background */}
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-blue-900 flex flex-col items-center justify-center p-4 text-center blur-md">
        <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-md p-10">
          <h2 className="text-2xl font-bold text-white mb-4">Administrative Area</h2>
          <p className="text-gray-200">This section requires administrative privileges</p>
          <div className="mt-6 flex justify-center">
            <div className="w-16 h-1 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProtectedRoute; 