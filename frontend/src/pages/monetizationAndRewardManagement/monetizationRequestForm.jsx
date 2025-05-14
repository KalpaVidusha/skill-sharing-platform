import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DollarSign, FileText, Video, Link as LinkIcon } from 'lucide-react';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

const MonetizationForm = () => {
  const [contentType, setContentType] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("");
  const [expectedEarnings, setExpectedEarnings] = useState("");
  const [submitStatus, setSubmitStatus] = useState({ message: '', error: false });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ message: '', error: false });

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setSubmitStatus({ message: "User not authenticated. Please login first.", error: true });
        return;
      }

      const requestData = {
        contentType,
        description,
        platform,
        expectedEarnings,
      };

      const res = await axios.post(
        "http://localhost:8081/api/monetization",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSubmitStatus({ message: "Monetization request submitted successfully! Redirecting...", error: false });
      console.log("Success Response:", res.data);

      setContentType("");
      setDescription("");
      setPlatform("");
      setExpectedEarnings("");

      setTimeout(() => {
        navigate('/userdashboard/Applications');
      }, 2000);

    } catch (err) {
      console.error("Submit Error:", err);
      let errorMessage = "Failed to submit request.";
      if (err.response) {
        errorMessage = err.response.data?.error || err.response.data?.message || `Error: ${err.response.status} - ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = "No response received from server. Please check network or server status.";
      } else {
        errorMessage = err.message;
      }
      setSubmitStatus({ message: errorMessage, error: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      
      <Navbar />
      
      <div className="flex min-h-screen pt-20 font-sans">
        {/* Sidebar */}
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          <Sidebar defaultActiveTab="monetization" />
        </div>
        
        <div 
          className="flex-1 p-8 flex items-center justify-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1600')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
          }}
        >
          <div className="w-full max-w-xl p-10 bg-white bg-opacity-95 shadow-2xl rounded-2xl backdrop-blur-sm transform transition-transform duration-300 hover:scale-[1.01]">
            <h2 className="mb-2 text-3xl font-bold text-center text-blue-700">
              Create Monetization Request
            </h2>
            <p className="mb-8 text-center text-gray-600">Submit your content details for monetization approval</p>

            {submitStatus.message && (
              <div 
                className={`mb-6 p-4 rounded-lg text-center ${
                  submitStatus.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                } animate-fadeIn`}
              >
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500 pointer-events-none">
                  <Video size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Content Type (e.g., video, article)"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-10 transition-all duration-300 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <div className="absolute left-0 flex items-start pl-3 text-blue-500 pointer-events-none top-3">
                  <FileText size={18} />
                </div>
                <textarea
                  placeholder="Description of your content"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full h-32 px-4 py-3 pl-10 transition-all duration-300 border border-gray-300 rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500 pointer-events-none">
                  <LinkIcon size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Channel Link"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-10 transition-all duration-300 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500 pointer-events-none">
                  <DollarSign size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Expected Earnings ($)"
                  value={expectedEarnings}
                  onChange={(e) => setExpectedEarnings(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-10 transition-all duration-300 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 rounded-xl active:scale-[0.98]"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => navigate("/userdashboard/Applications")}
                className="w-full py-2 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 rounded-xl active:scale-[0.98]"
              >
                View My Requests
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonetizationForm;