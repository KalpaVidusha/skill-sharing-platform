import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api';
import AdminSidebar from './AdminSidebar';
import { FaArrowLeft, FaUser, FaExclamationCircle, FaCheckCircle, FaSearch, FaArrowUp, FaArrowDown, FaTrash, FaShieldAlt } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!apiService.isUserAdmin()) {
      navigate('/');
      return;
    }

    // Fetch users data
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userData = await apiService.admin.getAllUsers();
      setUsers(userData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiService.admin.deleteUser(userId);
      setSuccessMessage('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      await apiService.admin.promoteUserToAdmin(userId);
      setSuccessMessage('User promoted to admin successfully');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to promote user');
      console.error('Error promoting user:', err);
    }
  };

  const handleDemoteAdmin = async (userId) => {
    try {
      await apiService.admin.demoteAdminToUser(userId);
      setSuccessMessage('Admin demoted to user successfully');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to demote admin');
      console.error('Error demoting admin:', err);
    }
  };

  // Helper function to check if a user is an admin
  const isUserAdmin = (user) => {
    return user.role && user.role.includes('ROLE_ADMIN');
  };

  // Navigate to user profile
  const navigateToUserProfile = (userId) => {
    navigate(`/users/${userId}`);
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab="users" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-600 mt-1">Manage all platform users and permissions</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link 
                to="/admin" 
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-all"
              >
                <FaArrowLeft className="text-sm" />
                Admin Dashboard
              </Link>
              <Link 
                to="/userdashboard" 
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-sm transition-all"
              >
                <FaUser className="text-sm" />
                User Dashboard
              </Link>
            </div>
          </div>
          
          {/* Alert Messages */}
          <div className="space-y-3 mb-6">
            {error && (
              <div className="flex items-start p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <FaExclamationCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}
            
            {successMessage && (
              <div className="flex items-start p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <FaCheckCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-green-800 font-medium">Success</h3>
                  <p className="text-green-600 text-sm">{successMessage}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">All Users ({users.length})</h2>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Loading user data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className={isUserAdmin(user) ? 'bg-blue-50/30 hover:bg-blue-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              {user.profilePicture ? (
                                <img className="h-10 w-10 rounded-full" src={user.profilePicture} alt="" />
                              ) : (
                                <span className="text-blue-600 font-medium">
                                  {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.fullName || 'Not provided'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => navigateToUserProfile(user.id)}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                          >
                            @{user.username}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isUserAdmin(user) ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 inline-flex items-center">
                              <FaShieldAlt className="mr-1" /> Admin
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 inline-flex items-center">
                              <FaUser className="mr-1" /> User
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {isUserAdmin(user) ? (
                              <button
                                onClick={() => handleDemoteAdmin(user.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                              >
                                <FaArrowDown className="mr-1" /> Demote
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePromoteUser(user.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <FaArrowUp className="mr-1" /> Promote
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <FaTrash className="mr-1" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {users.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">{users.length}</span> users
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled
                  >
                    Previous
                  </button>
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 