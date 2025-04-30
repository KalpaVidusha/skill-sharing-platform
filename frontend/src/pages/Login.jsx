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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className={`w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="p-8">
          <div className="text-center mb-8">
            {/* Replace the icon with your logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                {/* Modern gradient sphere with depth */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 rounded-full shadow-lg flex items-center justify-center transform rotate-6">
                    {/* Inner glow effect */}
                    <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
                    {/* Highlight */}
                    <div className="absolute top-1 right-2 w-3 h-3 bg-white/70 rounded-full blur-[1px]"></div>
                    
                    {/* Abstract skill paths */}
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                
                {/* Text logo with improved typography */}
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent tracking-tight">
                  SkillSphere
                </span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your <span className="font-medium text-blue-600">SkillSphere</span> account
            </p>
          </div>
  
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                  Email or username
                </label>
                <div className="relative">
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
  
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
  
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Sign in
                </button>
              </div>
            </form>
  
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
  
              <div className="mt-6 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  onMouseEnter={() => setGoogleHover(true)}
                  onMouseLeave={() => setGoogleHover(false)}
                  className={`w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${googleHover ? 'transform -translate-y-0.5 shadow-md' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </div>
                </button>
              </div>
            </div>
  
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </a>
              </p>
            </div>
          </div>
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
