import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{ padding: "10px", background: "#333", color: "#fff" }}>
      <Link to="/" style={{ marginRight: "10px", color: "white" }}>Home</Link>
      <Link to="/login" style={{ marginRight: "10px", color: "white" }}>Login</Link>
      <Link to="/signup" style={{ color: "white" }}>Signup</Link>
    </nav>
  );
};

export default Navbar;
