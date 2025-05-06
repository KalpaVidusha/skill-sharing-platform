// import { useState } from "react";
// import axios from "axios";

// const MonetizationForm = () => {
//   const [userId, setUserId] = useState("");
//   const [contentType, setContentType] = useState("");
//   const [description, setDescription] = useState("");
//   const [platform, setPlatform] = useState("");
//   const [expectedEarnings, setExpectedEarnings] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // Get JWT token from localStorage
//       const token = localStorage.getItem("token"); 

//       if (!token) {
//         alert("User not authenticated. Please login first.");
//         return;
//       }

//       const res = await axios.post(
//         "http://localhost:8081/api/monetization",
//         {
//           userId,
//           contentType,
//           description,
//           platform,
//           expectedEarnings,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`, // Attach JWT token
//             "Content-Type": "application/json",
//           },
//         }
//       );
      
//       alert("Monetization request submitted!");
//       console.log(res.data);

//       // Optional: clear the form after successful submit
//       setUserId("");
//       setContentType("");
//       setDescription("");
//       setPlatform("");
//       setExpectedEarnings("");

//     } catch (err) {
//       console.error("Submit Error:", err.response ? err.response.data : err.message);
//       alert("Failed to submit request.");
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
//       {/* Navbar */}
//       <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
//         <div className="text-2xl font-bold text-blue-600">SkillSphere</div>
//         <ul className="flex gap-6 font-medium text-gray-700">
//           <li><a href="../userdashboard" className="transition hover:text-blue-600">Home</a></li>
//           <li><a href="#" className="transition hover:text-blue-600">About</a></li>
//           <li><a href="#" className="transition hover:text-blue-600">Services</a></li>
//           <li><a href="#" className="transition hover:text-blue-600">Contact</a></li>
//           <li><a href="/applications" className="transition hover:text-blue-600">View Request</a></li>
//         </ul>
//       </nav>

//       {/* Form Container */}
//       <div className="flex items-center justify-center flex-grow px-4 py-12">
//         <div className="w-full max-w-lg p-10 bg-white shadow-xl rounded-2xl">
//           <h2 className="mb-8 text-3xl font-bold text-center text-blue-700">Monetization Request</h2>
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <input
//               type="text"
//               placeholder="User ID"
//               value={userId}
//               onChange={(e) => setUserId(e.target.value)}
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//             <input
//               type="text"
//               placeholder="Content Type (e.g., video, article)"
//               value={contentType}
//               onChange={(e) => setContentType(e.target.value)}
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//             <textarea
//               placeholder="Description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//             <input
//               type="text"
//               placeholder="Platform (e.g., YouTube, Medium)"
//               value={platform}
//               onChange={(e) => setPlatform(e.target.value)}
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//             <input
//               type="text"
//               placeholder="Expected Earnings ($)"
//               value={expectedEarnings}
//               onChange={(e) => setExpectedEarnings(e.target.value)}
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//             <button
//               type="submit"
//               className="w-full py-3 font-semibold text-white transition-all bg-blue-600 shadow-md hover:bg-blue-700 rounded-xl"
//             >
//               Submit Request
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MonetizationForm;




// import { useState, useEffect } from "react"; // Added useEffect for potential future use or cleanup
// import axios from "axios";

// const MonetizationForm = () => {
//   // Removed userId state, as it's determined by the backend via token
//   const [contentType, setContentType] = useState("");
//   const [description, setDescription] = useState("");
//   const [platform, setPlatform] = useState("");
//   const [expectedEarnings, setExpectedEarnings] = useState("");
//   const [submitStatus, setSubmitStatus] = useState({ message: '', error: false }); // For better feedback

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitStatus({ message: '', error: false }); // Reset status on new submit

//     try {
//       // Get JWT token from localStorage (ensure it's stored with key 'token' after login)
//       const token = localStorage.getItem("token");

//       if (!token) {
//         setSubmitStatus({ message: "User not authenticated. Please login first.", error: true });
//         // alert("User not authenticated. Please login first."); // Can use state instead of alert
//         return;
//       }

//       // Data to send - userId is NOT included here
//       const requestData = {
//         contentType,
//         description,
//         platform,
//         expectedEarnings,
//       };

