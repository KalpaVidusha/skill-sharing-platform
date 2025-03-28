import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8081/api/login", {
        email,
        password,
      });
      alert("Login successful!");
      console.log(response.data);
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      alert("Login failed. Please check your email and password.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>
      <div style={formWrapperStyle}>
        <h2 style={titleStyle}>Welcome Back 👋</h2>
        <form onSubmit={handleLogin} style={formStyle}>
          <input
            type="email"
            placeholder="Email"
            style={inputStyle}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            style={inputStyle}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" style={buttonStyle}>Login</button>
        </form>
      </div>
    </div>
  );
};

// 🎨 Dark Background Image
const containerStyle = {
  minHeight: "100vh",
  backgroundImage: `url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
};

const overlayStyle = {
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  zIndex: 0,
};

const formWrapperStyle = {
  position: "relative",
  zIndex: 1,
  backgroundColor: "#1f2937", // dark gray
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.5)",
  width: "100%",
  maxWidth: "400px",
  textAlign: "center",
  color: "#f3f4f6",
};

const titleStyle = {
  marginBottom: "24px",
  fontSize: "26px",
  color: "#60a5fa", // light blue
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "6px",
  border: "none",
  fontSize: "16px",
  backgroundColor: "#374151", // darker gray
  color: "#fff",
  outline: "none",
};

const buttonStyle = {
  padding: "12px",
  backgroundColor: "#3b82f6", // blue
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
  transition: "background 0.3s",
};

export default Login;
