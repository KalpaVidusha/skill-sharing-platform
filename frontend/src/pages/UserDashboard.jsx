import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import {
  FaPlus, FaChartLine, FaCompass, FaUsers, FaRegThumbsUp, FaRegComment     
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import apiService from "../services/api";
import Swal from 'sweetalert2';
import Sidebar from '../components/Sidebar';

const UserDashboard = () => {
  const [animate, setAnimate] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    memberSince: "",
    posts: 0,
    likesReceived: 0,
    comments: 0,
    followers: 0,
    following: 0,
    recentPosts: []
  });
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');

  // Function to fetch user data - extracted so it can be called to refresh
  const fetchUserData = async () => {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userId = localStorage.getItem('userId');
      
      if (!isLoggedIn || !userId) {
        Swal.fire({
          title: 'Access Required',
          html: `
            <div class="text-center">
              <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">
                Welcome to <span class="text-indigo-600 font-extrabold">SkillSphere</span>
              </h3>
              <p class="text-base text-gray-700 font-medium tracking-wide mb-2">
                Please sign in to continue your learning journey
              </p>
              <p class="text-sm text-gray-500 font-medium tracking-tight">
                Don't have an account? Join us today!
              </p>
            </div>
          `,
          background: 'rgba(255, 255, 255, 0.9)',
          backdrop: `
            rgba(0, 0, 0, 0.15)
            left top
            no-repeat
          `,
          showCancelButton: true,
          confirmButtonText: 'Sign In',
          cancelButtonText: 'Register',
          focusConfirm: false,
          customClass: {
            popup: 'rounded-xl shadow-lg border border-gray-200 backdrop-blur-md',
            htmlContainer: 'text-center mx-4',
            actions: 'mt-4 flex justify-center gap-4',
            confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition',
            cancelButton: 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-5 py-2 rounded-lg font-medium transition'
          },
          buttonsStyling: false,
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login');
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            navigate('/signup');
          }
        });
        return;
      }           
      
      // Get basic user info from localStorage
      const username = localStorage.getItem('username');
      const email = localStorage.getItem('email');
      
      // Fetch user's recent posts
      let userPosts = [];
      try {
        const postsResponse = await apiService.getPostsByUser(userId);
        
        if (postsResponse && Array.isArray(postsResponse)) {
          userPosts = postsResponse;
          console.log("Fetched posts:", userPosts);
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
      try {
        // First try to get comments count from each post
        for (const post of userPosts) {
          if (post.commentCount) {
            totalComments += post.commentCount;
          } else if (post.id) {
            // If commentCount isn't available, try to fetch comments for this post
            try {
              const commentsResponse = await apiService.getCommentsByPost(post.id);
              if (commentsResponse && Array.isArray(commentsResponse)) {
                totalComments += commentsResponse.length;
              }
            } catch (err) {
              console.error(`Error fetching comments for post ${post.id}:`, err);
            }
          }
        }
      } catch (commentsError) {
        console.error("Error calculating total comments:", commentsError);
      }
      
      // Set user data including posts and follow counts
      setUserData({
        name: username || 'User',
        email: email || 'user@example.com',
        memberSince: 'Jan 2024', // Mock data until we have a real date
        posts: userPosts.length,
        likesReceived: userPosts.reduce((total, post) => total + (post.likeCount || 0), 0),
        comments: totalComments,
        followers: followersCount,
        following: followingCount,
        recentPosts: userPosts.slice(0, 3).map(post => ({
          id: post.id,
          title: post.title || 'Untitled Post',
          content: post.content || '',
          summary: post.summary || '',
          icon: getPostIcon(post.category)
        }))
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  // Function to fetch user progress data
  const fetchUserProgressData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      console.log("Fetching progress data for user:", userId);
      const progressResponse = await apiService.getAllProgress(userId);
      
      if (progressResponse && Array.isArray(progressResponse)) {
        // Sort progress with newest first
        const sortedProgress = [...progressResponse].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        
        setUserProgress(sortedProgress);
      }
    } catch (error) {
      console.error('Error fetching user progress data:', error);
    }
  };
  
  // Helper function to format progress content
  const formatProgressContent = (progress) => {
    if (!progress || !progress.content) return '';
    
    try {
      // If content is already a string, return it
      if (typeof progress.content === 'string') {
        return progress.content;
      }
      
      // If content has a customContent field, use that
      if (progress.content.customContent) {
        return progress.content.customContent;
      }
      
      // If content is an object with field values
      if (typeof progress.content === 'object') {
        // Fallback - create a basic formatted string
        return Object.entries(progress.content)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      }
      
      return JSON.stringify(progress.content);
    } catch (error) {
      console.error('Error formatting progress content:', error);
      return 'Progress update';
    }
  };

  // Render the media content (image or GIF)
  const renderMedia = (progress) => {
    if (!progress.mediaUrl) return null;
    
    return (
      <div className="mt-3 mb-4">
        <img 
          src={progress.mediaUrl.startsWith('http') ? progress.mediaUrl : `${process.env.PUBLIC_URL}${progress.mediaUrl}`} 
          alt="Progress media" 
          className="rounded-lg max-h-80 max-w-full mx-auto object-contain" 
        />
      </div>
    );
  };

  useEffect(() => {
    const verifyAuthentication = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      // Check for all required auth data, not just isLoggedIn flag
      if (!isLoggedIn || !token || !userId) {
        // Clear any partial auth data that might exist
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("isLoggedIn");
        
        // Redirect to login
        navigate('/login');
        return false;
      }
      
      // Set local auth state
      setIsLoggedIn(true);
      setUsername(localStorage.getItem('username') || '');
      return true;
    };
    
    // Verify authentication before fetching data
    if (verifyAuthentication()) {
      fetchUserData();
      fetchUserProgressData();
    }
    
    // Listen for auth state changes
    window.addEventListener('authStateChanged', () => {
      if (!verifyAuthentication()) {
        // Redirect happened in verifyAuthentication
        return;
      }
      fetchUserData();
      fetchUserProgressData();
    });
    
    // Check auth status when component is focused (user returns from another tab/window)
    window.addEventListener('focus', verifyAuthentication);
    
    // Cleanup
    return () => {
      window.removeEventListener('authStateChanged', verifyAuthentication);
      window.removeEventListener('focus', verifyAuthentication);
    };
  }, [navigate]);

  // Helper function to get an icon based on post category
  const getPostIcon = (category) => {
    if (!category) return '📝';
    
    const categoryLowerCase = category.toLowerCase().trim();
    console.log("Category:", categoryLowerCase);
    
    switch(categoryLowerCase) {
      case 'photography': return '📷';
      case 'programming': return '💻';
      case 'design': return '🎨';
      case 'cooking': return '🍳';
      case 'music': return '🎵';
      case 'writing': return '📚';
      default: 
        console.log("Using default icon for category:", category);
        return '📝';
    }
  };

  const handleAddPost = () => navigate("/add-post");

  const showLogoutConfirmation = () => {
    Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      background: '#ffffff',
      backdrop: 'rgba(79, 70, 229, 0.1)'
    }).then((result) => {
      if (result.isConfirmed) {
        performLogout();
      }
    });
  };

  const performLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("isLoggedIn");
    
    // Show success message
        Swal.fire({
      title: 'Logged Out',
          text: 'You have been successfully logged out.',
          icon: 'success',
      timer: 2000,
          showConfirmButton: false,
      background: '#ffffff',
      backdrop: 'rgba(79, 70, 229, 0.1)'
        }).then(() => {
      // Dispatch custom event to notify other components
          window.dispatchEvent(new Event('authStateChanged'));
      
      // Navigate to home page
      navigate('/');
    });
  };

  // Navigate to followers page
  const navigateToFollowers = () => {
    navigate('/followers', { state: { userId } });
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="relative">
          {/* Animated sphere logo */}
          <div className="w-24 h-24 rounded-full shadow-lg bg-gradient-to-tr from-blue-600 to-indigo-800 animate-pulse">
            <div className="absolute rounded-full inset-4 bg-white/30"></div>
          </div>
          
          {/* SkillSphere text with animation */}
          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text">
              SkillSphere
            </h1>
            <p className="mt-2 text-blue-700/80 animate-pulse">Crafting your learning universe...</p>
          </div>
        </div>
        
        {/* Animated loading dots */}
        <div className="flex mt-8 space-x-2">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
        
        {/* Subtle footer */}
        <p className="absolute text-sm bottom-6 text-blue-900/50">
          Loading your personalized dashboard...
        </p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-r from-blue-50 to-white">
        {/* Enhanced Sidebar with userId passed */}
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          <Sidebar defaultActiveTab="profile" userId={userId} />
        </div>
        {/* Main Content - Only showing profile */}
        <main className="flex-1 p-8 overflow-y-auto">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-blue-900">Welcome, {userData.name} 👋</h1>
            <button
              onClick={handleAddPost}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white transition duration-300 bg-blue-900 border-none rounded-lg hover:bg-blue-700"
              onMouseEnter={() => setHovered("mainAddPost")}
              onMouseLeave={() => setHovered(null)}
            >
              <FaPlus /> Add Post
            </button>
          </header>

          <section className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
            <div className="p-5 bg-white shadow-md rounded-xl">
              <h3 className="mb-3 text-lg font-semibold text-blue-500">Your Info</h3>
              <p>Name: {userData.name}</p>
              <p>Email: {userData.email}</p>
              <p>Member Since: {userData.memberSince}</p>
            </div>
            <div className="p-5 bg-white shadow-md rounded-xl">
              <h3 className="mb-3 text-lg font-semibold text-blue-500">Progress</h3>
              <p>Posts: {userData.posts}</p>
              <p>Likes Received: {userData.likesReceived}</p>
              <p>Comments: {userData.comments}</p>
              <button
                className="flex items-center gap-2 px-3 py-2 mt-3 font-medium text-blue-800 transition duration-300 bg-blue-100 border-none rounded-lg cursor-pointer hover:bg-blue-200"
                onMouseEnter={() => setHovered("viewProgress")}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate("/userdashboard/progress")}
              >
                <FaChartLine /> View Progress
              </button>
            </div>
            <div className="p-5 bg-white shadow-md rounded-xl">
              <h3 className="mb-3 text-lg font-semibold text-blue-500">Connections</h3>
              <p>Followers: {userData.followers}</p>
              <p>Following: {userData.following}</p>
              <button
                className="flex items-center gap-2 px-3 py-2 mt-3 font-medium text-blue-800 transition duration-300 bg-blue-100 border-none rounded-lg cursor-pointer hover:bg-blue-200"
                onMouseEnter={() => setHovered("viewConnections")}
                onMouseLeave={() => setHovered(null)}
                onClick={navigateToFollowers}
              >
                <FaUsers /> View Connections
              </button>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Recent Posts</h2>
            
            {userData.recentPosts.length === 0 ? (
              <div className="p-5 text-center text-gray-500 rounded-lg bg-gray-50">
                You haven't created any posts yet.
                <div className="mt-2">
                  <button
                    onClick={handleAddPost}
                    className="flex items-center gap-2 px-4 py-2 mx-auto text-sm text-white transition bg-blue-600 border-none rounded-lg hover:bg-blue-700"
                    onMouseEnter={() => setHovered("emptyAddPost")}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <FaPlus /> Create Your First Post
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {userData.recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-5 transition bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg"
                    onClick={() => navigate(`/posts/${post.id}`)}
                  >
                    <div className="mb-2 text-2xl">{post.icon}</div>
                    <h3 className="mb-2 text-lg font-semibold text-blue-800">{post.title}</h3>
                    <p className="text-gray-600 line-clamp-2">
                      {post.summary || post.content.substring(0, 120) + '...'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Progress</h2>
            </div>
            
            {userProgress.length === 0 ? (
              <div className="p-5 text-center text-gray-500 rounded-lg bg-gray-50">
                You haven't shared any progress updates yet.
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md">
                {userProgress.slice(0, 3).map((progress, index) => (
                  <div
                    key={progress.id}
                    className={`p-4 ${index !== userProgress.slice(0, 3).length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="mb-1 font-semibold text-blue-800 text-md">
                          {progress.templateType && progress.templateType.charAt(0).toUpperCase() + progress.templateType.slice(1)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {progress.formattedContent || formatProgressContent(progress)}
                        </p>
                        
                        {/* Display media content if available */}
                        {renderMedia(progress)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(progress.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Add Like and Comment Counts */}
                    <div className="flex items-center mt-3 text-xs text-gray-500">
                      <div className="flex items-center mr-4">
                        <FaRegThumbsUp className="mr-1" /> 
                        {progress.likes ? progress.likes.length : 0} {progress.likes && progress.likes.length === 1 ? 'like' : 'likes'}
                      </div>
                      <div className="flex items-center">
                        <FaRegComment className="mr-1" /> 
                        {progress.commentCount || 0} {progress.commentCount === 1 ? 'comment' : 'comments'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;