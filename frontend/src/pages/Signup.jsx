import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiService from "../services/api";
import Navbar from "../components/Navbar";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [skills, setSkills] = useState("");
  const [agree, setAgree] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!agree) {
      toast.warning("Please agree to the Terms & Conditions.");
      return;
    }

    // Validate password length before sending to server
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const userData = {
        username,
        email,
        password,
        firstName,
        lastName,
        skills: skills.split(",").map((skill) => skill.trim()),
        role: ["user"]
      };
      
      const response = await apiService.signup(userData);
      
      toast.success("Account created successfully! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Signup error:", err);
      if (err.message && (
          err.message.includes("Username is already taken") || 
          err.message.includes("Email is already in use")
      )) {
        toast.error(err.message);
      } else if (err.data && err.data.message) {
        toast.error(err.data.message);
      } else if (err.status === 405) {
        toast.error("The signup endpoint is not properly configured. Please check your API routes.");
      } else {
        toast.error("Signup failed. Please ensure your password is 6-40 characters long and all fields are valid.");
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{...containerStyle, paddingTop: "20px"}}>
        <div style={{ ...cardStyle, ...(loaded ? fadeIn : hiddenStyle) }}>
          <h2 style={titleStyle}>Create Your Account</h2>
          <p style={subtitleStyle}>Join <span style={{ color: "#1976d2", fontWeight: 600 }}>SkillSphere</span> today!</p>

          <form onSubmit={handleSignup} style={formStyle}>
            <div style={{ display: "flex", gap: "16px" }}>
              <input 
                type="text" 
                placeholder="First Name" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={inputStyle}
                required
              />
              <input 
                type="text" 
                placeholder="Last Name" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              required
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
            <input 
              type="password" 
              placeholder="Password (min 6 characters)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
            <input 
              type="text" 
              placeholder="Skills (comma-separated)" 
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              style={inputStyle}
              required
            />
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
              <input 
                type="checkbox" 
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                id="terms"
                style={{ width: "16px", height: "16px" }}
              />
              <label htmlFor="terms" style={{ color: "#607d8b", fontSize: "14px" }}>
                I agree to the Terms & Conditions
              </label>
            </div>
            
            <button 
              type="submit"
              style={{
                ...loginBtn,
                backgroundColor: agree ? "#2196f3" : "#b0bec5",
                cursor: agree ? "pointer" : "not-allowed",
              }}
              disabled={!agree}
            >
              Create Account
            </button>
          </form>
          
          <div style={{ marginTop: "25px", textAlign: "center" }}>
            <p style={{ color: "#607d8b", marginBottom: "15px", fontSize: "14px" }}>
              Already have an account?
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{ 
                backgroundColor: "transparent",
                border: "1px solid #2196f3",
                padding: "10px 20px",
                borderRadius: "10px",
                color: "#2196f3",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              Log In
            </button>
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
};

const cardStyle = {
  background: "rgba(255, 255, 255, 0.92)",
  borderRadius: "16px",
  padding: "40px",
  width: "90%",
  maxWidth: "500px",
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

export default Signup;
