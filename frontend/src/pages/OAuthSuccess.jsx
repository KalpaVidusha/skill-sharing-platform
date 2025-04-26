import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
    
    // Show success message and navigate to dashboard
    toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication successful!`);
    navigate('/userdashboard');
  }, [navigate, location]);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Authentication Successful! 🎉</h1>
        <p style={subtitleStyle}>
          You have successfully authenticated with your account.
        </p>
        <p style={messageStyle}>
          Redirecting to your dashboard...
        </p>
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

export default OAuthSuccess; 