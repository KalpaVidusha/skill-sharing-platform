import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        password
      };

      if (identifier.includes('@')) {
        payload.email = identifier;
      } else {
        payload.username = identifier;
      }

      const response = await axios.post("http://localhost:8081/api/users/login", payload, {
        withCredentials: true
      });

      const { userId, username, email } = response.data;

      // Store user info in localStorage
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      localStorage.setItem("isLoggedIn", "true");

      // Always redirect to dashboard after login
      navigate("/userdashboard");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, ...(loaded ? fadeIn : hiddenStyle) }}>
        <h2 style={titleStyle}>Welcome Back</h2>
        <p style={subtitleStyle}>Login to continue to SkillSphere</p>

        {error && <p style={errorStyle}>{error}</p>}

        <form onSubmit={handleLogin} style={formStyle}>
          <input
            type="text"
            placeholder="Username or Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" style={loginBtn}>Login</button>
        </form>
      </div>
    </div>
  );
};

// 🎨 Styling
const containerStyle = {
  height: "100vh",
  width: "100vw",
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url("https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=1470&q=80")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "sans-serif",
};

const cardStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  borderRadius: "20px",
  padding: "40px",
  maxWidth: "400px",
  width: "100%",
  color: "#ffffff",
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  textAlign: "center",
  backdropFilter: "blur(10px)",
  transition: "opacity 1s ease, transform 1s ease",
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
  fontSize: "28px",
  fontWeight: "bold",
  marginBottom: "8px",
};

const subtitleStyle = {
  color: "#cbd5e1",
  marginBottom: "24px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #4a5568",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: "#ffffff",
  fontSize: "16px",
};

const loginBtn = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#4CAF50",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
};

const errorStyle = {
  color: "#ff6b6b",
  backgroundColor: "rgba(255, 107, 107, 0.1)",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "16px",
};

export default Login;