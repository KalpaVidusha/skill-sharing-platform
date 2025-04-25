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
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col">
  {/* Navbar */}
  <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
    <div className="text-2xl font-bold text-blue-600">SkillSphere</div>
    <ul className="flex gap-6 text-gray-700 font-medium">
      <li><a href="#" className="hover:text-blue-600 transition">Home</a></li>
      <li><a href="#" className="hover:text-blue-600 transition">About</a></li>
      <li><a href="#" className="hover:text-blue-600 transition">Services</a></li>
      <li><a href="#" className="hover:text-blue-600 transition">Contact</a></li>
    </ul>
  </nav>

  {/* Form Container */}
  <div className="flex-grow flex items-center justify-center px-4 py-12">
    <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg w-full">
      <h2 className="text-3xl font-bold text-blue-700 text-center mb-8">Monetization Request</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Content Type (e.g., video, article)"
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Platform (e.g., YouTube, Medium)"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Expected Earnings ($)"
          value={expectedEarnings}
          onChange={(e) => setExpectedEarnings(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition-all"
        >
          Submit Request
        </button>
      </form>
    </div>
  </div>
</div>

  );
};

export default MonetizationForm;
