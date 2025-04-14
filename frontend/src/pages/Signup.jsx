import { useState, useEffect } from "react";
import axios from "axios";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [skills, setSkills] = useState("");
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
      const response = await axios.post("http://localhost:8081/api/users", {
        username,
        email,
        password,
        firstName,
        lastName,
        skills: skills.split(",").map((skill) => skill.trim()),
      });
      alert("Account created successfully!");
      console.log(response.data);
    } catch (err) {
      console.error(err);
      alert("Signup failed. Try again.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, ...(loaded ? fadeIn : hiddenStyle) }}>
        <h2 style={titleStyle}>Create Your Account</h2>
        <p style={subtitleStyle}>Join <span style={{ color: "#1976d2", fontWeight: 600 }}>SkillSphere</span> today!</p>

        <form onSubmit={handleSignup} style={formStyle}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Skills (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} style={inputStyle} />

          <div style={checkboxRow}>
            <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} style={{ marginRight: "8px" }} />
            <span style={{ fontSize: "14px", color: "#444" }}>
              I agree to the <span style={linkStyle}>Terms & Conditions</span>
            </span>
          </div>

          <button type="submit" style={signupBtn}>Sign Up</button>
        </form>

        <p style={dividerStyle}>or sign up with</p>

        <div style={socialRow}>
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

// 🎨 Inline Styling
const containerStyle = {
  height: "100vh",
  width: "100vw",
  backgroundImage: `url("https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1470&q=80")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "'Segoe UI', sans-serif",
};

const cardStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.94)",
  borderRadius: "20px",
  padding: "40px",
  maxWidth: "420px",
  width: "90%",
  color: "#0f172a",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
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
  color: "#1976d2"
};

const subtitleStyle = {
  color: "#374151",
  marginBottom: "24px",
  fontSize: "14px"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#f0f9ff",
  color: "#0f172a",
  fontSize: "14px",
  outline: "none",
};

const checkboxRow = {
  display: "flex",
  alignItems: "center",
  fontSize: "14px",
  marginTop: "4px",
};

const signupBtn = {
  backgroundColor: "#1d4ed8",
  color: "#fff",
  padding: "12px",
  fontWeight: "bold",
  fontSize: "16px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  transition: "background 0.3s ease"
};

const dividerStyle = {
  margin: "20px 0 10px",
  fontSize: "13px",
  color: "#6b7280",
};

const socialRow = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
};

const socialBtn = {
  backgroundColor: "#f1f5f9",
  color: "#1f2937",
  border: "1px solid #d1d5db",
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

const linkStyle = {
  color: "#2563eb",
  textDecoration: "underline",
  cursor: "pointer",
};

export default Signup;
