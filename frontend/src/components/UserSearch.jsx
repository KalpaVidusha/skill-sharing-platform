import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const UserSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [currentUserId, setCurrentUserId] = useState('');
  const [followingIds, setFollowingIds] = useState([]);
  const [message, setMessage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

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
      setUsers(response.users || []);
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
      setUsers(response.users || []);
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

  return (
    <div className="p-5 max-w-4xl mx-auto">
      {/* Authentication Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowLoginModal(false)}></div>

            {/* Modal content */}
            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Authentication Required</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You need to be logged in to view user profiles. This helps maintain a safe and interactive community for all our users.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseModal}
                >
                  Log In
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowLoginModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <h2 className="text-2xl font-bold mb-5 text-gray-800">Find Users</h2>
      
      {message && (
        <div className="p-3 mb-4 bg-blue-100 text-blue-800 rounded text-center">
          {message}
        </div>
      )}
      
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search users by name or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 text-base rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {loading ? (
        <div className="text-center p-5 text-lg text-gray-600">Loading...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {users.length > 0 ? (
            users.map(user => (
              <div key={user.id} className="flex justify-between items-center p-4 rounded-lg shadow bg-white hover:shadow-md transition-transform hover:-translate-y-1">
                <div 
                  onClick={() => handleProfileClick(user.id)}
                  className="flex items-center gap-4 flex-grow hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <img 
                    src={user.profilePicture || 'https://via.placeholder.com/50'} 
                    alt={`${user.firstName} ${user.lastName}`} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  </div>
                </div>
                {user.id !== currentUserId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      followingIds.includes(user.id) 
                        ? handleUnfollow(user.id, `${user.firstName} ${user.lastName}`) 
                        : handleFollow(user.id, `${user.firstName} ${user.lastName}`)
                    }}
                    className={followingIds.includes(user.id) 
                      ? "px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      : "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    }
                  >
                    {followingIds.includes(user.id) ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            ))
          ) : (
            searchQuery.trim() !== '' 
              ? <div className="text-center p-5 text-gray-600">No users found</div>
              : <div className="text-center p-5 text-gray-600">No users available</div>
          )}
        </div>
      )}
      
      {users.length > 0 && (
        <div className="flex justify-center items-center mt-5 gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPage(prev => Math.max(0, prev - 1));
            }}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-300 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {currentPage + 1}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPage(prev => prev + 1);
            }}
            disabled={users.length < pageSize}
            className="px-4 py-2 bg-gray-200 rounded disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-300 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserSearch; 