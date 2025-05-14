import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaUser, FaChartLine, FaFileAlt, FaUsers, FaThumbsUp, FaComment
} from "react-icons/fa";
import Navbar from "../components/Navbar";
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
      checkFollowStatus();
    }
  }, [userId, currentUserId, navigate, isLoggedIn]);

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
      
      // Calculate total comments from all posts
      let totalComments = 0;
      let totalLikes = 0;
      try {
        for (const post of userPosts) {
          if (post.commentCount) {
            totalComments += post.commentCount;
          }
          if (post.likeCount) {
            totalLikes += post.likeCount;
          }
        }
      } catch (error) {
        console.error("Error calculating stats:", error);
      }
      
      setUserData({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User',
        username: user.username || 'User',
        email: user.email || '',
        memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Jan 2024',
        posts: userPosts.length,
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
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError("Error loading user profile");
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      if (!currentUserId) return;
      
      const following = await apiService.getFollowing(currentUserId);
      
      if (following && following.users) {
        const isUserFollowed = following.users.some(u => u.id === userId);
        setIsFollowing(isUserFollowed);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
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
      console.log(`Current user: ${currentUserId}, Profile user: ${userId}, isFollowing: ${isFollowing}`);
      
      if (isFollowing) {
        console.log(`Attempting to unfollow user ${userId}`);
        const result = await apiService.unfollowUser(userId);
        console.log("Unfollow result:", result);
        setIsFollowing(false);
        toast.info(`You have unfollowed ${userData.name}`);
      } else {
        console.log(`Attempting to follow user ${userId}`);
        const result = await apiService.followUser(userId);
        console.log("Follow result:", result);
        setIsFollowing(true);
        toast.success(`You are now following ${userData.name}`);
      }
      
      // Refresh follower count
      const followersResponse = await apiService.getFollowers(userId);
      console.log("Updated followers:", followersResponse);
      
      if (followersResponse && followersResponse.count) {
        setUserData(prev => ({
          ...prev,
          followers: followersResponse.count
        }));
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
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans text-blue-900 bg-gradient-to-r from-blue-100 to-white">
        <div className="container max-w-6xl px-4 py-8 mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Sidebar */}
            <div className="w-full md:w-1/3">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-3xl font-bold text-white mb-4">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-2xl font-semibold">{userData.name}</h2>
                  <p className="text-gray-600">@{userData.username}</p>
                  <p className="text-sm text-gray-500 mt-1">Member since {userData.memberSince}</p>
                </div>
                
                {currentUserId && currentUserId !== userId && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`w-full py-2 px-4 rounded-lg ${
                      isFollowing 
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-medium transition-colors mb-4 flex justify-center items-center`}
                  >
                    {followLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isFollowing ? 'Unfollowing...' : 'Following...'}
                      </>
                    ) : (
                      isFollowing ? 'Unfollow' : 'Follow'
                    )}
                  </button>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xl font-semibold">{userData.followers}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xl font-semibold">{userData.following}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xl font-semibold">{userData.posts}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xl font-semibold">{userData.likesReceived}</div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                </div>
              </div>
              
              {/* Activity Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">Activity Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FaFileAlt className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{userData.posts}</div>
                      <div className="text-sm text-gray-600">Posts Created</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-full">
                      <FaThumbsUp className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{userData.likesReceived}</div>
                      <div className="text-sm text-gray-600">Likes Received</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <FaComment className="text-yellow-600 text-lg" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{userData.comments}</div>
                      <div className="text-sm text-gray-600">Comments</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full md:w-2/3">
              {/* Tabs Navigation */}
              <div className="flex border-b border-gray-200 mb-6">
                <button 
                  onClick={() => handleTabChange('overview')}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'overview' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => handleTabChange('posts')}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'posts' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  Posts
                </button>
                <button 
                  onClick={() => handleTabChange('progress')}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'progress' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  Progress Updates
                </button>
              </div>
              
              {/* Tab Content */}
              {activeTab === 'overview' && (
                <>
                  <h3 className="mb-4 text-xl font-semibold border-b pb-2">Recent Posts</h3>
                  
                  {userData.recentPosts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                      No posts yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userData.recentPosts.map(post => (
                        <div key={post.id} className="bg-white rounded-lg shadow p-4 transition hover:shadow-md">
                          <Link to={`/posts/${post.id}`} className="block">
                            <div className="flex items-center gap-3 mb-2">
                              {getPostIcon(post.category)}
                              <h4 className="font-semibold text-lg hover:text-blue-600 transition">{post.title}</h4>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                              {post.summary || post.content?.substring(0, 100) || "No content"}
                              {(post.summary?.length > 100 || post.content?.length > 100) && "..."}
                            </p>
                          </Link>
                        </div>
                      ))}
                      
                      <div className="text-center mt-4">
                        <Link
                          to={`/user-posts/${userId}`}
                          className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                        >
                          View All Posts
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <h3 className="mb-4 text-xl font-semibold border-b pb-2">Recent Progress</h3>
                    <ProgressFeed userId={userId} limit={3} hideFilters={true} />
                    
                    <div className="text-center mt-4">
                      <button 
                        onClick={() => handleTabChange('progress')}
                        className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                      >
                        View All Progress Updates
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'posts' && (
                <>
                  <h3 className="mb-4 text-xl font-semibold border-b pb-2">All Posts</h3>
                  {userData.recentPosts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                      No posts yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Link 
                        to={`/user-posts/${userId}`}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        View All Posts
                      </Link>
                    </div>
                  )}
                </>
              )}
              
              {activeTab === 'progress' && (
                <>
                  <h3 className="mb-4 text-xl font-semibold border-b pb-2">Progress Updates</h3>
                  <ProgressFeed userId={userId} hideFilters={false} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 