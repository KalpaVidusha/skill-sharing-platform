import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaUser,
  FaSignOutAlt,
  FaChartLine,
  FaFileAlt,
  FaComments,
  FaCompass,
} from "react-icons/fa";

const UserDashboard = () => {
  const [animate, setAnimate] = useState(false);
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);

    // Inject rain animation CSS
    const style = document.createElement("style");
    style.innerHTML = `
      .rain {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
      }

      .raindrop {
        position: absolute;
        width: 2px;
        height: 20px;
        background: rgba(255, 255, 255, 0.2);
        animation: fall linear infinite;
      }

      @keyframes fall {
        0% {
          transform: translateY(-100px);
        }
        100% {
          transform: translateY(100vh);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const createRain = () => {
    const drops = [];
    for (let i = 0; i < 100; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 1 + 0.5;
      drops.push(
        <div
          key={i}
          className="raindrop"
          style={{
            left: `${left}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />
      );
    }
    return drops;
  };

  const getButtonStyle = (baseStyle, id) => {
    if (hovered === id) {
      return {
        ...baseStyle,
        backgroundColor: "#ffffff",
        color: "#1e293b",
      };
    }
    return baseStyle;
  };

  // Handler for add post navigation
  const handleAddPost = () => {
    navigate("/add-post");
  };

  return (
    <div style={styles.pageWrapper}>
      <div className="rain">{createRain()}</div>

      <aside style={{ ...styles.sidebar, zIndex: 1 }}>
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
            style={getButtonStyle(styles.menuButton, id)}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            onClick={onClick}
          >
            {icon} {label}
          </button>
        ))}

        <button
          style={getButtonStyle(styles.logoutButton, "logout")}
          onClick={() => {
            localStorage.removeItem("userId");
            localStorage.removeItem("isLoggedIn");
            alert("Logged out successfully.");
            navigate("/login");
          }}
          onMouseEnter={() => setHovered("logout")}
          onMouseLeave={() => setHovered(null)}
        >
          <FaSignOutAlt style={styles.icon} /> Logout
        </button>
      </aside>

      <main
        style={{
          ...styles.mainContent,
          opacity: animate ? 1 : 0,
          transform: animate ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s ease",
          zIndex: 1,
        }}
      >
        <header style={styles.topBar}>
          <h1 style={styles.pageTitle}>Welcome, Jane 👋</h1>
          <button
            style={getButtonStyle(styles.addButton, "mainAddPost")}
            onClick={handleAddPost}
            onMouseEnter={() => setHovered("mainAddPost")}
            onMouseLeave={() => setHovered(null)}
          >
            <FaPlus /> Add Post
          </button>
        </header>

        <section style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>Your Info</h3>
            <p>Name: Jane Doe</p>
            <p>Email: jane@example.com</p>
            <p>Member Since: Jan 2024</p>
          </div>
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>Progress</h3>
            <p>Posts: 8</p>
            <p>Likes Received: 124</p>
            <p>Comments: 42</p>
          </div>
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>Documents</h3>
            <button
              style={getButtonStyle(styles.docButton, "doc1")}
              onMouseEnter={() => setHovered("doc1")}
              onMouseLeave={() => setHovered(null)}
            >
              📄 My Posts
            </button>
            <button
              style={getButtonStyle(styles.docButton, "doc2")}
              onMouseEnter={() => setHovered("doc2")}
              onMouseLeave={() => setHovered(null)}
            >
              📥 Downloads
            </button>
          </div>
        </section>

        <section style={styles.postsSection}>
          <h2 style={styles.sectionHeader}>Latest Contributions</h2>
          <div style={styles.postRow}>
            <div style={styles.postCard}>
              🚀 <strong>Photo Studio Tips:</strong> How I set up my photo studio at home
            </div>
            <div style={styles.postCard}>
              📘 <strong>React Journey:</strong> Learning React: Day 12 Update
            </div>
            <div style={styles.postCard}>
              ⚡ <strong>JS Snippets:</strong> Quick JavaScript tips!
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const styles = {
  pageWrapper: {
    position: "relative",
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
    backgroundColor: "#0f172a",
    color: "#f1f5f9",
    overflow: "hidden",
  },
  sidebar: {
    width: "240px",
    background: "linear-gradient(180deg, #1f2937 0%, #0f172a 100%)",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "2px 0 6px rgba(0, 0, 0, 0.4)",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "32px",
    color: "#60a5fa",
  },
  menuButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "8px",
    backgroundColor: "#1e293b",
    color: "#cbd5e1",
    cursor: "pointer",
    border: "none",
    fontSize: "15px",
    transition: "all 0.3s ease",
  },
  logoutButton: {
    marginTop: "auto",
    backgroundColor: "#dc2626",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
    fontSize: "15px",
    transition: "all 0.3s ease",
  },
  icon: {
    fontSize: "16px",
  },
  mainContent: {
    flex: 1,
    padding: "40px",
    backgroundColor: "transparent",
    position: "relative",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#f9fafb",
  },
  addButton: {
    padding: "10px 16px",
    background: "linear-gradient(to right, #3b82f6, #6366f1)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    transition: "all 0.3s ease",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },
  infoCard: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "12px",
    color: "#60a5fa",
  },
  docButton: {
    padding: "10px 12px",
    marginTop: "8px",
    display: "block",
    backgroundColor: "#334155",
    border: "none",
    borderRadius: "6px",
    color: "#f1f5f9",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  postsSection: {
    marginTop: "32px",
  },
  sectionHeader: {
    fontSize: "22px",
    fontWeight: "500",
    color: "#e2e8f0",
    marginBottom: "16px",
  },
  postRow: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  postCard: {
    flex: "1 1 30%",
    padding: "16px",
    backgroundColor: "#1e293b",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    cursor: "pointer",
    transition: "transform 0.3s ease, background-color 0.3s ease",
  },
};

export default UserDashboard;