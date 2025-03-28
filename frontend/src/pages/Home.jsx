// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #ffffff, #e0f2ff)', color: '#1f2937' }}>
      {/* Header / Navbar */}
      <header style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>SkillSphere</h1>
        <nav>
          <Link to="/" style={navLink}>Home</Link>
          <Link to="/login" style={navLink}>Login</Link>
          <Link to="/register" style={navLink}>Register</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px', color: '#1d4ed8' }}>
          Welcome to SkillSphere
        </h2>
        <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto 32px', color: '#4b5563' }}>
          A platform where you can share, explore, and track skills — from coding to cooking, photography to DIY.
        </p>
        <Link to="/posts" style={buttonStyle}>
          Explore Posts
        </Link>
      </section>

      {/* Features Section */}
      <section style={{ backgroundColor: '#ffffff', padding: '64px 20px' }}>
        <div style={featuresGrid}>
          <div style={featureBox}>
            <h3 style={featureTitle}>Share Skills</h3>
            <p style={featureText}>Upload photos, videos, and write descriptions to teach others your talents.</p>
          </div>
          <div style={featureBox}>
            <h3 style={featureTitle}>Track Progress</h3>
            <p style={featureText}>Document your learning journey and stay motivated with visual updates.</p>
          </div>
          <div style={featureBox}>
            <h3 style={featureTitle}>Connect & Learn</h3>
            <p style={featureText}>Follow other users, like posts, and engage in a community of learners.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#2563eb', color: '#ffffff', textAlign: 'center', padding: '24px' }}>
        <p>© 2025 SkillSphere. Built with ❤️ at SLIIT</p>
      </footer>
    </div>
  );
};

const navLink = {
  marginLeft: '16px',
  color: '#4b5563',
  textDecoration: 'none',
  fontWeight: '500',
};

const buttonStyle = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '9999px',
  textDecoration: 'none',
  fontWeight: '600',
};

const featuresGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '40px',
  textAlign: 'center',
};

const featureBox = {
  padding: '20px',
};

const featureTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#2563eb',
  marginBottom: '8px',
};

const featureText = {
  color: '#4b5563',
};

export default Home;
