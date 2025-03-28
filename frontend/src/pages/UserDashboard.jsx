// src/pages/UserDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSignOutAlt, FaUser, FaChartLine, FaFileAlt } from "react-icons/fa";

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleAddPost = () => {
    navigate("/add-post");
  };

  const handleLogout = () => {
    alert("Logged out successfully.");
    navigate("/login");
  };

  return (
    <div style={pageWrapper}>
      <aside style={sidebar}>
        <h2 style={logo}>SkillSphere</h2>
        <div style={menuItem}><FaUser style={icon} /> Profile</div>
        <div style={menuItem}><FaPlus style={icon} /> Add Post</div>
        <div style={menuItem}><FaChartLine style={icon} /> Progress</div>
        <div style={menuItem}><FaFileAlt style={icon} /> Documents</div>
        <div onClick={handleLogout} style={logoutItem}><FaSignOutAlt style={icon} /> Logout</div>
      </aside>

      <main style={mainContent}>
        <header style={topBar}>
          <h1 style={pageTitle}>User Dashboard</h1>
          <button style={addButton} onClick={handleAddPost}><FaPlus /> Add Post</button>
        </header>

        <section style={infoGrid}>
          <div style={infoCard}>
            <h3 style={cardTitle}>Your Info</h3>
            <p>Name: Jane Doe</p>
            <p>Email: jane@example.com</p>
            <p>Member Since: Jan 2024</p>
          </div>

          <div style={infoCard}>
            <h3 style={cardTitle}>Progress</h3>
            <p>Posts: 8</p>
            <p>Likes Received: 124</p>
            <p>Comments: 42</p>
          </div>

          <div style={infoCard}>
            <h3 style={cardTitle}>Documents</h3>
            <button style={docButton}>📄 My Posts</button>
            <button style={docButton}>📥 Downloads</button>
          </div>
        </section>

        <section style={postsSection}>
          <h2 style={sectionHeader}>Your Recent Posts</h2>
          <div style={postCard}>How I set up my photo studio at home</div>
          <div style={postCard}>Learning React: Day 12 Update</div>
          <div style={postCard}>Quick JavaScript tips!</div>
        </section>
      </main>
    </div>
  );
};

// Styles
const pageWrapper = {
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  fontFamily: "sans-serif",
};

const sidebar = {
  width: "240px",
  backgroundColor: "#1e293b",
  color: "#fff",
  padding: "24px 16px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const logo = {
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "32px",
};

const menuItem = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
  padding: "8px 12px",
  borderRadius: "6px",
  backgroundColor: "#334155",
};

const logoutItem = {
  ...menuItem,
  marginTop: "auto",
  backgroundColor: "#ef4444",
};

const icon = {
  fontSize: "16px",
};

const mainContent = {
  flex: 1,
  padding: "32px",
  backgroundColor: "#f1f5f9",
};

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
};

const pageTitle = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#1e293b",
};

const addButton = {
  padding: "10px 16px",
  backgroundColor: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const infoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "20px",
  marginBottom: "32px",
};

const infoCard = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const cardTitle = {
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "12px",
  color: "#1e40af",
};

const docButton = {
  padding: "8px 12px",
  marginTop: "8px",
  display: "block",
  backgroundColor: "#e2e8f0",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const postsSection = {
  marginTop: "24px",
};

const sectionHeader = {
  fontSize: "22px",
  marginBottom: "16px",
  color: "#0f172a",
};

const postCard = {
  padding: "16px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  marginBottom: "12px",
};

export default UserDashboard;