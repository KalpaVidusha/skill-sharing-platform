// import { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// const EditMonetization = () => {
//   const { id } = useParams();
//   const [form, setForm] = useState({
//     userId: "",
//     contentType: "",
//     description: "",
//     platform: "",
//     expectedEarnings: "",
//   });

//   useEffect(() => {
//     fetchRequest();
//   }, []);

//   const fetchRequest = async () => {
//     try {
//       const res = await axios.get(`http://localhost:8081/api/monetization/${id}`);
//       setForm(res.data);
//     } catch (err) {
//       console.error("Fetch Error:", err);
//       alert("Failed to fetch request details.");
//     }
//   };

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.put(`http://localhost:8081/api/monetization/${id}`, form);
//       alert("Request updated successfully.");
//       window.location.href = "/applications"; // Redirect back
//     } catch (err) {
//       console.error("Update Error:", err);
//       alert("Failed to update request.");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <form onSubmit={handleSubmit} className="p-8 space-y-4 bg-white rounded-lg shadow-lg">
//         <h1 className="mb-4 text-2xl font-bold text-center">Edit Monetization Request</h1>

//         <input
//           type="text"
//           name="userId"
//           value={form.userId}
//           onChange={handleChange}
//           placeholder="User ID"
//           className="w-full p-3 border rounded"
//           required
//         />
//         <input
//           type="text"
//           name="contentType"
//           value={form.contentType}
//           onChange={handleChange}
//           placeholder="Content Type"
//           className="w-full p-3 border rounded"
//           required
//         />
//         <textarea
//           name="description"
//           value={form.description}
//           onChange={handleChange}
//           placeholder="Description"
//           className="w-full p-3 border rounded resize-none"
//           required
//         ></textarea>
//         <input
//           type="text"
//           name="platform"
//           value={form.platform}
//           onChange={handleChange}
//           placeholder="Platform"
//           className="w-full p-3 border rounded"
//           required
//         />
//         <input
//           type="text"
//           name="expectedEarnings"
//           value={form.expectedEarnings}
//           onChange={handleChange}
//           placeholder="Expected Earnings"
//           className="w-full p-3 border rounded"
//           required
//         />

//         <button
//           type="submit"
//           className="w-full p-3 text-white bg-blue-600 rounded hover:bg-blue-700"
//         >
//           Update Request
//         </button>
//       </form>
//     </div>
//   );
// };

// export default EditMonetization;




// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
// import axios from "axios";

// const EditMonetization = () => {
//   const { id } = useParams(); // Get the request ID from the URL
//   const navigate = useNavigate(); // Hook for navigation
//   const [form, setForm] = useState({
//     // Initialize with fields backend might return, userId is fetched but not editable/sent back
//     userId: "", // We fetch it to know who the owner is, but don't allow editing
//     contentType: "",
//     description: "",
//     platform: "",
//     expectedEarnings: "",
//   });
//   const [isLoading, setIsLoading] = useState(true); // Loading state for fetch
//   const [error, setError] = useState(null); // Error state for fetch/update
//   const [updateStatus, setUpdateStatus] = useState(''); // Status message for update

//   // Function to get the token (assumes it's stored in localStorage)
//   const getToken = () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setError("Authentication token not found. Please login again.");
//       // Optionally redirect to login
//       // navigate('/login');
//     }
//     return token;
//   };

//   // Fetch existing request data when component mounts
//   useEffect(() => {
//     const fetchRequest = async () => {
//       setIsLoading(true);
//       setError(null); // Reset error on new fetch
//       const token = getToken();
//       if (!token) {
//         setIsLoading(false);
//         return; // Stop if no token
//       }

//       try {
//         const res = await axios.get(
//           `http://localhost:8081/api/monetization/${id}`, // Ensure port is correct
//           {
//             headers: {
//               Authorization: `Bearer ${token}`, // Add authentication token
//             },
//           }
//         );
//         setForm(res.data); // Populate form with fetched data
//       } catch (err) {
//         console.error("Fetch Error:", err);
//         let fetchErrorMessage = "Failed to fetch request details.";
//         if (err.response) {
//            fetchErrorMessage = `Error ${err.response.status}: ${err.response.data?.error || err.response.data?.message || err.response.statusText}`;
//            if (err.response.status === 403) {
//              fetchErrorMessage += " You might not own this request.";
//            }
//         } else if (err.request) {
//             fetchErrorMessage = "Network error or server not responding.";
//         } else {
//             fetchErrorMessage = err.message;
//         }
//         setError(fetchErrorMessage);
//         // alert("Failed to fetch request details."); // Use state instead
//       } finally {
//         setIsLoading(false); // Loading finished
//       }
//     };

