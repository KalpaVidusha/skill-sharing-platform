import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8081/api/login", { email, password });
      alert("Login successful!");
      navigate("/userdashboard");
    } catch (err) {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, ...(loaded ? fadeIn : hiddenStyle) }}>
        <h2 style={titleStyle}>Welcome Back</h2>
        <p style={subtitleStyle}>Login to continue to SkillSphere</p>

        <form onSubmit={handleLogin} style={formStyle}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <p style={dividerStyle}>or continue with</p>

        <div style={socials}>
          <button style={socialBtn}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={iconStyle} />
            Google
          </button>
          <button style={socialBtn}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" style={iconStyle} />
            Apple
          </button>
        </div>
      </div>
    </div>
  );
};

// 🎨 Styles

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

const dividerStyle = {
  margin: "20px 0 10px",
  fontSize: "13px",
  color: "#aaa",
};

const socials = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
};

const socialBtn = {
  backgroundColor: "#0f172a",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "14px",
  cursor: "pointer",
};

const iconStyle = {
  width: "20px",
  height: "20px",
};

export default Login;
