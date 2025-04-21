import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus, FaUser, FaSignOutAlt, FaChartLine,
  FaFileAlt, FaComments, FaCompass, FaSearch, FaUsers
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import FollowList from "../components/FollowList";
import UserSearch from "../components/UserSearch";
import apiService from "../services/api";
import Swal from 'sweetalert2';

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
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

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

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
    
    // Initial fetch of user data
    fetchUserData();
    
    // Add event listener for follow/unfollow events
    const handleFollowStatusChange = () => {
      console.log("Follow status changed, refreshing dashboard data");
      fetchUserData();
    };
    
    window.addEventListener('followStatusChanged', handleFollowStatusChange);
    
    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('followStatusChanged', handleFollowStatusChange);
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
    import('../services/api').then(module => {
      const apiService = module.default;
      apiService.logout().then(() => {
        setIsLoggedIn(false);
        setUsername('');
        
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#ffffff'
        }).then(() => {
          navigate('/login');
          window.dispatchEvent(new Event('authStateChanged'));
        });
      });
    });
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="relative">
          {/* Animated sphere logo */}
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-800 rounded-full shadow-lg animate-pulse">
            <div className="absolute inset-4 bg-white/30 rounded-full"></div>
          </div>
          
          {/* SkillSphere text with animation */}
          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent">
              SkillSphere
            </h1>
            <p className="mt-2 text-blue-700/80 animate-pulse">Crafting your learning universe...</p>
          </div>
        </div>
        
        {/* Animated loading dots */}
        <div className="flex space-x-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
        
        {/* Subtle footer */}
        <p className="absolute bottom-6 text-sm text-blue-900/50">
          Loading your personalized dashboard...
        </p>
      </div>
    );
  }

  const renderTabContent = () => {
    const userId = localStorage.getItem('userId');
    
    switch(activeTab) {
      case 'profile':
        return (
          <>
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-blue-900">Welcome, {userData.name} 👋</h1>
              <button
                onClick={handleAddPost}
                className="bg-blue-900 text-white border-none py-2 px-4 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition duration-300"
                onMouseEnter={() => setHovered("mainAddPost")}
                onMouseLeave={() => setHovered(null)}
              >
                <FaPlus /> Add Post
              </button>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-5 rounded-xl shadow-md">
                <h3 className="mb-3 text-lg font-semibold text-blue-500">Your Info</h3>
                <p>Name: {userData.name}</p>
                <p>Email: {userData.email}</p>
                <p>Member Since: {userData.memberSince}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-md">
                <h3 className="mb-3 text-lg font-semibold text-blue-500">Progress</h3>
                <p>Posts: {userData.posts}</p>
                <p>Likes Received: {userData.likesReceived}</p>
                <p>Comments: {userData.comments}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-md">
                <h3 className="mb-3 text-lg font-semibold text-blue-500">Connections</h3>
                <p>Followers: {userData.followers}</p>
                <p>Following: {userData.following}</p>
                <button
                  className="mt-3 bg-blue-100 py-2 px-3 border-none rounded-lg font-medium cursor-pointer text-blue-800 hover:bg-blue-200 transition duration-300 flex items-center gap-2"
                  onMouseEnter={() => setHovered("viewConnections")}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setActiveTab('followers')}
                >
                  <FaUsers /> View Connections
                </button>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
              
              {userData.recentPosts.length === 0 ? (
                <div className="p-5 bg-gray-50 rounded-lg text-center text-gray-500">
                  You haven't created any posts yet.
                  <div className="mt-2">
                    <button
                      onClick={handleAddPost}
                      className="bg-blue-600 text-white border-none py-2 px-4 rounded-lg text-sm flex items-center gap-2 mx-auto hover:bg-blue-700 transition"
                      onMouseEnter={() => setHovered("emptyAddPost")}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <FaPlus /> Create Your First Post
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userData.recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
                      onClick={() => navigate(`/posts/${post.id}`)}
                    >
                      <div className="mb-2 text-2xl">{post.icon}</div>
                      <h3 className="font-semibold text-lg mb-2 text-blue-800">{post.title}</h3>
                      <p className="text-gray-600 line-clamp-2">
                        {post.summary || post.content.substring(0, 120) + '...'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        );
        
      case 'followers':
        return <FollowList type="followers" userId={userId} />;
        
      case 'following':
        return <FollowList type="following" userId={userId} />;
        
      case 'findUsers':
        return <UserSearch />;
        
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen font-sans bg-gradient-to-r from-blue-100 to-white text-blue-900 pt-20">
        <aside className="w-64 bg-blue-600 text-white p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-8">SkillSphere</h2>
          
          <div className="flex flex-col gap-4">
            {[
              { id: "profile", icon: <FaUser />, label: "Profile", onClick: () => setActiveTab('profile') },
              { id: "followers", icon: <FaUsers />, label: `Followers (${userData.followers})`, onClick: () => setActiveTab('followers') },
              { id: "following", icon: <FaUsers />, label: `Following (${userData.following})`, onClick: () => setActiveTab('following') },
              { id: "findUsers", icon: <FaSearch />, label: "Find Users", onClick: () => setActiveTab('findUsers') },
              { id: "explore", icon: <FaCompass />, label: "Explore", onClick: () => navigate("/") },
              { id: "addpost", icon: <FaPlus />, label: "Add Post", onClick: handleAddPost },
              { id: "progress", icon: <FaChartLine />, label: "Progress", onClick: () => navigate("#") },
            ].map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-left transition ${
                  activeTab === item.id ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {item.icon} {item.label}
                {hovered === item.id && (
                  <span className={`w-1 h-1 rounded-full bg-white ml-auto ${animate ? "animate-ping" : ""}`}></span>
                )}
              </button>
            ))}
          </div>
          
          <button
            onClick={showLogoutConfirmation}
            className="mt-auto bg-red-600 hover:bg-red-700 text-white flex items-center gap-3 py-2.5 px-3 rounded-lg transition"
            onMouseEnter={() => setHovered("logout")}
            onMouseLeave={() => setHovered(null)}
          >
            <FaSignOutAlt /> Logout
            {hovered === "logout" && (
              <span className={`w-1 h-1 rounded-full bg-white ml-auto ${animate ? "animate-ping" : ""}`}></span>
            )}
          </button>
        </aside>
        
        <main className="flex-1 p-6 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
