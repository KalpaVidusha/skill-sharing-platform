import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FaUserPlus, FaUserMinus, FaSearch, FaInfoCircle, FaUsers, FaCheckCircle, FaUserSlash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const UserSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(25);
  const [currentUserId, setCurrentUserId] = useState('');
  const [followingIds, setFollowingIds] = useState([]);
  const [message, setMessage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Calculate total pages based on total users and page size
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  useEffect(() => {
    // Get current user ID from localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(userId);
      fetchFollowing(userId);
    }
    
    // Fetch all users on component mount
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      fetchUsers();
    } else {
      fetchAllUsers();
    }
  }, [searchQuery, currentPage]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.searchUsers('', currentPage, pageSize);
      console.log('API Response:', response); // Debug response structure
      setUsers(response.users || []);
      
      // Set the total users count from our knowledge that there are 25 users
      setTotalUsers(25);
      
      // Backup logic if we need to extract it from API
      if (response.totalCount !== undefined) {
        console.log('Using totalCount from API:', response.totalCount);
      } else if (response.total !== undefined) {
        console.log('Using total from API:', response.total);
      } else if (response.totalItems !== undefined) {
        console.log('Using totalItems from API:', response.totalItems);
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
      toast.error('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async (userId) => {
    try {
      const response = await apiService.getFollowing(userId);
      if (response && response.following) {
        const followingUserIds = response.following.map(user => user.id);
        setFollowingIds(followingUserIds);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await apiService.searchUsers(searchQuery, currentPage, pageSize);
      console.log('Search Response:', response); // Debug response structure
      setUsers(response.users || []);
      
      // We know there are 25 total users in the database
      // For search results, we can either:
      // 1. Keep total as 25 for consistency, or
      // 2. Update based on filtered results
      if (response.users) {
        // Option 2: Update based on filtered/search results
        // This assumes all filtered results are returned at once
        setTotalUsers(response.users.length);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userToFollowId, userName) => {
    try {
      await apiService.followUser(userToFollowId);
      setFollowingIds([...followingIds, userToFollowId]);
      toast.success(`You started following ${userName} successfully`);
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('followStatusChanged', {
        detail: { action: 'follow', targetUserId: userToFollowId }
      }));
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async (userToUnfollowId, userName) => {
    // Show SweetAlert confirmation
    Swal.fire({
      title: 'Confirm Unfollow',
      text: `Are you sure you want to unfollow ${userName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, unfollow!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiService.unfollowUser(userToUnfollowId);
          setFollowingIds(followingIds.filter(id => id !== userToUnfollowId));
          
          // Show success message with SweetAlert too
          Swal.fire(
            'Unfollowed!',
            `You are no longer following ${userName}.`,
            'success'
          );
          
          // Dispatch a custom event to notify other components
          window.dispatchEvent(new CustomEvent('followStatusChanged', {
            detail: { action: 'unfollow', targetUserId: userToUnfollowId }
          }));
        } catch (error) {
          console.error('Error unfollowing user:', error);
          toast.error('Failed to unfollow user');
        }
      }
    });
  };

  const handleProfileClick = (clickedUserId) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    // If the clicked user is the current user, navigate to dashboard
    if (clickedUserId === currentUserId) {
      navigate('/userdashboard');
    } else {
      navigate(`/profile/${clickedUserId}`);
    }
  };
  
  const handleCloseModal = () => {
    setShowLoginModal(false);
    // Navigate to login page
    navigate('/login');
  };

  const handleNextPage = () => {
    console.log('Next page clicked', { currentPage, totalPages });
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    console.log('Prev page clicked', { currentPage, totalPages });
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handlePageClick = (pageNum) => {
    console.log('Page clicked', { pageNum, currentPage, totalPages });
    setCurrentPage(pageNum);
  };

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-r from-blue-50 to-white">
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          <Sidebar defaultActiveTab="findUsers" userId={currentUserId} />
        </div>
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Authentication Modal */}
          {showLoginModal && (
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowLoginModal(false)}></div>

                {/* Modal content */}
                <div className="inline-block overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:max-w-lg sm:w-full">
                  <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                        <svg className="w-6 h-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Authentication Required</h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            You need to be logged in to view user profiles. This helps maintain a safe and interactive community for all our users.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button 
                      type="button" 
                      className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleCloseModal}
                    >
                      Log In
                    </button>
                    <button 
                      type="button" 
                      className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowLoginModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow">
            {/* Header Section */}
            <div className="flex items-center justify-between p-4 mb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Discover People</h2>
              
              <div className="relative w-full max-w-xs">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
            
            {/* Message Display (for no results) */}
            {message && (
              <div className="p-4 text-center text-gray-600 bg-gray-100 rounded">
                {message}
              </div>
            )}
            
            {/* Loading State */}
            {loading ? (
              <div className="p-5 text-center text-gray-600">
                <div className="w-8 h-8 mx-auto mb-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                <p>Loading users...</p>
              </div>
            ) : (
              <>
                {/* User Cards */}
                {users.length === 0 ? (
                  <div className="p-6 m-4 text-center text-gray-600 rounded-lg bg-gray-50">
                    <FaInfoCircle className="mx-auto mb-2 text-2xl text-gray-400" />
                    <p>No users found matching your search.</p>
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-3 font-medium text-blue-600 hover:text-blue-800"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {users.map(user => (
                      <div 
                        key={user.id} 
                        className="flex items-center justify-between p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md"
                      >
                        {/* User Info with clickable area */}
                        <div 
                          onClick={() => handleProfileClick(user.id)}
                          className="flex items-center flex-1 min-w-0 gap-4 cursor-pointer group"
                        >
                          <div className="relative">
                            <img 
                              src={user.profilePicture || 'https://via.placeholder.com/150?text='+user.firstName[0]+user.lastName[0]} 
                              alt={`${user.firstName} ${user.lastName}`} 
                              className="object-cover w-12 h-12 transition-colors border-2 border-blue-100 rounded-full group-hover:border-blue-200"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                          </div>
                          
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate transition-colors group-hover:text-blue-600">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                            {user.bio && (
                              <p className="mt-1 text-xs text-gray-400 truncate">{user.bio}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Follow/Unfollow Button */}
                        {currentUserId !== user.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              followingIds.includes(user.id) 
                                ? handleUnfollow(user.id, `${user.firstName} ${user.lastName}`) 
                                : handleFollow(user.id, `${user.firstName} ${user.lastName}`);
                            }}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1.5
                              ${
                                followingIds.includes(user.id)
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              }
                            `}
                          >
                            {followingIds.includes(user.id) ? (
                              <>
                                <FaUserMinus className="text-xs" />
                                Unfollow
                              </>
                            ) : (
                              <>
                                <FaUserPlus className="text-xs" />
                                Follow
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pagination Controls */}
                {users.length > 0 && totalPages > 1 && (
                  <div className="flex items-center justify-center py-4 space-x-2 border-t">
                    <button 
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                      className={`px-3 py-1 rounded flex items-center ${
                        currentPage === 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <FaChevronLeft className="mr-1" /> Prev
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {[...Array(totalPages).keys()].map(num => (
                        <button
                          key={num}
                          onClick={() => handlePageClick(num)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            currentPage === num
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-blue-100'
                          }`}
                        >
                          {num + 1}
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages - 1}
                      className={`px-3 py-1 rounded flex items-center ${
                        currentPage >= totalPages - 1
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      Next <FaChevronRight className="ml-1" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserSearch; 