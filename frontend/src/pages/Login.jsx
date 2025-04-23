import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import apiService from "../services/api";
import Navbar from "../components/Navbar";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoaded(true);
    
    // Check if there's an error in the URL from failed OAuth
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    if (error) {
      toast.error("Google authentication failed. Please try again.");
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      const response = await apiService.login(identifier, password);
      
      // JWT authentication successful - apiService already stores token and user info
      toast.success("Login successful 🎉");
      
      // Notify components about the auth state change
      window.dispatchEvent(new Event('authStateChanged'));
      
      setTimeout(() => navigate("/userdashboard"), 1200);
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle specific error cases
      if (err.status === 401) {
        toast.error("Invalid username or password");
      } else if (err.status === 404) {
        toast.error("User not found");
      } else if (err.status === 405) {
        toast.error("The login endpoint is not properly configured");
      } else if (err.message) {
        toast.error(err.message);
      } else {
        toast.error("Login failed. Please try again later.");
      }
    }
  };
  
  // Server-side Google OAuth flow
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8081/api/auth/google';
  };

  return (
      <div>
        <Navbar />
          <div style={containerStyle}>
            <div style={{ ...cardStyle, ...(loaded ? fadeIn : hiddenStyle) }}>
            <h2 style={titleStyle}>👋 Welcome Back</h2>
            <p style={subtitleStyle}>
              Log in to your <span style={{ color: "#2196f3", fontWeight: "600" }}>SkillSphere</span> account
            </p>

            <form onSubmit={handleLogin} style={formStyle}>
              <input
                type="text"
                placeholder="Username or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                style={inputStyle}
              />
              <div style={passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: "40px" }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeIcon}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button type="submit" style={loginBtn}>✨ Login</button>
              
              <div style={dividerStyle}>
                <span style={dividerLineStyle}></span>
                <span style={dividerTextStyle}>OR</span>
                <span style={dividerLineStyle}></span>
              </div>
              
              {/* Google OAuth button */}
              <button 
                type="button" 
                onClick={handleGoogleLogin}
                onMouseEnter={() => setGoogleHover(true)}
                onMouseLeave={() => setGoogleHover(false)}
                style={{
                  ...googleBtn,
                  backgroundColor: googleHover ? '#3367d6' : '#4285F4',
                  transform: googleHover ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: googleHover 
                    ? '0 8px 16px rgba(66, 133, 244, 0.3)' 
                    : '0 4px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={googleIconWrapper}>
                  <svg style={googleIcon} viewBox="0 0 24 24">
                    <path 
                      fill="#4285F4" 
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
                    />
                    <path 
                      fill="#34A853" 
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
                    />
                    <path 
                      fill="#FBBC05" 
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
                    />
                    <path 
                      fill="#EA4335" 
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
                    />
                  </svg>
                </div>
                <span style={googleText}>Sign in with Google</span>
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};

// Styles
const containerStyle = {
  height: "100vh",
  width: "100vw",
  backgroundImage: `url("https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1500&q=80")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "'Poppins', sans-serif",
  paddingTop: "20px",
};

const cardStyle = {
  background: "rgba(255, 255, 255, 0.92)",
  borderRadius: "16px",
  padding: "40px",
  width: "90%",
  maxWidth: "420px",
  color: "#0d47a1",
  boxShadow: "0 20px 50px rgba(33, 150, 243, 0.25)",
  textAlign: "center",
  backdropFilter: "blur(10px)",
  transition: "opacity 0.8s ease, transform 0.8s ease",
};

const hiddenStyle = {
  opacity: 0,
  transform: "translateY(40px)",
};

const fadeIn = {
  opacity: 1,
  transform: "translateY(0)",
};

const titleStyle = {
  fontSize: "30px",
  fontWeight: "700",
  marginBottom: "10px",
  color: "#1565c0"
};

const subtitleStyle = {
  color: "#607d8b",
  marginBottom: "25px",
  fontSize: "14px"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const inputStyle = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: "10px",
  border: "1px solid #bbdefb",
  backgroundColor: "#e3f2fd",
  color: "#0d47a1",
  fontSize: "15px",
  outline: "none",
  transition: "border 0.3s ease",
};

const passwordContainer = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const eyeIcon = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: "18px",
  color: "#1976d2",
  cursor: "pointer",
};

const loginBtn = {
  padding: "14px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#2196f3",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
};

const dividerStyle = {
  display: "flex",
  alignItems: "center",
  margin: "10px 0",
};

const dividerLineStyle = {
  flex: 1,
  height: "1px",
  backgroundColor: "#bbdefb",
};

const dividerTextStyle = {
  margin: "0 10px",
  color: "#607d8b",
  fontSize: "14px",
};

const googleBtn = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: '50px',
  backgroundColor: '#4285F4',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  padding: 0,
  overflow: 'hidden'
};

const googleIconWrapper = {
  width: '48px',
  height: '48px',
  backgroundColor: 'white',
  borderRadius: '10px 0 0 10px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const googleIcon = {
  width: '24px',
  height: '24px'
};

const googleText = {
  flex: 1,
  color: 'white',
  fontSize: '16px',
  fontWeight: '500',
  textAlign: 'center'
};

export default Login;
