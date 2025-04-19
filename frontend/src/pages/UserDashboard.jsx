import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaPlus, FaUser, FaSignOutAlt, FaChartLine,
  FaFileAlt, FaComments, FaCompass
} from "react-icons/fa";

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
    recentPosts: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
    
    // Fetch user data
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
          const postsResponse = await axios.get(`http://localhost:8081/api/posts/user/${userId}`, {
            withCredentials: true
          });
          
          if (postsResponse.data && Array.isArray(postsResponse.data)) {
            userPosts = postsResponse.data;
            console.log("Fetched posts:", userPosts);
          }
        } catch (postError) {
          console.error("Error fetching user posts:", postError);
        }
        
        // Set user data including posts
        setUserData({
          name: username || 'User',
          email: email || 'user@example.com',
          memberSince: 'Jan 2024', // Mock data until we have a real date
          posts: userPosts.length,
          likesReceived: userPosts.reduce((total, post) => total + (post.likeCount || 0), 0),
          comments: userPosts.reduce((total, post) => total + (post.commentCount || 0), 0),
          recentPosts: userPosts.slice(0, 3).map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            summary: post.summary,
            icon: getPostIcon(post.category)
          }))
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  // Helper function to get an icon based on post category
  const getPostIcon = (category) => {
    if (!category) return '📝';
    
    switch(category.toLowerCase()) {
      case 'photography': return '📷';
      case 'programming': return '💻';
      case 'design': return '🎨';
      case 'cooking': return '🍳';
      case 'music': return '🎵';
      case 'writing': return '📚';
      default: return '📝';
    }
  };

  const getButtonStyle = (base, id) =>
    hovered === id ? { ...base, backgroundColor: "#ffffff", color: "#1976d2" } : base;

  const handleAddPost = () => navigate("/add-post");

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <div style={{ ...styles.wrapper, justifyContent: 'center', alignItems: 'center' }}>
        <h2>Loading user data...</h2>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>SkillSphere</h2>
        {[
          { id: "profile", icon: <FaUser />, label: "Profile" },
          { id: "explore", icon: <FaCompass />, label: "Explore", onClick: () => navigate("/") },
          { id: "addpost", icon: <FaPlus />, label: "Add Post", onClick: handleAddPost },
          { id: "progress", icon: <FaChartLine />, label: "Progress" },
          { id: "docs", icon: <FaFileAlt />, label: "Documents" },
          { id: "comments", icon: <FaComments />, label: "Manage Comments" },
        ].map(({ id, icon, label, onClick }) => (
          <button
            key={id}
            style={getButtonStyle(styles.menuBtn, id)}
            onClick={onClick}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
          >
            {icon} {label}
          </button>
        ))}

        <button
          style={getButtonStyle(styles.logoutBtn, "logout")}
          onClick={() => {
            localStorage.clear();
            alert("Logged out successfully.");
            navigate("/login");
          }}
          onMouseEnter={() => setHovered("logout")}
          onMouseLeave={() => setHovered(null)}
        >
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <main
        style={{
          ...styles.content,
          opacity: animate ? 1 : 0,
          transform: animate ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease"
        }}
      >
        <header style={styles.header}>
          <h1 style={styles.title}>Welcome, {userData.name} 👋</h1>
          <button
            onClick={handleAddPost}
            style={getButtonStyle(styles.primaryBtn, "mainAddPost")}
            onMouseEnter={() => setHovered("mainAddPost")}
            onMouseLeave={() => setHovered(null)}
          >
            <FaPlus /> Add Post
          </button>
        </header>

        <section style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardHeader}>Your Info</h3>
            <p>Name: {userData.name}</p>
            <p>Email: {userData.email}</p>
            <p>Member Since: {userData.memberSince}</p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardHeader}>Progress</h3>
            <p>Posts: {userData.posts}</p>
            <p>Likes Received: {userData.likesReceived}</p>
            <p>Comments: {userData.comments}</p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardHeader}>Documents</h3>
            <button
              style={getButtonStyle(styles.secondaryBtn, "doc1")}
              onMouseEnter={() => setHovered("doc1")}
              onMouseLeave={() => setHovered(null)}
            >
              📄 My Posts
            </button>
            <button
              style={getButtonStyle(styles.secondaryBtn, "doc2")}
              onMouseEnter={() => setHovered("doc2")}
              onMouseLeave={() => setHovered(null)}
            >
              📥 Downloads
            </button>
          </div>
        </section>

        <section>
          <h2 style={styles.sectionHeader}>Recent Posts</h2>
          <div style={styles.postRow}>
            {userData.recentPosts && userData.recentPosts.length > 0 ? (
              userData.recentPosts.map((post, index) => (
                <div 
                  key={post.id || index} 
                  style={styles.postCard}
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  {post.icon || '📝'} <strong>{post.title || 'Untitled Post'}:</strong> {post.summary || post.content?.substring(0, 30) || 'No content'}...
                </div>
              ))
            ) : (
              <p>You haven't created any posts yet. Click "Add Post" to get started!</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

// 🔵 Blue & White Theme with Animations
const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Poppins, sans-serif",
    background: "linear-gradient(to right, #e3f2fd, #ffffff)",
    color: "#0d47a1",
  },
  sidebar: {
    width: "250px",
    background: "#1976d2",
    color: "white",
    padding: "30px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "30px",
  },
  menuBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#1565c0",
    border: "none",
    color: "#ffffff",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  logoutBtn: {
    marginTop: "auto",
    backgroundColor: "#e53935",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
  },
  content: {
    flex: 1,
    padding: "40px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "600",
  },
  primaryBtn: {
    background: "#0d47a1",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginBottom: "40px"
  },
  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
  },
  cardHeader: {
    marginBottom: "10px",
    fontSize: "18px",
    fontWeight: "600",
    color: "#2196f3"
  },
  secondaryBtn: {
    background: "#e3f2fd",
    padding: "10px 12px",
    border: "none",
    borderRadius: "8px",
    marginTop: "10px",
    fontWeight: "500",
    cursor: "pointer",
    color: "#1565c0",
    transition: "all 0.3s ease"
  },
  sectionHeader: {
    fontSize: "20px",
    marginBottom: "15px",
    color: "#0d47a1"
  },
  postRow: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap"
  },
  postCard: {
    background: "#f0f8ff",
    padding: "16px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(33, 150, 243, 0.2)",
    flex: "1 1 30%",
    cursor: "pointer",
    transition: "transform 0.3s ease",
  }
};

export default UserDashboard;