//     fetchRequest();
//   }, [id]); // Re-run effect if ID changes

//   // Handle changes in form inputs
//   const handleChange = (e) => {
//     // Prevent changing userId through the form if it were displayed (it's not)
//     if (e.target.name === 'userId') return;
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // Handle form submission for update
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null); // Reset error state
//     setUpdateStatus(''); // Reset update status
//     const token = getToken();
//     if (!token) {
//       return; // Stop if no token
//     }

//     // Prepare data to send - exclude userId explicitly
//     const dataToUpdate = {
//       contentType: form.contentType,
//       description: form.description,
//       platform: form.platform,
//       expectedEarnings: form.expectedEarnings,
//     };

//     try {
//       await axios.put(
//         `http://localhost:8081/api/monetization/${id}`, // Ensure port is correct
//         dataToUpdate, // Send only the updatable fields
//         {
//           headers: {
//             Authorization: `Bearer ${token}`, // Add authentication token
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       setUpdateStatus("Request updated successfully!");
//       // alert("Request updated successfully."); // Use state instead

//       // Redirect back to the applications list after a short delay
//       setTimeout(() => {
//         navigate("/applications"); // Use navigate for SPA navigation
//       }, 1500); // Wait 1.5 seconds before redirecting

//     } catch (err) {
//       console.error("Update Error:", err);
//        let updateErrorMessage = "Failed to update request.";
//         if (err.response) {
//            updateErrorMessage = `Error ${err.response.status}: ${err.response.data?.error || err.response.data?.message || err.response.statusText}`;
//            if (err.response.status === 403) {
//              updateErrorMessage = "Update failed: You might not be the owner of this request.";
//            } else if (err.response.status === 404) {
//              updateErrorMessage = "Update failed: Request not found.";
//            }
//         } else if (err.request) {
//             updateErrorMessage = "Network error or server not responding during update.";
//         } else {
//             updateErrorMessage = err.message;
//         }
//       setError(updateErrorMessage);
//       // alert("Failed to update request."); // Use state instead
//     }
//   };

//   // Display loading indicator
//   if (isLoading) {
//     return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
//   }

//   // Display fetch error message
// //   if (error && !updateStatus) { // Show fetch error prominently if failed to load
// //     return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>;
// //   }

//   return (
//     <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-100">
//         {/* Simple Navbar Placeholder */}
//         <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
//              <div className="text-2xl font-bold text-blue-600">SkillSphere</div>
//              <a href="/applications" className="text-blue-600 hover:underline">Back to Requests</a>
//         </nav>

//         {/* Form Container */}
//         <div className="flex items-center justify-center flex-grow px-4 py-12">
//             <div className="w-full max-w-lg p-10 bg-white shadow-xl rounded-2xl">
//             <h1 className="mb-6 text-3xl font-bold text-center text-blue-700">Edit Monetization Request</h1>

//              {/* Display Update Status/Error Messages */}
//              {updateStatus && <div className="p-3 mb-4 text-center text-green-700 bg-green-100 rounded">{updateStatus}</div>}
//              {error && <div className="p-3 mb-4 text-center text-red-700 bg-red-100 rounded">{error}</div>}


//             <form onSubmit={handleSubmit} className="space-y-5">
//                 {/* User ID field is REMOVED from the form */}
//                 {/* Optional: Display User ID read-only if needed for info */}
//                 {/* <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700">User ID (Owner)</label>
//                     <p className="mt-1 text-gray-600">{form.userId || 'N/A'}</p>
//                 </div> */}