//       // Make the POST request
//       const res = await axios.post(
//         "http://localhost:8081/api/monetization", // Ensure this port matches your backend
//         requestData, // Send data without userId
//         {
//           headers: {
//             Authorization: `Bearer ${token}`, // Attach JWT token for authentication
//             "Content-Type": "application/json", // Specify content type
//           },
//         }
//       );

//       // --- Success Handling ---
//       setSubmitStatus({ message: "Monetization request submitted successfully!", error: false });
//       // alert("Monetization request submitted!"); // Use state for better UX
//       console.log("Success Response:", res.data);

//       // Optional: clear the form after successful submit
//       setContentType("");
//       setDescription("");
//       setPlatform("");
//       setExpectedEarnings("");

//     } catch (err) {
//       // --- Error Handling ---
//       console.error("Submit Error:", err);
//       let errorMessage = "Failed to submit request.";
//       if (err.response) {
//         // Try to get error message from backend response
//         errorMessage = err.response.data?.error || err.response.data?.message || `Error: ${err.response.status} - ${err.response.statusText}`;
//       } else if (err.request) {
//         // The request was made but no response was received
//         errorMessage = "No response received from server. Please check your network or server status.";
//       } else {
//         // Something happened in setting up the request that triggered an Error
//         errorMessage = err.message;
//       }
//       setSubmitStatus({ message: errorMessage, error: true });
//       // alert(`Failed to submit request: ${errorMessage}`); // Use state for better UX
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
//       {/* Navbar */}
//       <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
//         <div className="text-2xl font-bold text-blue-600">SkillSphere</div>
//         <ul className="flex gap-6 font-medium text-gray-700">
//           <li><a href="../userdashboard" className="transition hover:text-blue-600">Home</a></li>
//           {/* Add other relevant links */}
//           <li><a href="/applications" className="transition hover:text-blue-600">View Requests</a></li>
//         </ul>
//       </nav>

//       {/* Form Container */}
//       <div className="flex items-center justify-center flex-grow px-4 py-12">
//         <div className="w-full max-w-lg p-10 bg-white shadow-xl rounded-2xl">
//           <h2 className="mb-8 text-3xl font-bold text-center text-blue-700">Monetization Request</h2>

//           {/* Display Success/Error Messages */}
//           {submitStatus.message && (
//             <div className={`mb-4 p-3 rounded text-center ${submitStatus.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
//               {submitStatus.message}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* Removed User ID input field */}

//             <input
//               type="text"
//               placeholder="Content Type (e.g., video, article)"
//               value={contentType}
//               onChange={(e) => setContentType(e.target.value)}
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//             <textarea
//               placeholder="Description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//             <input
//               type="text"
//               placeholder="Platform (e.g., YouTube, Medium)"
//               value={platform}
//               onChange={(e) => setPlatform(e.target.value)}
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//             <input
//               type="text"
//               placeholder="Expected Earnings ($)"
//               value={expectedEarnings}
//               onChange={(e) => setExpectedEarnings(e.target.value)}
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//             <button
//               type="submit"
//               className="w-full py-3 font-semibold text-white transition-all bg-blue-600 shadow-md hover:bg-blue-700 rounded-xl active:scale-95" // Added active state
//             >
//               Submit Request
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MonetizationForm;




import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DollarSign, FileText, Video, Link as LinkIcon } from 'lucide-react';
import Navbar from "../../components/Navbar";

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
        navigate('/applications');
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
      
      < Navbar />

      <div 
        className="flex items-center justify-center flex-grow px-4 py-12"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1600')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="w-full max-w-xl p-10 bg-white bg-opacity-95 shadow-2xl rounded-2xl backdrop-blur-sm transform transition-transform duration-300 hover:scale-[1.01] mt-20">
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
              onClick={() => navigate("/Applications")}
              className="w-full py-2 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 rounded-xl active:scale-[0.98]"
            >
              View My Requests
            </button>
          </form>
        </div>
      </div>

      <footer className="py-4 text-center text-gray-500 bg-white border-t">
        <p>© 2025 SkillSphere. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MonetizationForm;