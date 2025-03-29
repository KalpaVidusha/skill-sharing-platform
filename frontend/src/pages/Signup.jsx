import { useState, useEffect } from "react";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!agree) {
      alert("Please agree to the Terms & Conditions.");
      return;
    }

    try {
      await axios.post("http://localhost:8081/api/signup", {
        name,
        email,
        password,
      });
      alert("Account created successfully!");
    } catch (err) {
      alert("Signup failed. Try again.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, ...(loaded ? fadeIn : hiddenStyle) }}>
        <h2 style={titleStyle}>Create Your Account</h2>
        <p style={subtitleStyle}>Join SkillSphere and start learning today</p>

        <form onSubmit={handleSignup} style={formStyle}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
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

          <div style={checkboxRow}>
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              style={{ marginRight: "8px" }}
            />
            <span style={{ fontSize: "14px", color: "#e2e8f0" }}>
              I agree to the <span style={link}>Terms & Conditions</span>
            </span>
          </div>

          <button type="submit" style={loginBtn}>Sign Up</button>
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

// 🎨 Shared Styles (matching your Login page)

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

const checkboxRow = {
  display: "flex",
  alignItems: "center",
  fontSize: "14px",
  marginTop: "4px",
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

const link = {
  color: "#60a5fa",
  cursor: "pointer",
};

export default Signup;