//                 <input
//                 type="text"
//                 name="contentType" // 'name' attribute must match the state key
//                 value={form.contentType}
//                 onChange={handleChange}
//                 placeholder="Content Type"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 required
//                 />
//                 <textarea
//                 name="description" // 'name' attribute must match the state key
//                 value={form.description}
//                 onChange={handleChange}
//                 placeholder="Description"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 required
//                 ></textarea>
//                 <input
//                 type="text"
//                 name="platform" // 'name' attribute must match the state key
//                 value={form.platform}
//                 onChange={handleChange}
//                 placeholder="Platform"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 required
//                 />
//                 <input
//                 type="text"
//                 name="expectedEarnings" // 'name' attribute must match the state key
//                 value={form.expectedEarnings}
//                 onChange={handleChange}
//                 placeholder="Expected Earnings"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 required
//                 />

//                 <button
//                 type="submit"
//                 className="w-full py-3 font-semibold text-white transition-all bg-blue-600 shadow-md hover:bg-blue-700 rounded-xl active:scale-95"
//                 disabled={isLoading} // Disable button while loading or updating
//                 >
//                 Update Request
//                 </button>
//             </form>
//             </div>
//       </div>
//     </div>
//   );
// };

// export default EditMonetization;




import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import hooks
import axios from "axios";

