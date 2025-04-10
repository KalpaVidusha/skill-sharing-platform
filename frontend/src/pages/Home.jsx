// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Home = () => {
  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>

      {/* Header */}
      <header style={headerStyle}>
        
        <h1 style={logoStyle}>SkillSphere</h1>
        <nav style={navStyle}>
          <Link to="/" style={navLink}>Home</Link>
          <Link to="/login" style={navLink}>
            <FaSignInAlt style={iconStyle} /> Login
          </Link>
          <Link to="/signup" style={navLink}>
            <FaUserPlus style={iconStyle} /> Register
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={heroSection}>
        <h2 style={heroTitle}>Welcome to SkillSphere</h2>
        <p style={heroText}>
          A dark, modern space to share and track skills — from coding to cooking, photography to DIY.
        </p>
        <Link to="/posts" style={buttonStyle}>
          Explore Posts
        </Link>
      </section>

      {/* Features Section */}
      <section style={featuresSection}>
        <div style={featuresGrid}>
          <div style={featureBox}>
            <h3 style={featureTitle}>Share Skills</h3>
            <p style={featureText}>Upload media and descriptions to showcase your talents.</p>
          </div>
          <div style={featureBox}>
            <h3 style={featureTitle}>Track Progress</h3>
            <p style={featureText}>Log your learning milestones and stay consistent.</p>
          </div>
          <div style={featureBox}>
            <h3 style={featureTitle}>Connect & Learn</h3>
            <p style={featureText}>Engage with others, give feedback, and grow together.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <p>© 2025 SkillSphere. Built with ❤️ at SLIIT</p>
      </footer>
    </div>
  );
};

// 🌌 Styles
const containerStyle = {
  minHeight: "100vh",
  backgroundImage: `url("https://images.unsplash.com/photo-1526045612212-70caf35c14df")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  color: "#f3f4f6",
};

const overlayStyle = {
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  zIndex: 0,
};

const headerStyle = {
  position: "relative",
  zIndex: 1,
  padding: "16px 32px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.6)",
  borderBottom: "1px solid #333",
};

const navStyle = {
  display: "flex",
  alignItems: "center",
};

const logoStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#60a5fa",
};

const navLink = {
  marginLeft: "16px",
  color: "#d1d5db",
  textDecoration: "none",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
};

const iconStyle = {
  marginRight: "6px",
};

const heroSection = {
  position: "relative",
  zIndex: 1,
  textAlign: "center",
  padding: "100px 20px",
};

const heroTitle = {
  fontSize: "40px",
  fontWeight: "800",
  marginBottom: "16px",
  color: "#93c5fd",
};

const heroText = {
  fontSize: "18px",
  maxWidth: "600px",
  margin: "0 auto 32px",
  color: "#e5e7eb",
};

const buttonStyle = {
  backgroundColor: "#3b82f6",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "16px",
  border: "none",
  cursor: "pointer",
};

const featuresSection = {
  backgroundColor: "rgba(17, 24, 39, 0.9)",
  padding: "64px 20px",
  position: "relative",
  zIndex: 1,
};

const featuresGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "40px",
  textAlign: "center",
};

const featureBox = {
  padding: "20px",
};

const featureTitle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#60a5fa",
  marginBottom: "8px",
};

const featureText = {
  color: "#d1d5db",
};

const footerStyle = {
  position: "relative",
  zIndex: 1,
  backgroundColor: "#1f2937",
  color: "#9ca3af",
  textAlign: "center",
  padding: "24px",
  borderTop: "1px solid #374151",
};

export default Home;
