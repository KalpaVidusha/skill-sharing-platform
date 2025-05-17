import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaUser, FaChartLine, FaFileAlt, FaUsers, FaThumbsUp, FaComment, 
  FaUserPlus, FaUserMinus, FaCalendarAlt, FaEnvelope, FaEye
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import apiService from "../services/api";
import { toast } from "react-toastify";
import ProgressFeed from "./Progress/ProgressFeed";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    email: "",
    memberSince: "",
    posts: 0,
    progressCount: 0,
    likesReceived: 0,
    comments: 0,
    followers: 0,
    following: 0,
    recentPosts: []
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const currentUserId = localStorage.getItem('userId');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Helper to store follow state in localStorage
  const storeFollowState = useCallback((targetUserId, isFollowed) => {
    try {
      const followDataKey = `follow_status_${currentUserId}`;
      let followData = JSON.parse(localStorage.getItem(followDataKey) || '{}');
      followData[targetUserId] = isFollowed;
      localStorage.setItem(followDataKey, JSON.stringify(followData));
      console.log(`Stored follow state for ${targetUserId}: ${isFollowed}`);
    } catch (error) {
      console.error("Error storing follow state:", error);
    }
  }, [currentUserId]);

  // Helper to get follow state from localStorage
  const getStoredFollowState = useCallback((targetUserId) => {
    try {
      const followDataKey = `follow_status_${currentUserId}`;
      const followData = JSON.parse(localStorage.getItem(followDataKey) || '{}');
      return followData[targetUserId] === true;
    } catch (error) {
      console.error("Error getting stored follow state:", error);
      return false;
    }
  }, [currentUserId]);

  // Check if the profile is the current user's profile or if the user is logged in
  useEffect(() => {
    if (userId === currentUserId) {
      // If user is viewing their own profile, redirect to dashboard
      navigate('/userdashboard');
    } else if (!isLoggedIn) {
      // If user is not logged in, show login modal
      setShowLoginModal(true);
      setLoading(false);
    } else {
      fetchUserData();
    }
  }, [userId, currentUserId, navigate, isLoggedIn]);
  
  // Separate useEffect for handling follow status
  useEffect(() => {
    if (isLoggedIn && currentUserId && userId && currentUserId !== userId) {
      // First check localStorage for a cached follow state
      const storedFollowState = getStoredFollowState(userId);
      console.log(`Initial follow state from localStorage: ${storedFollowState}`);
      setIsFollowing(storedFollowState);
      
      // Then verify with the server
      checkFollowStatus();
    }
  }, [userId, currentUserId, isLoggedIn, getStoredFollowState]);
  
  // Listen for follow status changes from other components
  useEffect(() => {
    const handleFollowStatusChange = (event) => {
      const { action, targetUserId } = event.detail;
      
      // Only update if the event is related to this profile user
      if (targetUserId === userId) {
        console.log(`Follow event received: ${action} for user ${targetUserId}`);
        const newFollowState = action === 'follow';
        setIsFollowing(newFollowState);
        storeFollowState(targetUserId, newFollowState);
        
        // Update follower count
        apiService.getFollowers(userId).then(response => {
          if (response && response.count !== undefined) {
            setUserData(prev => ({
              ...prev,
              followers: response.count
            }));
          }
        }).catch(err => {
          console.error("Error refreshing followers after event:", err);
        });
      }
    };
    
    window.addEventListener('followStatusChanged', handleFollowStatusChange);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('followStatusChanged', handleFollowStatusChange);
    };
  }, [userId, storeFollowState]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user details
      const user = await apiService.getUserById(userId);
      
      if (!user) {
        setError("User not found");
        setLoading(false);
        return;
      }

      // Fetch user's posts
      let userPosts = [];
      try {
        const postsResponse = await apiService.getPostsByUser(userId);
        
        if (postsResponse && Array.isArray(postsResponse)) {
          userPosts = postsResponse;
        }
      } catch (postError) {
        console.error("Error fetching user posts:", postError);
      }
      
      // Fetch user's progress updates
      let progressUpdates = [];
      try {
        const progressResponse = await apiService.getAllProgress(userId);
        
        if (progressResponse && Array.isArray(progressResponse)) {
          progressUpdates = progressResponse;
        }
      } catch (progressError) {
        console.error("Error fetching user progress:", progressError);
      }
      
      // Fetch followers and following counts
      let followersCount = 0;
      let followingCount = 0;
      try {
        const followersResponse = await apiService.getFollowers(userId);
        const followingResponse = await apiService.getFollowing(userId);
        
        if (followersResponse && followersResponse.count) {
          followersCount = followersResponse.count;
        }
        
        if (followingResponse && followingResponse.count) {
          followingCount = followingResponse.count;
        }
      } catch (followError) {
        console.error("Error fetching follow data:", followError);
      }
      
      // Calculate total interactions across posts and progress
      let totalComments = 0;
      let totalLikes = 0;
      try {
        // Count from posts
        for (const post of userPosts) {
          if (post.commentCount) {
            totalComments += post.commentCount;
          }
          if (post.likeCount) {
            totalLikes += post.likeCount;
          }
        }
        
        // Count from progress updates
        for (const progress of progressUpdates) {
          if (progress.commentCount) {
            totalComments += progress.commentCount;
          }
          if (progress.likeCount) {
            totalLikes += progress.likeCount;
          }
        }
      } catch (error) {
        console.error("Error calculating stats:", error);
      }
      
      setUserData({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User',
        username: user.username || 'User',
        email: user.email || '',
        memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Apr 2025',
        posts: userPosts.length,
        progressCount: progressUpdates.length,
        likesReceived: totalLikes,
        comments: totalComments,
        followers: followersCount,
        following: followingCount,
        recentPosts: userPosts.slice(0, 3).map(post => ({
          id: post.id,
          title: post.title || 'Untitled Post',
          content: post.content || '',
          summary: post.summary || '',
          category: post.category || 'General'
        }))
      });
      
      checkFollowStatus();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError("Error loading user profile");
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      if (!currentUserId || !userId) return;
      
      console.log(`Checking follow status: Current user ${currentUserId} -> Profile user ${userId}`);
      
      // IMPORTANT: First check if this user is in the followingIds array from localStorage
      // This is the approach used in UserSearch.jsx that works reliably
      const followDataKey = `follow_status_${currentUserId}`;
      const followData = JSON.parse(localStorage.getItem(followDataKey) || '{}');
      
      if (followData[userId] === true) {
        console.log(`User ${userId} is followed according to localStorage`);
        setIsFollowing(true);
        return;
      }
      
      // Method 1: Direct API call to check follow status
      try {
        const response = await apiService.isFollowing(currentUserId, userId);
        
        if (response && typeof response.isFollowing === 'boolean') {
          console.log(`Follow status direct check: ${response.isFollowing ? 'Following' : 'Not following'}`);
          setIsFollowing(response.isFollowing);
          storeFollowState(userId, response.isFollowing);
          return;
        }
      } catch (directCheckError) {
        console.error("Direct follow status check failed:", directCheckError);
      }
      
      // Method 2: Check user's following list
      try {
        const followingResponse = await apiService.getFollowing(currentUserId);
        
        if (followingResponse && followingResponse.following) {
          // Check if userId exists in the following list
          const isUserInFollowingList = followingResponse.following.some(user => 
            (typeof user === 'object' && user.id === userId) || 
            (typeof user === 'string' && user === userId)
          );
          
          console.log(`Follow status from following list: ${isUserInFollowingList ? 'Following' : 'Not following'}`);
          setIsFollowing(isUserInFollowingList);
          storeFollowState(userId, isUserInFollowingList);
          return;
        }
      } catch (followingError) {
        console.error("Following list check failed:", followingError);
      }
      
      // Method 3: Check if user is in followers list of target user
      try {
        const followersResponse = await apiService.getFollowers(userId);
        
        if (followersResponse && followersResponse.users) {
          const isCurrentUserFollower = followersResponse.users.some(user => 
            (typeof user === 'object' && user.id === currentUserId) || 
            (typeof user === 'string' && user === currentUserId)
          );
          
          console.log(`Follow status from followers list: ${isCurrentUserFollower ? 'Following' : 'Not following'}`);
          setIsFollowing(isCurrentUserFollower);
          storeFollowState(userId, isCurrentUserFollower);
          return;
        }
      } catch (followersError) {
        console.error("Followers list check failed:", followersError);
      }
      
      // If all methods fail, default to stored state or false
      const storedState = getStoredFollowState(userId);
      console.log(`Using stored follow state: ${storedState ? 'Following' : 'Not following'}`);
      setIsFollowing(storedState);
      
    } catch (error) {
      console.error("Error in checkFollowStatus:", error);
      // Fall back to stored state if available
      setIsFollowing(getStoredFollowState(userId));
    }
  };

  const handleFollow = async () => {
    if (!currentUserId) {
      toast.warning("Please log in to follow users");
      navigate('/login');
      return;
    }

    // Validate that we have a valid userId to follow/unfollow
    if (!userId || userId === 'undefined') {
      console.error("Invalid userId to follow/unfollow:", userId);
      toast.error("Cannot perform this action: Invalid user profile");
      return;
    }

    setFollowLoading(true);
    
    try {
      const actionType = isFollowing ? 'unfollow' : 'follow';
      console.log(`Attempting to ${actionType} user ${userId}`);
      
      // Optimistic UI update
      setIsFollowing(prevState => !prevState);
      
      if (isFollowing) {
        const result = await apiService.unfollowUser(userId);
        console.log("Unfollow result:", result);
        
        if (result && result.success === false) {
          // Revert on failure
          setIsFollowing(true);
          throw new Error(result.message || "Failed to unfollow user");
        }
        
        // Update localStorage
        storeFollowState(userId, false);
        
        toast.info(`You have unfollowed ${userData.name}`);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('followStatusChanged', {
          detail: { action: 'unfollow', targetUserId: userId }
        }));
      } else {
        const result = await apiService.followUser(userId);
        console.log("Follow result:", result);
        
        if (result && result.success === false) {
          // Revert on failure
          setIsFollowing(false);
          throw new Error(result.message || "Failed to follow user");
        }
        
        // Update localStorage
        storeFollowState(userId, true);
        
        toast.success(`You are now following ${userData.name}`);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('followStatusChanged', {
          detail: { action: 'follow', targetUserId: userId }
        }));
      }
      
      // Refresh follower count regardless of follow/unfollow
      try {
      const followersResponse = await apiService.getFollowers(userId);
      
        if (followersResponse && followersResponse.count !== undefined) {
        setUserData(prev => ({
          ...prev,
          followers: followersResponse.count
        }));
      }
      } catch (refreshError) {
        console.error("Error refreshing follower count:", refreshError);
      }
      
    } catch (error) {
      console.error("Error updating follow status:", error);
      const errorMessage = error.message || "Unknown error";
      toast.error(`Failed to update follow status: ${errorMessage}`);
    } finally {
      setFollowLoading(false);
    }
  };

  const getPostIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'technology':
        return <FaFileAlt className="text-blue-500" />;
      case 'design':
        return <FaFileAlt className="text-purple-500" />;
      case 'business':
        return <FaFileAlt className="text-green-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleCloseModal = () => {
    setShowLoginModal(false);
    // Navigate to login page or home
    navigate('/login');
  };

  if (loading && !showLoginModal) {
    return (
      <div>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen pt-20 bg-gradient-to-r from-blue-100 to-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col justify-center items-center min-h-screen pt-20 bg-gradient-to-r from-blue-100 to-white">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow mb-4">
            {error}
          </div>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Login modal for non-logged in users
  if (showLoginModal) {
    return (
      <div>
        <Navbar />
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            {/* Modal content */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
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
                  onClick={() => navigate('/')}
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow min-h-screen pt-20 font-sans bg-gradient-to-r from-blue-100 to-white">
        <div className="container max-w-6xl px-4 py-8 mx-auto">
          {/* Profile Header Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-blue-50">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-4xl font-bold text-white border-4 border-white shadow-md">
                    {userData.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start flex-grow gap-4">
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-800">{userData.name}</h1>
                  <p className="text-md text-blue-600">@{userData.username}</p>
                  
                  <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                    <FaCalendarAlt className="text-gray-500" />
                    <span className="text-sm text-gray-600">Joined {userData.memberSince}</span>
                  </div>
                  
                  {userData.email && (
                    <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                      <FaEnvelope className="text-gray-500" />
                      <span className="text-sm text-gray-600">{userData.email}</span>
                    </div>
                  )}
                </div>
                
                {currentUserId && currentUserId !== userId && (
                  <div className="flex flex-col items-center md:items-end gap-2">
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                      className={`py-2.5 px-6 rounded-full flex items-center gap-2 text-sm font-semibold transition-all shadow-sm
                        ${isFollowing 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                  >
                    {followLoading ? (
                      <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                          <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
                        </>
                      ) : (
                        <>
                          {isFollowing ? (
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
                    
                    {/* <Link to={`/chat/${userId}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Send Message
                    </Link> */}
                  </div>
                )}
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600/10 mb-2">
                  <FaFileAlt className="text-blue-600" />
                  </div>
                <div className="text-2xl font-bold text-gray-900">{userData.posts}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-600/10 mb-2">
                  <FaChartLine className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userData.progressCount}</div>
                <div className="text-sm text-gray-600">Progress Updates</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-600/10 mb-2">
                  <FaThumbsUp className="text-purple-600" />
                    </div>
                <div className="text-2xl font-bold text-gray-900">{userData.likesReceived}</div>
                <div className="text-sm text-gray-600">Likes</div>
                    </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-600/10 mb-2">
                  <FaComment className="text-amber-600" />
                  </div>
                <div className="text-2xl font-bold text-gray-900">{userData.comments}</div>
                      <div className="text-sm text-gray-600">Comments</div>
                </div>
              </div>
            </div>
            
              {/* Tabs Navigation */}
          <div className="bg-white rounded-xl shadow-md mb-8">
            <div className="flex overflow-x-auto scrollbar-hide">
                <button 
                  onClick={() => handleTabChange('overview')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'overview' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                } transition-colors`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => handleTabChange('posts')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'posts' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                } transition-colors`}
                >
                  Posts
                </button>
                <button 
                  onClick={() => handleTabChange('progress')}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'progress' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                } transition-colors`}
                >
                  Progress Updates
                </button>
            </div>
              </div>
              
          {/* Main Content */}
              {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Posts Section */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <FaFileAlt className="mr-2 text-blue-500" />
                      Recent Posts
                    </h2>
                  
                  {userData.recentPosts.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mb-3">
                          <FaEye className="text-gray-400 text-lg" />
                        </div>
                        <p className="text-lg font-medium mb-1">No posts yet</p>
                        <p className="text-sm">This user hasn't created any posts</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userData.recentPosts.map(post => (
                          <Link 
                            key={post.id} 
                            to={`/posts/${post.id}`}
                            className="block bg-white rounded-lg hover:bg-blue-50 border border-gray-100 p-4 transition-all hover:shadow-md"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              {getPostIcon(post.category)}
                              <h4 className="font-semibold text-lg text-gray-800 hover:text-blue-600 transition">{post.title}</h4>
                            </div>
                            <p className="text-gray-600 text-sm">
                              {post.summary || post.content?.substring(0, 120) || "No content"}
                              {(post.summary?.length > 120 || post.content?.length > 120) && "..."}
                            </p>
                          </Link>
                      ))}
                      
                        <div className="text-center mt-6">
                        <Link
                          to={`/user-posts/${userId}`}
                            className="inline-block px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-sm transition-all text-sm font-medium"
                        >
                          View All Posts
                        </Link>
                      </div>
                    </div>
                  )}
                  </div>
                  
                  {/* Recent Progress */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <FaChartLine className="mr-2 text-green-500" />
                      Recent Progress
                    </h2>
                    
                    <ProgressFeed userId={userId} limit={3} hideFilters={true} />
                    
                    <div className="text-center mt-6">
                      <button 
                        onClick={() => handleTabChange('progress')}
                        className="inline-block px-5 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 shadow-sm transition-all text-sm font-medium"
                      >
                        View All Progress Updates
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Sidebar Stats */}
                <div className="lg:col-span-1">
                  {/* Following Info */}
                  <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Network</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <Link to={`/followers/${userId}`} className="bg-blue-50 hover:bg-blue-100 transition-colors p-3 rounded-lg">
                        <div className="text-xl font-semibold text-blue-800">{userData.followers}</div>
                        <div className="text-sm text-gray-600">Followers</div>
                      </Link>
                      <Link to={`/following/${userId}`} className="bg-blue-50 hover:bg-blue-100 transition-colors p-3 rounded-lg">
                        <div className="text-xl font-semibold text-blue-800">{userData.following}</div>
                        <div className="text-sm text-gray-600">Following</div>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Activity Summary */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Activity Summary</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <FaFileAlt className="text-blue-600 text-lg" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{userData.posts}</div>
                          <div className="text-sm text-gray-600">Posts Created</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full">
                          <FaChartLine className="text-green-600 text-lg" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{userData.progressCount}</div>
                          <div className="text-sm text-gray-600">Progress Updates</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                          <FaThumbsUp className="text-purple-600 text-lg" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{userData.likesReceived}</div>
                          <div className="text-sm text-gray-600">Likes Received</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-full">
                          <FaComment className="text-amber-600 text-lg" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{userData.comments}</div>
                          <div className="text-sm text-gray-600">Comments</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              )}
              
              {activeTab === 'posts' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaFileAlt className="mr-2 text-blue-500" /> 
                All Posts
              </h2>
              
                  {userData.recentPosts.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mb-3">
                    <FaEye className="text-gray-400 text-lg" />
                  </div>
                  <p className="text-lg font-medium mb-1">No posts yet</p>
                  <p className="text-sm">This user hasn't created any posts</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Link 
                        to={`/user-posts/${userId}`}
                    className="inline-block px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-sm transition-all text-sm font-medium"
                      >
                        View All Posts
                      </Link>
                    </div>
                  )}
            </div>
              )}
              
              {activeTab === 'progress' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-green-500" />
                Progress Updates
              </h2>
              
                  <ProgressFeed userId={userId} hideFilters={false} />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile; 