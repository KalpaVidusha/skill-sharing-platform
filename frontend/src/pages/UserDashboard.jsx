import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import {
  FaPlus, FaChartLine, FaCompass, FaUsers, FaRegThumbsUp, FaRegComment,
  FaCog, FaCalendarAlt, FaEnvelope, FaBell, FaChevronRight, FaTrophy
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import apiService from "../services/api";
import Swal from 'sweetalert2';
import Sidebar from '../components/Sidebar';
import PostCard from './Posts/PostCard';

const UserDashboard = () => {
  const [animate, setAnimate] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    fullName: "",
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
  const [progressStats, setProgressStats] = useState({
    count: 0,
    likes: 0,
    comments: 0
  });
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const [initialLoad, setInitialLoad] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);

  // Function to fetch user data - extracted so it can be called to refresh
  const fetchUserData = async () => {
    setLoading(true); // Always set loading to true when fetching data
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
      
      // Initialize full name variables
      let firstName = '';
      let lastName = '';
      let fullName = '';
      
      // Try to fetch user details from API
      try {
        console.log("Fetching user details for ID:", userId);
        const userResponse = await apiService.getUserById(userId);
        console.log("User API response:", userResponse);
        
        if (userResponse) {
          // Extract user data directly from the API response
          firstName = userResponse.firstName || '';
          lastName = userResponse.lastName || '';
        }
      } catch (userError) {
        console.error("Error fetching user details:", userError);
      }
      
      // Construct full name with fallbacks
      if (firstName || lastName) {
        fullName = `${firstName} ${lastName}`.trim();
      } else {
        fullName = username || 'User';
      }
      
      console.log("Final name data:", { firstName, lastName, fullName });
      
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
        firstName: firstName,
        lastName: lastName,
        fullName: fullName,
        email: email || 'user@example.com',
        memberSince: 'Mar 2025', // Mock data until we have a real date
        posts: userPosts.length,
        likesReceived: userPosts.reduce((total, post) => total + (post.likeCount || 0), 0),
        comments: totalComments,
        followers: followersCount,
        following: followingCount,
        recentPosts: userPosts.slice(0, 3)
      });
      
      setDataFetched(true);
      setLoading(false);
      setInitialLoad(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
      setInitialLoad(false);
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
        
        // Calculate progress stats
        const totalLikes = progressResponse.reduce((total, progress) => {
          return total + (progress.likes ? progress.likes.length : 0);
        }, 0);
        
        const totalComments = progressResponse.reduce((total, progress) => {
          return total + (progress.commentCount || 0);
        }, 0);
        
        // Set progress statistics
        setProgressStats({
          count: progressResponse.length,
          likes: totalLikes,
          comments: totalComments
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
      
      // Format based on template type, similar to ProgressFeed.jsx
      if (progress.templateType && typeof progress.content === 'object') {
        switch (progress.templateType) {
          case 'completed_tutorial':
            return `✅ I completed ${progress.content.tutorialName || 'a tutorial'} today!`;
          case 'new_skill':
            return `🎯 Today I learned about ${progress.content.skillName || 'a new skill'}`;
          case 'learning_goal':
            return `📅 I aim to finish ${progress.content.goalName || 'my goal'} by ${progress.content.targetDate || 'the deadline'}`;
          default:
            // If none of the specific templates, fallback to generic formatting
            return Object.entries(progress.content)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
        }
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
      // Always fetch data on profile navigation or first load
      if (location.pathname === '/userdashboard' || initialLoad) {
        setLoading(true);
        fetchUserData();
        fetchUserProgressData();
      }
    }
    
    // Listen for auth state changes
    window.addEventListener('authStateChanged', () => {
      if (!verifyAuthentication()) {
        // Redirect happened in verifyAuthentication
        return;
      }
      setLoading(true);
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
  }, [navigate, location.pathname, initialLoad]);

  // Helper function to get an icon based on post category
  // const getPostIcon = (category) => {
  //   if (!category) return '📝';
    
  //   const categoryLowerCase = category.toLowerCase().trim();
  //   console.log("Category:", categoryLowerCase);
    
  //   switch(categoryLowerCase) {
  //     case 'photography': return '📷';
  //     case 'programming': return '💻';
  //     case 'design': return '🎨';
  //     case 'cooking': return '🍳';
  //     case 'music': return '🎵';
  //     case 'writing': return '📚';
  //     default: 
  //       console.log("Using default icon for category:", category);
  //       return '📝';
  //   }
  // };

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

  // Modified loading indicator that shows below navbar
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 pt-20"> {/* Added pt-20 for navbar spacing */}
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
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-br from-blue-50/80 to-indigo-50/80">
        {/* Enhanced Sidebar with userId passed */}
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          <Sidebar defaultActiveTab="profile" userId={userId} />
        </div>
        {/* Main Content - Only showing profile */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Enhanced Welcome Header */}
          <div className="relative mb-8 overflow-hidden bg-white rounded-xl shadow-md">
            <div className="absolute top-0 right-0 w-64 h-full opacity-10">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4f46e5" d="M39.5,-65.3C50.2,-56.7,57.5,-43.9,63.2,-30.8C68.8,-17.6,72.8,-4.1,71.8,9.1C70.7,22.3,64.6,35.2,55.4,46.4C46.1,57.5,33.7,67.1,19.8,71.3C5.9,75.6,-9.6,74.6,-23.3,69.4C-37,64.3,-49,55,-58.9,43.5C-68.8,31.9,-76.6,18,-78.1,3.2C-79.5,-11.7,-74.7,-27.4,-65.7,-39.9C-56.7,-52.3,-43.5,-61.4,-30.3,-68.7C-17.1,-75.9,-3.9,-81.2,8,-77.8C19.8,-74.3,28.7,-73.9,39.5,-65.3Z" transform="translate(100 100)" />
              </svg>
            </div>
            
            <div className="relative flex flex-col px-6 py-8 md:flex-row md:items-center">
              {/* User Avatar */}
              <div className="flex items-center justify-center mb-4 md:mb-0 md:mr-8">
                <div className="relative">
                  <div className="flex items-center justify-center w-20 h-20 text-2xl font-bold text-white bg-gradient-to-br from-indigo-600 to-blue-500 rounded-full">
                    {userData.firstName ? userData.firstName.charAt(0).toUpperCase() : userData.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-grow">
                <h1 className="mb-1 text-2xl font-bold text-gray-800">
                  Welcome back, <span className="text-indigo-600">{userData.fullName}</span>
                </h1>
                <p className="text-gray-600">
                  Continue your learning journey and track your progress
                </p>
              </div>
              
              {/* Action Button */}
              <button
                onClick={handleAddPost}
                className="flex items-center px-5 py-2 mt-4 text-sm font-medium text-white transition duration-300 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg shadow hover:shadow-md md:mt-0"
              >
                <FaPlus className="mr-2" /> Share New Post
              </button>
            </div>
          </div>

          {/* Stats Cards - Redesigned */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            {/* Your Info Card - Redesigned */}
            <div className="overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="flex items-center text-lg font-semibold text-gray-800">
                  <FaUsers className="mr-2 text-indigo-500" /> Your Profile
                </h3>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-4 text-gray-700">
                  <FaUsers className="w-5 h-5 mr-3 text-indigo-400" />
                  <span className="font-medium">Name:</span>
                  <span className="ml-2">{userData.fullName}</span>
                </div>
                
                <div className="flex items-center mb-4 text-gray-700">
                  <FaEnvelope className="w-5 h-5 mr-3 text-indigo-400" />
                  <span className="font-medium">Email:</span>
                  <span className="ml-2 text-sm">{userData.email}</span>
                </div>
                
                <div className="flex items-center mb-5 text-gray-700">
                  <FaCalendarAlt className="w-5 h-5 mr-3 text-indigo-400" />
                  <span className="font-medium">Member Since:</span>
                  <span className="ml-2">{userData.memberSince}</span>
                </div>
                
                <button
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-indigo-600 transition duration-300 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                  onMouseEnter={() => setHovered("viewSettings")}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => navigate("/userdashboard/settings")}
                >
                  <FaCog className="text-indigo-500" /> Manage Settings
                </button>
              </div>
            </div>
            
            {/* Progress Card - Redesigned */}
            <div className="overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="flex items-center text-lg font-semibold text-gray-800">
                  <FaChartLine className="mr-2 text-green-500" /> Learning Progress
                </h3>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress Updates</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {progressStats.count}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500" 
                      style={{ width: `${Math.min(100, progressStats.count * 5)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div className="flex items-center text-gray-700">
                    <FaRegThumbsUp className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">Likes Received</span>
                  </div>
                  <span className="font-medium text-gray-900">{progressStats.likes}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div className="flex items-center text-gray-700">
                    <FaRegComment className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">Comments</span>
                  </div>
                  <span className="font-medium text-gray-900">{progressStats.comments}</span>
                </div>
                
                <button
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-3 font-medium text-green-600 transition duration-300 bg-green-50 rounded-lg hover:bg-green-100"
                  onMouseEnter={() => setHovered("viewProgress")}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => navigate("/userdashboard/progress")}
                >
                  <FaChartLine /> View All Progress
                </button>
              </div>
            </div>
            
            {/* Connections Card - Redesigned */}
            <div className="overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="flex items-center text-lg font-semibold text-gray-800">
                  <FaUsers className="mr-2 text-blue-500" /> Your Network
                </h3>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-center gap-8 mb-6">
                  <div className="text-center">
                    <div className="mb-2 text-2xl font-bold text-gray-800">{userData.followers}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="w-px h-12 bg-gray-200"></div>
                  <div className="text-center">
                    <div className="mb-2 text-2xl font-bold text-gray-800">{userData.following}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="mb-2 text-sm font-medium text-gray-700">Network growth</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" 
                      style={{ width: `${Math.min(100, userData.followers * 5)}%` }}
                    ></div>
                  </div>
                </div>
                
                <button
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-3 font-medium text-blue-600 transition duration-300 bg-blue-50 rounded-lg hover:bg-blue-100"
                  onMouseEnter={() => setHovered("viewConnections")}
                  onMouseLeave={() => setHovered(null)}
                  onClick={navigateToFollowers}
                >
                  <FaUsers /> Manage Connections
                </button>
              </div>
            </div>
          </div>

          {/* Recent Posts Section - Redesigned */}
          <div className="mb-10 overflow-hidden bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Recent Posts</h2>
              {userData.recentPosts.length > 0 && (
                <button 
                  onClick={() => navigate('/userdashboard/posts')}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  View All <FaChevronRight className="w-3 h-3 ml-1" />
                </button>
              )}
            </div>
            
            <div className="p-6">
              {userData.recentPosts.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mb-4 bg-indigo-100 rounded-full">
                    <FaPlus className="text-xl text-indigo-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-gray-800">No posts yet</h3>
                  <p className="max-w-sm mb-6 text-sm text-gray-600">
                    Share your knowledge and progress with the community by creating your first post.
                  </p>
                  <button
                    onClick={handleAddPost}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    <FaPlus className="text-xs" /> Create Your First Post
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {userData.recentPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Progress Section - Redesigned */}
          <div className="overflow-hidden bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Learning Progress</h2>
              {userProgress.length > 0 && (
                <button 
                  onClick={() => navigate('/userdashboard/progress')}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  View All <FaChevronRight className="w-3 h-3 ml-1" />
                </button>
              )}
            </div>
            
            <div className="p-6">
              {userProgress.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
                    <FaChartLine className="text-xl text-green-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-gray-800">No progress updates</h3>
                  <p className="max-w-sm mb-6 text-sm text-gray-600">
                    Track your learning journey by sharing regular progress updates.
                  </p>
                  <button
                    onClick={() => navigate('/userdashboard/progress/add')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    <FaPlus className="text-xs" /> Add Progress Update
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {userProgress.slice(0, 4).map((progress) => (
                    <div
                      key={progress.id}
                      className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 rounded-lg hover:shadow-md"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <span className="flex items-center justify-center w-8 h-8 mr-3 text-green-600 bg-green-100 rounded-full">
                              <FaTrophy className="text-sm" />
                            </span>
                            <h3 className="font-semibold text-gray-800">
                              {progress.templateType && progress.templateType.charAt(0).toUpperCase() + progress.templateType.slice(1)}
                            </h3>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                            {new Date(progress.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="mb-3 text-sm text-gray-600">
                          {progress.formattedContent || formatProgressContent(progress)}
                        </p>
                        
                        {/* Display media content if available */}
                        {renderMedia(progress)}
                        
                        {/* Engagement metrics */}
                        <div className="flex items-center pt-3 mt-3 text-xs text-gray-500 border-t border-gray-100">
                          <div className="flex items-center mr-4">
                            <FaRegThumbsUp className="mr-1 text-blue-500" /> 
                            <span>{progress.likes ? progress.likes.length : 0}</span>
                          </div>
                          <div className="flex items-center">
                            <FaRegComment className="mr-1 text-blue-500" /> 
                            <span>{progress.commentCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;