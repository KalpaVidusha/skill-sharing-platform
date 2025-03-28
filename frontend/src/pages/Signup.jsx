import { useState } from "react";
import axios from "axios";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8081/api/signup", { email, password });
      alert("Signup successful! You can now log in.");
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>
      <div style={formWrapperStyle}>
        <h2 style={titleStyle}>Create Your Account</h2>
        <form onSubmit={handleSignup} style={formStyle}>
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
          <button type="submit" style={buttonStyle}>Sign Up</button>
        </form>
      </div>
    </div>
  );
};

// 🌌 Background + Overlay
const containerStyle = {
  minHeight: "100vh",
  backgroundImage: `url("https://images.unsplash.com/photo-1503264116251-35a269479413")`,
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
  backgroundColor: "rgba(0, 0, 0, 0.7)",
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
  color: "#60a5fa",
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
  backgroundColor: "#374151", // darker input bg
  color: "#fff",
  outline: "none",
};

const buttonStyle = {
  padding: "12px",
  backgroundColor: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
  transition: "background 0.3s",
};

export default Signup;
