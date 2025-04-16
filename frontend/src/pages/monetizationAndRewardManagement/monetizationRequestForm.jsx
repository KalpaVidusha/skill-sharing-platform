import { useState } from "react";
import axios from "axios";
import "../../styles/monetization.css"; // 👈 Import the CSS

const MonetizationForm = () => {
  const [userId, setUserId] = useState("");
  const [contentType, setContentType] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("");
  const [expectedEarnings, setExpectedEarnings] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8081/api/monetization", {
        userId,
        contentType,
        description,
        platform,
        expectedEarnings,
      });
      alert("Monetization request submitted!");
      console.log(res.data);
    } catch (err) {
      alert("Failed to submit request.");
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Monetization Request</h2>
      <form onSubmit={handleSubmit} className="monetization-form">
        <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} required />
        <input type="text" placeholder="Content Type (e.g., video, article)" value={contentType} onChange={(e) => setContentType(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input type="text" placeholder="Platform (e.g., YouTube, Medium)" value={platform} onChange={(e) => setPlatform(e.target.value)} required />
        <input type="text" placeholder="Expected Earnings ($)" value={expectedEarnings} onChange={(e) => setExpectedEarnings(e.target.value)} required />
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default MonetizationForm;
