import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api';
import AdminSidebar from './AdminSidebar';
import { FaArrowLeft, FaUser, FaExclamationCircle, FaCheckCircle, FaSearch, FaArrowUp, FaArrowDown, FaTrash, FaShieldAlt, FaLock } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Apply search filter whenever users or searchQuery changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // Sort users: admins first, then regular users, both sorted alphabetically
      const sortedUsers = [...users].sort((a, b) => {
        const aIsAdmin = isUserAdmin(a);
        const bIsAdmin = isUserAdmin(b);
        
        // If one is admin and other is not, admin comes first
        if (aIsAdmin && !bIsAdmin) return -1;
        if (!aIsAdmin && bIsAdmin) return 1;
        
        // If both are admin or both are not, sort by username
        return (a.username || '').localeCompare(b.username || '');
      });
      
      setFilteredUsers(sortedUsers);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = users.filter(user => 
        (user.username && user.username.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (getUserFullName(user) && getUserFullName(user).toLowerCase().includes(query))
      ).sort((a, b) => {
        // Keep admin sorting in search results too
        const aIsAdmin = isUserAdmin(a);
        const bIsAdmin = isUserAdmin(b);
        
        if (aIsAdmin && !bIsAdmin) return -1;
        if (!aIsAdmin && bIsAdmin) return 1;
        
        return (a.username || '').localeCompare(b.username || '');
      });
      
      setFilteredUsers(filtered);
    }
  }, [users, searchQuery]);

  // Helper function to get user's full name from different possible fields
  const getUserFullName = (user) => {  
    return `${user.firstName} ${user.lastName}`;
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userData = await apiService.admin.getAllUsers();
      
      // Sort users: admins first, then regular users
      const sortedUsers = userData.sort((a, b) => {
        const aIsAdmin = isUserAdmin(a);
        const bIsAdmin = isUserAdmin(b);
        
        if (aIsAdmin && !bIsAdmin) return -1;
        if (!aIsAdmin && bIsAdmin) return 1;
        
        return (a.username || '').localeCompare(b.username || '');
      });
      
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    // Prevent deletion of main admin user
    if (username === 'admin') {
      setError('The main admin user cannot be deleted');
      return;
    }
    
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

  const handleDemoteAdmin = async (userId, username) => {
    // Prevent demotion of main admin
    if (username === 'admin') {
      setError('The main admin user cannot be demoted');
      return;
    }
    
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
    navigate(`/profile/${userId}`);
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

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Count the number of admins
  const adminCount = filteredUsers.filter(user => isUserAdmin(user)).length;
  const regularUserCount = filteredUsers.length - adminCount;

  // Filter users for display
  const adminUsers = filteredUsers.filter(user => isUserAdmin(user));
  const regularUsers = filteredUsers.filter(user => !isUserAdmin(user));

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
          
          {/* Search Bar */}
          <div className="mb-6 flex justify-end">
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, username or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading user data...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl shadow-sm">
              <p className="text-gray-600">No users match your search criteria.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Administrators Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-blue-50/80">
                  <h2 className="text-xl font-semibold text-blue-800 flex items-center">
                    <FaShieldAlt className="mr-2" />
                    Administrators ({adminUsers.length})
                  </h2>
                </div>
                
                {adminUsers.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-600">No administrators match your search criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-blue-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                            Username
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {adminUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-blue-50/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  {user.profilePicture ? (
                                    <img className="h-10 w-10 rounded-full" src={user.profilePicture} alt="" />
                                  ) : (
                                    <span className="text-blue-600 font-medium">
                                      {getUserFullName(user).charAt(0) || 'U'}
                                    </span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {getUserFullName(user)}
                                    {user.username === 'admin' && (
                                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-200 text-blue-800">
                                        <FaLock className="inline mr-1" />
                                        Main Admin
                                      </span>
                                    )}
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
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 inline-flex items-center">
                                <FaShieldAlt className="mr-1" /> Admin
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {user.username === 'admin' ? (
                                  <button
                                    disabled
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                                  >
                                    <FaLock className="mr-1" /> Protected
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleDemoteAdmin(user.id, user.username)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                    >
                                      <FaArrowDown className="mr-1" /> Demote
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(user.id, user.username)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                      <FaTrash className="mr-1" /> Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {/* Regular Users Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FaUser className="mr-2" />
                    Regular Users ({regularUsers.length})
                  </h2>
                </div>
                
                {regularUsers.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-600">No regular users match your search criteria.</p>
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
                        {regularUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                  {user.profilePicture ? (
                                    <img className="h-10 w-10 rounded-full" src={user.profilePicture} alt="" />
                                  ) : (
                                    <span className="text-gray-600 font-medium">
                                      {getUserFullName(user).charAt(0) || 'U'}
                                    </span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {getUserFullName(user)}
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
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 inline-flex items-center">
                                <FaUser className="mr-1" /> User
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handlePromoteUser(user.id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                  <FaArrowUp className="mr-1" /> Promote
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.username)}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 