import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const Home = () => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      {/* Navbar with higher z-index to ensure it's above the overlay */}
      <div style={styles.navWrapper}>
        <Navbar />
      </div>

      {/* Hero */}
      <section style={{ ...styles.hero, ...(fadeIn ? styles.fadeIn : styles.hidden) }}>
        <h2 style={styles.heroTitle}>Unleash Your Skills</h2>
        <p style={styles.heroText}>
          A sleek, modern space to share knowledge, track growth, and connect with creators like you.
        </p>
        <Link to="/posts" style={styles.button}>Explore Posts</Link>
      </section>

      {/* Features */}
      <section style={{ ...styles.features, ...(fadeIn ? styles.fadeIn : styles.hidden) }}>
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📤 Share Skills</h3>
            <p style={styles.cardText}>Upload content and show the world what you know.</p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📈 Track Progress</h3>
            <p style={styles.cardText}>Log milestones, review achievements, and stay motivated.</p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🤝 Connect & Grow</h3>
            <p style={styles.cardText}>Collaborate with learners and mentors from all around the world.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Inline CSS
const styles = {
  container: {
    minHeight: '100vh',
    backgroundImage: `url("https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1500&q=80")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    color: '#1e3a8a',
    fontFamily: 'Poppins, sans-serif',
    transition: 'all 0.8s ease'
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 0
  },
  navWrapper: {
    position: 'relative',
    zIndex: 10 // Higher z-index to ensure it's above the overlay
  },
  hero: {
    position: 'relative',
    zIndex: 1,
    padding: '160px 20px 60px',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '44px',
    fontWeight: '800',
    color: '#1e3a8a',
    marginBottom: '20px'
  },
  heroText: {
    fontSize: '18px',
    color: '#334155',
    maxWidth: '600px',
    margin: '0 auto 30px',
    lineHeight: '1.6'
  },
  button: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '14px 28px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '16px',
    textDecoration: 'none',
    boxShadow: '0 8px 20px rgba(37,99,235,0.2)',
    transition: 'background 0.3s ease',
  },
  features: {
    position: 'relative',
    zIndex: 1,
    padding: '80px 20px 60px',
    background: 'linear-gradient(to bottom, #eff6ff, #ffffff)',
    color: '#1e3a8a',
    textAlign: 'center'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '32px',
    maxWidth: '1100px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s ease',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: '10px'
  },
  cardText: {
    color: '#475569',
    fontSize: '15px',
    lineHeight: '1.6'
  },
  fadeIn: {
    opacity: 1,
    transform: 'translateY(0)',
    transition: 'all 0.8s ease'
  },
  hidden: {
    opacity: 0,
    transform: 'translateY(30px)'
  }
};

export default Home;
