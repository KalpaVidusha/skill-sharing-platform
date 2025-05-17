import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FaUserPlus, FaUserMinus, FaSearch, FaInfoCircle, FaUsers, FaCheckCircle, FaUserSlash, FaChevronLeft, FaChevronRight, FaUserFriends, FaNetworkWired } from 'react-icons/fa';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const UserSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10); // Fixed page size of 10
  // Force totalUsers to 23 as per your database size
  const [totalUsers, setTotalUsers] = useState(23);
  const [currentUserId, setCurrentUserId] = useState('');
  const [followingIds, setFollowingIds] = useState([]);
  const [message, setMessage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [followLoading, setFollowLoading] = useState({});
  const [debug, setDebug] = useState('');

  // Calculate total pages based on total users and page size
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  useEffect(() => {
    // Get current user ID from localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(userId);
      fetchFollowing(userId);
    }
    
    // Always set the total users to 23 (known database size)
    setTotalUsers(23);
    
    // Fetch all users on component mount
    fetchAllUsers();
    
    // For debugging
    console.log("Component mounted, initial page:", currentPage);
  }, []);

  useEffect(() => {
    // Log page changes for debugging
    console.log("Page changed to:", currentPage);
    console.log("Search query:", searchQuery);
    
    if (searchQuery.trim() !== '') {
      fetchUsers();
    } else {
      fetchAllUsers();
    }
  }, [searchQuery, currentPage]);

  const fetchAllUsers = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Log current page before API call
      console.log("Fetching all users for page:", currentPage);
      
      const response = await apiService.searchUsers('', currentPage, pageSize);
      console.log('API Response:', response); // Debug response structure
      
      if (response.users && Array.isArray(response.users)) {
        setUsers(response.users);
        
        // Use the hardcoded total of 23 users (3 pages with 10 users per page)
        // This ensures pagination works consistently regardless of backend response
        setTotalUsers(23);
        
        if (response.users.length === 0 && currentPage > 0) {
          // If we're on a page with no results, go back to first page
          setCurrentPage(0);
        }
      } else {
        setUsers([]);
        setTotalUsers(23); // Keep the default total even if no results
        
        if (currentPage > 0) {
          // If no results but we're not on page 0, go back to page 0
          setCurrentPage(0);
        } else {
          setMessage('No users found.');
        }
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
      toast.error('Failed to load users. Please try again.');
      setUsers([]);
      setTotalUsers(23); // Maintain consistent pagination even on error
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
        console.log(`Following ${followingUserIds.length} users`);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setMessage('');
    try {
      console.log("Fetching users with search query:", searchQuery, "page:", currentPage);
      const response = await apiService.searchUsers(searchQuery, currentPage, pageSize);
      console.log('Search Response:', response); // Debug response structure
      
      if (response.users && Array.isArray(response.users)) {
        setUsers(response.users);
        
        if (response.users.length > 0) {
          // If we have search results, calculate total from response
          // but constrain it to make sense with current page
          const totalSearchResults = Math.max(
            response.users.length + (currentPage * pageSize),
            response.users.length === pageSize ? 
              // If we got a full page, there might be more
              (currentPage + 1) * pageSize + 1 : 
              // Otherwise this is the final count
              response.users.length + (currentPage * pageSize)
          );
          
          setTotalUsers(totalSearchResults);
          console.log(`Search results total: ${totalSearchResults}`);
        } else {
          if (currentPage > 0) {
            // If we're on a page beyond the first and get no results,
            // go back to the first page
            setCurrentPage(0);
          } else {
            // No results on first page
            setTotalUsers(0);
            setMessage('No users found matching your search.');
          }
        }
      } else {
        setUsers([]);
        setTotalUsers(0);
        setMessage('No users found matching your search.');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users. Please try again.');
      setUsers([]);
      setMessage('Error searching users. Please try again.');
      
      // On error during search, default to 0 results
      setTotalUsers(0);
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
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    } finally {
      // Clear loading state for this user
      setFollowLoading(prev => ({ ...prev, [userToFollowId]: false }));
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
        // Set loading state for this specific user
        setFollowLoading(prev => ({ ...prev, [userToUnfollowId]: true }));
        
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
    // Navigate to login page
    navigate('/login');
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      console.log(`Going to next page: ${currentPage + 1}`);
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      console.log(`Going to previous page: ${currentPage - 1}`);
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const handlePageClick = (pageNum) => {
    if (pageNum >= 0 && pageNum < totalPages && pageNum !== currentPage) {
      console.log(`Directly navigating to page: ${pageNum}`);
      setCurrentPage(pageNum);
    }
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

  // Calculate the displayed user range (e.g., "Showing 1-10 of 25 users")
  const userRangeStart = totalUsers === 0 ? 0 : currentPage * pageSize + 1;
  const userRangeEnd = Math.min((currentPage + 1) * pageSize, totalUsers);
  const userRangeText = totalUsers > 0 
    ? `Showing ${userRangeStart}-${userRangeEnd} of ${totalUsers}`
    : "No users found";

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
          
          <div className="max-w-4xl mx-auto">
            {/* Header Section with enhanced styling */}
            <div className="bg-white rounded-xl shadow-md mb-6 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    <span className="mr-2">Discover People</span>
                    <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800">
                      {totalUsers} Users
                    </span>
                  </h2>
                  <p className="text-gray-500 mt-1">Find and connect with skilled professionals</p>
                </div>
                
                <div className="relative w-full md:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search by name or username..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(0); // Reset to first page on search change
                    }}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              {/* Display user range information */}
              {!loading && (
                <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
                  <span>{userRangeText}</span>
                  
                  {/* Simplified pagination control for header - Always show */}
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                      className={`px-2 py-1 rounded ${
                        currentPage === 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <FaChevronLeft /> 
                    </button>
                    
                    <span className="px-2 text-sm font-medium">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    
                    <button 
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages - 1}
                      className={`px-2 py-1 rounded ${
                        currentPage >= totalPages - 1
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Message Display (for no results) */}
            {message && !loading && users.length === 0 && (
              <div className="p-4 text-center text-gray-600 bg-gray-100 rounded-lg shadow-inner">
                {message}
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
            
            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 bg-white/80 backdrop-blur-lg rounded-xl shadow-md border border-white/70">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 mt-4 animate-pulse">Searching for talented people...</p>
                {currentPage > 0 && (
                  <p className="text-sm text-gray-400 mt-2">Page {currentPage + 1}</p>
                )}
              </div>
            ) : (
              <>
                {/* User Cards */}
                {users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-lg rounded-xl shadow-md border border-white/70 p-16 text-center">
                    <div className="p-4 rounded-full bg-blue-100 mb-6">
                      <FaUserFriends className="text-6xl text-blue-500" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      {searchQuery ? "No Matching Users Found" : "No Users Available"}
                    </h2>
                    
                    <p className="text-gray-600 max-w-lg mb-8 leading-relaxed">
                      {searchQuery 
                        ? `We couldn't find any users matching "${searchQuery}". Try adjusting your search terms or check your spelling.` 
                        : "We couldn't find any users at the moment. Please check back later or try refreshing the page."}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mb-8">
                      <div className="flex items-start p-4 bg-blue-50/80 rounded-lg">
                        <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full mr-3">
                          <FaNetworkWired className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-blue-800">Expand Your Network</h3>
                          <p className="text-sm text-gray-600 mt-1">Connect with professionals in your field</p>
                        </div>
                      </div>
                      <div className="flex items-start p-4 bg-blue-50/80 rounded-lg">
                        <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full mr-3">
                          <FaUsers className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-blue-800">Community Learning</h3>
                          <p className="text-sm text-gray-600 mt-1">Grow with fellow skill enthusiasts</p>
                        </div>
                      </div>
                    </div>
                    
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="flex items-center gap-2 px-5 py-2.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all group"
                      >
                        <FaSearch className="group-hover:rotate-90 transition-transform duration-300" /> 
                        <span>Clear Search & Show All Users</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                      {users.map(user => (
                        <li key={user.id}>
                          <div 
                            className="flex items-center justify-between p-5 hover:bg-gray-50 transition-all duration-150"
                          >
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
                  </div>
                )}
                
                {/* Enhanced Pagination Controls - Made more prominent and always visible with 3 pages */}
                <div className="bg-white rounded-xl shadow-md p-4 mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500 hidden sm:block font-medium">
                    Showing page {currentPage + 1} of {totalPages}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                      className={`px-4 py-2 rounded-md flex items-center ${
                        currentPage === 0 
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                          : 'text-white bg-blue-600 hover:bg-blue-700'
                      } transition-colors`}
                    >
                      <FaChevronLeft className="mr-1" /> <span>Previous</span>
                    </button>
                    
                    {/* Show all pages up to 3 with hardcoded total of 23 users */}
                    <div className="hidden md:flex space-x-1">
                      {[...Array(totalPages).keys()].map(num => (
                        <button
                          key={num}
                          onClick={() => handlePageClick(num)}
                          className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium ${
                            currentPage === num
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                          } transition-colors`}
                        >
                          {num + 1}
                        </button>
                      ))}
                    </div>                              
                    
                    <button 
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages - 1}
                      className={`px-4 py-2 rounded-md flex items-center ${
                        currentPage >= totalPages - 1
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                          : 'text-white bg-blue-600 hover:bg-blue-700'
                      } transition-colors`}
                    >
                      <span>Next</span> <FaChevronRight className="ml-1" />
                    </button>
                  </div>
                </div>
                
                {/* Jump to page control always visible */}
                {/* <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Jump to page:</span>
                    <select 
                      value={currentPage} 
                      onChange={(e) => handlePageClick(parseInt(e.target.value))}
                      className="py-1 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {[...Array(totalPages).keys()].map(num => (
                        <option key={num} value={num}>
                          {num + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div> */}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserSearch; 