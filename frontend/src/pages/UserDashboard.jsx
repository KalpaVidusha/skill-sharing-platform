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

const UserDashboard = () => {
  const [animate, setAnimate] = useState(false);
  const [hovered, setHovered] = useState(null);
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
        // Redirect to login if not logged in
        navigate('/login');
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
      case 'cooking': 
      case 'coocking': return '🍳'; // Handle both spellings
      case 'music': return '🎵';
      case 'writing': return '📚';
      default: 
        console.log("Using default icon for category:", category);
        return '📝';
    }
  };

  const handleAddPost = () => navigate("/add-post");

  const handleLogout = () => {
    apiService.logout()
      .then(() => {
        navigate("/login");
      })
      .catch(error => {
        console.error("Logout failed:", error);
        // Still clear localStorage and redirect even if API call fails
        localStorage.clear();
        navigate("/login");
      });
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-100 to-white">
        <h2 className="text-2xl text-blue-800">Loading user data...</h2>
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
      <div className="flex min-h-[calc(100vh-64px)] font-sans bg-gradient-to-r from-blue-100 to-white text-blue-900">
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
            onClick={handleLogout}
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