const EditMonetization = () => {
  const { id } = useParams(); // Get ID from URL parameters
  const navigate = useNavigate(); // Hook for navigation
  const [form, setForm] = useState({
    userId: "", // Fetched, but not editable
    contentType: "",
    description: "",
    platform: "",
    expectedEarnings: "",
  });
  const [isLoading, setIsLoading] = useState(true); // For fetch loading state
  const [isUpdating, setIsUpdating] = useState(false); // For update loading state
  const [fetchError, setFetchError] = useState(null); // Error during initial data fetch
  const [updateError, setUpdateError] = useState(null); // Error during update submission
  const [updateStatus, setUpdateStatus] = useState(''); // Success message for update

  // --- Helper Function to Get Token ---
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Set general fetch error if token is missing during load
      setFetchError("Authentication token not found. Please login again.");
      // Redirect or handle as needed
      // navigate('/login');
    }
    return token;
  };

  // --- Fetch existing request data when component mounts ---
  useEffect(() => {
    const fetchRequest = async () => {
      setIsLoading(true);
      setFetchError(null); // Reset fetch error
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return; // Stop if no token
      }

      try {
        // GET request to fetch data for the specific ID
        const res = await axios.get(
          `http://localhost:8081/api/monetization/${id}`, // Endpoint for specific request
          {
            headers: { Authorization: `Bearer ${token}` }, // Send token
          }
        );
        setForm(res.data); // Populate form state with fetched data
      } catch (err) {
        console.error("Fetch Error:", err);
        let fetchErrorMessage = "Failed to fetch request details.";
        if (err.response) {
           fetchErrorMessage = `Error ${err.response.status}: ${err.response.data?.error || err.response.data?.message || err.response.statusText}`;
           if (err.response.status === 401 || err.response.status === 403) {
             fetchErrorMessage += " You might not own this request or need to login again.";
           } else if (err.response.status === 404) {
             fetchErrorMessage = "Request not found.";
           }
        } else if (err.request) {
            fetchErrorMessage = "Network error or server not responding.";
        } else {
            fetchErrorMessage = err.message;
        }
        setFetchError(fetchErrorMessage); // Set fetch-specific error
      } finally {
        setIsLoading(false); // Loading finished
      }
    };

    fetchRequest();
  }, [id]); // Dependency array includes 'id' - re-fetch if ID changes

  // --- Handle changes in form inputs ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Prevent direct editing of userId if it were shown
    if (name === 'userId') return;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  // --- Handle form submission for update ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setUpdateError(null); // Reset update error
    setUpdateStatus(''); // Reset update status
    setIsUpdating(true); // Set updating state

    const token = getToken();
    if (!token) {
      setUpdateError("Cannot update: Authentication token missing.");
      setIsUpdating(false);
      return; // Stop if no token
    }

    // Data to be sent in the PUT request body (excluding userId)
    const dataToUpdate = {
      contentType: form.contentType,
      description: form.description,
      platform: form.platform,
      expectedEarnings: form.expectedEarnings,
    };

    try {
      // Send PUT request to update the data
      await axios.put(
        `http://localhost:8081/api/monetization/${id}`, // Endpoint for specific request
        dataToUpdate, // Send only editable data
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token
            "Content-Type": "application/json", // Set content type
          },
        }
      );
      setUpdateStatus("Request updated successfully!"); // Set success message

      // Redirect back to the list page after showing the success message
      setTimeout(() => {
        navigate("/applications"); // Use React Router's navigate
      }, 1500); // Delay for user to see the message

    } catch (err) {
      console.error("Update Error:", err);
       let updateErrorMessage = "Failed to update request.";
        if (err.response) {
           if (err.response.status === 401 || err.response.status === 403) {
             updateErrorMessage = "Update failed: You might not be the owner of this request or your session expired.";
           } else if (err.response.status === 404) {
             updateErrorMessage = "Update failed: Request not found.";
           } else {
              updateErrorMessage = `Error ${err.response.status}: ${err.response.data?.error || err.response.data?.message || err.response.statusText}`;
           }
        } else if (err.request) {
            updateErrorMessage = "Network error during update.";
        } else {
            updateErrorMessage = err.message;
        }
      setUpdateError(updateErrorMessage); // Set update-specific error
    } finally {
       setIsUpdating(false); // Stop updating indicator
    }
  };

  // --- Conditional Rendering based on state ---

  // Show loading indicator while fetching initial data
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading Request Data...</div>;
  }

  // Show error if fetching failed
  if (fetchError) {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen p-4">
             <div className="p-6 text-center text-red-700 bg-red-100 border border-red-300 rounded shadow-lg">
                <p className="mb-3 font-semibold">Error loading request details:</p>
                <p>{fetchError}</p>
                <button onClick={() => navigate('/applications')} className="px-4 py-2 mt-4 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700">
                    Back to List
                </button>
            </div>
         </div>
    );
  }

  // --- Render the Edit Form ---
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-100">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
             <div className="text-2xl font-bold text-blue-600">SkillSphere</div>
             {/* Link to go back */}
             <button onClick={() => navigate('/applications')} className="text-sm text-blue-600 hover:underline">
                 ← Back to Requests
             </button>
        </nav>

        {/* Form Container */}
        <div className="flex items-center justify-center flex-grow px-4 py-12">
            <div className="w-full max-w-lg p-10 bg-white shadow-xl rounded-2xl">
            <h1 className="mb-6 text-3xl font-bold text-center text-blue-700">Edit Monetization Request</h1>

             {/* Display Update Success Message */}
             {updateStatus && <div className="p-3 mb-4 text-center text-green-700 bg-green-100 rounded shadow">{updateStatus}</div>}
             {/* Display Update Error Message */}
             {updateError && <div className="p-3 mb-4 text-center text-red-700 bg-red-100 rounded shadow">{updateError}</div>}


            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Display Owner ID (Read-only) - Informational */}
                 <div className="p-3 bg-gray-100 rounded">
                    <label className="block text-sm font-medium text-gray-500">Request Owner ID</label>
                    <p className="mt-1 text-gray-800">{form.userId || 'N/A'}</p>
                </div>

                {/* Editable Fields */}
                <div>
                     <label htmlFor="contentType" className="block mb-1 text-sm font-medium text-gray-700">Content Type</label>
                     <input
                        id="contentType"
                        type="text"
                        name="contentType"
                        value={form.contentType}
                        onChange={handleChange}
                        placeholder="e.g., Video Tutorial, Blog Post"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                     />
                </div>
                <div>
                     <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                     <textarea
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Detailed description of the content"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                     ></textarea>
                </div>
                <div>
                    <label htmlFor="platform" className="block mb-1 text-sm font-medium text-gray-700">Platform</label>
                    <input
                        id="platform"
                        type="text"
                        name="platform"
                        value={form.platform}
                        onChange={handleChange}
                        placeholder="e.g., YouTube, Medium, Own Website"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>
                 <div>
                     <label htmlFor="expectedEarnings" className="block mb-1 text-sm font-medium text-gray-700">Expected Earnings</label>
                     <input
                        id="expectedEarnings"
                        type="text"
                        name="expectedEarnings"
                        value={form.expectedEarnings}
                        onChange={handleChange}
                        placeholder="e.g., 150 USD, Revenue Share"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                 </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`w-full py-3 font-semibold text-white transition-all bg-blue-600 rounded-xl shadow-md hover:bg-blue-700 active:scale-95 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isUpdating} // Disable button while update is in progress
                >
                    {isUpdating ? 'Updating...' : 'Update Request'}
                </button>
            </form>
            </div>
      </div>
    </div>
  );
};

export default EditMonetization;