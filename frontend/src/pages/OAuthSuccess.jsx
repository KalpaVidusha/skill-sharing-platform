import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    // Get params from URL query params
    const params = new URLSearchParams(location.search);
    const provider = params.get('provider') || 'OAuth';
    const token = params.get('token');
    const userId = params.get('userId');
    const username = params.get('username');
    const email = params.get('email');
    
    // Save user data to localStorage if present
    if (token && userId && username) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username);
      if (email) localStorage.setItem("email", email);
      localStorage.setItem("isLoggedIn", "true");
      
      console.log("User data saved to localStorage:", { token, userId, username, email });
    } else {
      console.warn("Missing user data in URL parameters");
    }
    
    // Show success message
    toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication successful!`);
    
    // Redirect to dashboard after countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/userdashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate, location]);

  return (
    <div style={containerStyle}>
      <ToastContainer position="top-center" />
      <div style={cardStyle}>
        <h1 style={titleStyle}>Authentication Successful! 🎉</h1>
        <p style={subtitleStyle}>
          You have successfully authenticated with your account.
        </p>
        <p style={messageStyle}>
          Redirecting to your dashboard in <span style={countdownStyle}>{countdown}</span> seconds...
        </p>
        <button
          onClick={() => navigate('/userdashboard')}
          style={buttonStyle}
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  height: '100vh',
  width: '100vw',
  backgroundImage: `url("https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1500&q=80")`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: "'Poppins', sans-serif",
};

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.92)',
  borderRadius: '16px',
  padding: '40px',
  width: '90%',
  maxWidth: '500px',
  textAlign: 'center',
  boxShadow: '0 20px 50px rgba(33, 150, 243, 0.25)',
  backdropFilter: 'blur(10px)',
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#1565c0',
  marginBottom: '15px',
};

const subtitleStyle = {
  fontSize: '18px',
  color: '#607d8b',
  marginBottom: '20px',
};

const messageStyle = {
  fontSize: '16px',
  color: '#0d47a1',
  margin: '20px 0',
};

const countdownStyle = {
  fontWeight: 'bold',
  fontSize: '20px',
  color: '#2196f3',
};

const buttonStyle = {
  padding: '14px 24px',
  borderRadius: '10px',
  border: 'none',
  backgroundColor: '#2196f3',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  marginTop: '10px',
};

export default OAuthSuccess; 