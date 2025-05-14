import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FaUserPlus, FaUserMinus } from 'react-icons/fa';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const FollowList = ({ type, userId: propUserId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState('');
  const [followingIds, setFollowingIds] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Get userId from props, location state, or localStorage
  const getUserId = () => {
    // First check if passed as prop
    if (propUserId) return propUserId;
    
    // Then check if in location state
    if (location.state && location.state.userId) {
      return location.state.userId;
    }
    
    // Finally fall back to localStorage
    return localStorage.getItem('userId');
  };
  
  const userId = getUserId();

  useEffect(() => {
    const loggedInUserId = localStorage.getItem('userId');
    if (loggedInUserId) {
      setCurrentUserId(loggedInUserId);
      fetchFollowingIds(loggedInUserId);
    }
    
    if (userId) {
      fetchUsers();
    }
  }, [userId, type]);

  const fetchFollowingIds = async (loggedInUserId) => {
    try {
      const response = await apiService.getFollowing(loggedInUserId);
      if (response && response.following) {
        const ids = response.following.map(user => user.id);
        setFollowingIds(ids);
      }
    } catch (err) {
      console.error('Error fetching following IDs:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (type === 'followers') {
        response = await apiService.getFollowers(userId);
      } else {
        response = await apiService.getFollowing(userId);
      }
      
      if (response) {
        setUsers(response[type] || []);
        setCount(response.count || 0);
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setError(`Failed to load ${type}. Please try again later.`);
      toast.error(`Failed to load ${type}. Please try again later.`);
      setUsers([]);
      setCount(0);
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
    } catch (err) {
      console.error('Error following user:', err);
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async (userToUnfollowId, userName) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-white">
        <Navbar />
        <div className="flex min-h-screen pt-20 font-sans">
          {/* Sidebar - Skeleton Loading */}
          <div className="sticky top-20 h-[calc(100vh-5rem)] self-start w-72">
            <div className="h-full p-6 bg-white border-r border-gray-200">
              <div className="animate-pulse space-y-6">
                <div className="h-10 bg-gray-200 rounded-lg w-3/4"></div>
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg"></div>
                  ))}
                </div>
                <div className="h-10 bg-gray-100 rounded-lg mt-auto"></div>
              </div>
            </div>
          </div>
  
          {/* Main Content - Animated Loading */}
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Loading Header */}
              <div className="mb-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded-full w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded-full w-1/4"></div>
              </div>
  
              {/* Animated User Cards */}
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4 animate-pulse">
                      {/* Avatar Skeleton */}
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-300 rounded-full border-2 border-white"></div>
                      </div>
                      
                      {/* User Info Skeleton */}
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
                        <div className="h-3 bg-gray-100 rounded-full w-1/2"></div>
                        <div className="flex space-x-2">
                          <div className="h-3 bg-gray-100 rounded-full w-1/4"></div>
                          <div className="h-3 bg-gray-100 rounded-full w-1/4"></div>
                        </div>
                      </div>
                      
                      {/* Button Skeleton */}
                      <div className="h-10 bg-gray-100 rounded-full w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
  
              {/* Loading Animation */}
              <div className="flex justify-center mt-10">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
  
              {/* Loading Text */}
              <div className="mt-6 text-center text-gray-500">
                <p>Loading your {type} data...</p>
                <p className="text-sm mt-1">This will just take a moment</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-r from-blue-50 to-white">
          <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
            <Sidebar defaultActiveTab={type === "followers" ? "followers" : "following"} userId={userId} />
          </div>
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="p-4 bg-red-100 text-red-800 rounded text-center mb-4">{error}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-r from-blue-50 to-white">
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          <Sidebar defaultActiveTab={type === "followers" ? "followers" : "following"} userId={userId} />
        </div>
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="p-4 bg-white rounded-lg shadow">
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
          
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              {type === 'followers' ? 'Followers' : 'Following'} 
              <span className="ml-2 text-base text-gray-600">({count})</span>
            </h2>
            
            {users.length === 0 ? (
              <div className="p-4 text-center text-gray-600 bg-gray-100 rounded">
                {type === 'followers' 
                  ? 'No followers yet.' 
                  : 'Not following anyone yet.'}
              </div>
            ) : (
              <div className="space-y-4">
                {users.map(user => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                  >
                    {/* User Info with clickable area */}
                    <div 
                      onClick={() => handleProfileClick(user.id)}
                      className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer group"
                    >
                      <div className="relative">
                        <img 
                          src={user.profilePicture || 'https://via.placeholder.com/150?text='+user.firstName[0]+user.lastName[0]} 
                          alt={`${user.firstName} ${user.lastName}`} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 group-hover:border-blue-200 transition-colors"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                      
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                        {user.bio && (
                          <p className="text-xs text-gray-400 mt-1 truncate">{user.bio}</p>
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default FollowList; 