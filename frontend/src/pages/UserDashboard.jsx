import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus, FaUser, FaSignOutAlt, FaChartLine,
  FaFileAlt, FaComments, FaCompass
} from "react-icons/fa";

const UserDashboard = () => {
  const [animate, setAnimate] = useState(false);
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const getButtonStyle = (base, id) =>
    hovered === id ? { ...base, backgroundColor: "#ffffff", color: "#1976d2" } : base;

  const handleAddPost = () => navigate("/add-post");

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
          <h1 style={styles.title}>Welcome, Jane 👋</h1>
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
            <p>Name: Jane Doe</p>
            <p>Email: jane@example.com</p>
            <p>Member Since: Jan 2024</p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardHeader}>Progress</h3>
            <p>Posts: 8</p>
            <p>Likes Received: 124</p>
            <p>Comments: 42</p>
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
            <div style={styles.postCard}>📷 <strong>Photography Setup:</strong> My Home Studio</div>
            <div style={styles.postCard}>💻 <strong>React Mastery:</strong> Day 12 Recap</div>
            <div style={styles.postCard}>📚 <strong>Quick Snippets:</strong> JavaScript 101</div>
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
