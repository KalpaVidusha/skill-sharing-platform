import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Home = () => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      {/* Header */}
      <header style={{ ...styles.header, ...(fadeIn ? styles.fadeIn : styles.hidden) }}>
        <h1 style={styles.logo}>SkillSphere</h1>
        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/login" style={styles.navLink}><FaSignInAlt style={styles.icon} /> Login</Link>
          <Link to="/signup" style={styles.navLink}><FaUserPlus style={styles.icon} /> Register</Link>
        </nav>
      </header>

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
  header: {
    position: 'relative',
    zIndex: 1,
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#2563eb'
  },
  nav: {
    display: 'flex',
    gap: '16px'
  },
  navLink: {
    color: '#1e3a8a',
    fontWeight: '500',
    textDecoration: 'none',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.3s ease',
  },
  icon: {
    marginRight: '6px'
  },
  hero: {
    position: 'relative',
    zIndex: 1,
    padding: '120px 20px 60px',
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
