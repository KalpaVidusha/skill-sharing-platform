import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // Single field for username or email
  const [password, setPassword] = useState("");
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Determine if the identifier is an email or username
      const isEmail = identifier.includes('@');
      
      const payload = {
        password
      };
      
      // Set either email or username based on the input
      if (isEmail) {
        payload.email = identifier;
        payload.username = "";
      } else {
        payload.username = identifier;
        payload.email = "";
      }

      const response = await axios.post("http://localhost:8081/api/users/login", payload);

      const { userId, username: loggedInUsername, email: loggedInEmail } = response.data;

      alert("Login successful!");

      // Store user info in localStorage
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", loggedInUsername);
      localStorage.setItem("email", loggedInEmail);

      navigate("/userdashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed. Please check your username/email or password.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, ...(loaded ? fadeIn : hiddenStyle) }}>
        <h2 style={titleStyle}>Welcome Back</h2>
        <p style={subtitleStyle}>Login to continue to SkillSphere</p>

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
  border: "none",
  backgroundColor: "#1e293b",
  color: "#fff",
  fontSize: "14px",
};

const loginBtn = {
  backgroundColor: "#3b82f6",
  color: "#fff",
  padding: "12px",
  fontWeight: "bold",
  fontSize: "16px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
};

export default Login;