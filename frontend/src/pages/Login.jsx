import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      const payload = { password };
      if (identifier.includes("@")) payload.email = identifier;
      else payload.username = identifier;

      const response = await axios.post("http://localhost:8081/api/users/login", payload, {
        withCredentials: true
      });

      const { userId, username, email } = response.data;
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      localStorage.setItem("isLoggedIn", "true");

      toast.success("Login successful 🎉");
      setTimeout(() => navigate("/userdashboard"), 1200);
    } catch (err) {
      toast.error("Login failed. Check your credentials.");
    }
  };

  return (
    <div style={containerStyle}>
      <ToastContainer position="top-center" />
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
        </form>
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

export default Login;
