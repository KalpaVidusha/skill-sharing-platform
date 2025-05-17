import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FaUserPlus, FaUserMinus, FaUsers, FaLongArrowAltLeft } from 'react-icons/fa';
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
  const [followLoading, setFollowLoading] = useState({});
  
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
    // Set loading state for this specific user
    setFollowLoading(prev => ({ ...prev, [userToFollowId]: true }));
    
    try {
      await apiService.followUser(userToFollowId);
      setFollowingIds([...followingIds, userToFollowId]);
      toast.success(`You started following ${userName} successfully`);
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('followStatusChanged', {
        detail: { 
          action: 'follow', 
          targetUserId: userToFollowId,
          currentUserId: currentUserId 
        }
      }));
    } catch (err) {
      console.error('Error following user:', err);
      toast.error('Failed to follow user');
    } finally {
      // Clear loading state for this user
      setFollowLoading(prev => ({ ...prev, [userToFollowId]: false }));
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
        // Set loading state for this specific user
        setFollowLoading(prev => ({ ...prev, [userToUnfollowId]: true }));
        
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
            detail: { 
              action: 'unfollow', 
              targetUserId: userToUnfollowId,
              currentUserId: currentUserId 
            }
          }));
        } catch (error) {
          console.error('Error unfollowing user:', error);
          toast.error('Failed to unfollow user');
        } finally {
          // Clear loading state for this user
          setFollowLoading(prev => ({ ...prev, [userToUnfollowId]: false }));
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
    navigate('/login');
  };
  
  // Function to generate initials and background color based on name
  const generateInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };
  
  // Generate a consistent color based on user ID
  const generateColor = (userId) => {
    // List of professional, visually pleasing colors
    const colors = [
      'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600', 
      'bg-red-600', 'bg-orange-600', 'bg-amber-600', 'bg-yellow-600', 
      'bg-lime-600', 'bg-green-600', 'bg-emerald-600', 'bg-teal-600', 
      'bg-cyan-600', 'bg-sky-600', 'bg-violet-600', 'bg-fuchsia-600'
    ];
    
    // Use the last characters of the userId to determine color
    const hash = userId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-r from-blue-50 to-white">
          <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
            <Sidebar defaultActiveTab={type === "followers" ? "followers" : "following"} userId={userId} />
          </div>
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
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
            <div className="p-5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-center mb-4">
              <p className="font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded"
              >
                Try Again
              </button>
            </div>
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
          <div className="max-w-4xl mx-auto">
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
            
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-md mb-6 p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    {type === 'followers' ? 'People Following You' : 'People You Follow'} 
                    <span className="ml-2 inline-block px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800">
                      {count}
                    </span>
                  </h2>
                  <p className="text-gray-500 mt-1">
                    {type === 'followers' 
                      ? 'Users who are interested in your content' 
                      : 'Users whose content you are following'}
                  </p>
                </div>
                
                <button 
                  onClick={() => navigate(-1)} 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <FaLongArrowAltLeft className="mr-2" /> Go Back
                </button>
              </div>
            </div>
          
            {/* User List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {users.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto h-16 w-16 text-gray-400 mb-4 flex items-center justify-center rounded-full bg-gray-100">
                    <FaUsers className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {type === 'followers' 
                      ? 'No followers yet' 
                      : 'Not following anyone yet'}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {type === 'followers'
                      ? 'When people follow you, they will appear here.'
                      : 'When you follow people, they will appear here.'}
                  </p>
                  {type === 'following' && (
                    <button
                      onClick={() => navigate('/find-users')}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Find People to Follow
                    </button>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {users.map(user => (
                    <li key={user.id}>
                      <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-all duration-150">
                        {/* User Info with clickable area */}
                        <div 
                          onClick={() => handleProfileClick(user.id)}
                          className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer group"
                        >
                          {/* User Initials Avatar */}
                          <div className="flex-shrink-0">
                            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-sm border-2 border-white ${generateColor(user.id)}`}>
                              {generateInitials(user.firstName, user.lastName)}
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                            </div>
                          </div>
                          
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {user.firstName} {user.lastName}
                            </h3>
                            <div className="flex items-center">
                              <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                              {currentUserId === user.id && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-800 rounded">You</span>
                              )}
                            </div>
                            {user.bio && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{user.bio}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Follow/Unfollow Button - Styled like UserProfile.jsx */}
                        {currentUserId !== user.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              followingIds.includes(user.id) 
                                ? handleUnfollow(user.id, `${user.firstName} ${user.lastName}`) 
                                : handleFollow(user.id, `${user.firstName} ${user.lastName}`);
                            }}
                            disabled={followLoading[user.id]}
                            className={`py-2 px-5 rounded-full flex items-center gap-2 text-sm font-medium transition-all shadow-sm
                              ${
                                followingIds.includes(user.id)
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                          >
                            {followLoading[user.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                                <span>{followingIds.includes(user.id) ? 'Unfollowing...' : 'Following...'}</span>
                              </>
                            ) : (
                              <>
                                {followingIds.includes(user.id) ? (
                                  <>
                                    <FaUserMinus className="text-xs" />
                                    <span>Unfollow</span>
                                  </>
                                ) : (
                                  <>
                                    <FaUserPlus className="text-xs" />
                                    <span>Follow</span>
                                  </>
                                )}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FollowList; 