// import { useState, useEffect } from "react";
// import axios from "axios";

// const Applications = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fetchRequests = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await axios.get("http://localhost:8081/api/monetization");
//       setRequests(res.data);
//     } catch (err) {
//       console.error("Fetch Error:", err);
//       setError(err.response?.data?.message || "Failed to load requests.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRequests();
//   }, []);

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
//           <li><a href="/applications" className="transition hover:text-blue-600">View Requests</a></li>
//         </ul>
//       </nav>

//       {/* Page content */}
//       <div className="flex-grow p-8">
//         <h2 className="mb-6 text-3xl font-bold text-center text-blue-700">Monetization Requests</h2>

//         {loading ? (
//           <div className="text-lg text-center text-blue-600 animate-pulse">
//             Loading requests...
//           </div>
//         ) : error ? (
//           <div className="text-center text-red-600">
//             <p>{error}</p>
//             <button 
//               onClick={fetchRequests} 
//               className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
//             >
//               Retry
//             </button>
//           </div>
//         ) : requests.length === 0 ? (
//           <div className="text-center text-gray-600">
//             No requests found.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full overflow-hidden bg-white shadow-md table-auto rounded-xl">
//               <thead className="text-white bg-blue-600">
//                 <tr>
//                   <th className="px-4 py-3">User ID</th>
//                   <th className="px-4 py-3">Content Type</th>
//                   <th className="px-4 py-3">Description</th>
//                   <th className="px-4 py-3">Platform</th>
//                   <th className="px-4 py-3">Expected Earnings ($)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {requests.map((req) => (
//                   <tr key={req.id} className="text-center border-b">
//                     <td className="px-4 py-2">{req.userId}</td>
//                     <td className="px-4 py-2">{req.contentType}</td>
//                     <td className="px-4 py-2">{req.description}</td>
//                     <td className="px-4 py-2">{req.platform}</td>
//                     <td className="px-4 py-2">{req.expectedEarnings}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Applications;




// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom"; // useNavigate for programmatic navigation

// const Applications = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(""); // State to store error messages
//   const navigate = useNavigate(); // Hook for navigation

//   // --- Helper Function to Get Token ---
//   // Checks localStorage for the token and sets an error if not found.
//   const getToken = () => {
//     const token = localStorage.getItem("token"); // Ensure the key is exactly "token"
//     if (!token) {
//       // Set error state if token is missing
//       setError("Authentication token not found. Please login first.");
//       // Optional: Redirect to login page immediately
//       // navigate('/login');
//     }
//     return token;
//   };

//   // --- Function to Fetch Monetization Requests ---
//   const fetchRequests = async () => {
//     setLoading(true);
//     setError(""); // Clear previous errors

//     const token = getToken(); // Get token using the helper function

//     // If token is not found, stop the function execution
//     if (!token) {
//       setLoading(false); // Stop loading indicator
//       return;
//     }

//     try {
//       // Make the API call with the Authorization header
//       const res = await axios.get(
//         "http://localhost:8081/api/monetization", // Ensure backend port is correct
//         {
//           headers: {
//             // Crucial: Send the token in the correct format
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setRequests(res.data); // Update state with fetched requests
//     } catch (err) {
//       console.error("Fetch Error:", err); // Log the full error for debugging
//       let errorMessage = "Failed to load requests."; // Default error message

//       // Provide more specific error messages based on response status
//       if (err.response) {
//         if (err.response.status === 401 || err.response.status === 403) {
//           // Specific message for authentication/authorization issues
//           errorMessage = "Unauthorized: Your session may have expired or you lack permissions. Please login again.";
//           // Optional: Clear token if unauthorized to force re-login on next attempt
//           // localStorage.removeItem("token");
//         } else {
//           // General error message from backend or status text
//           errorMessage = `Error ${err.response.status}: ${err.response.data?.message || err.response.data?.error || err.response.statusText}`;
//         }
//       } else if (err.request) {
//         // Network error (no response received)
//         errorMessage = "Network error: Could not connect to the server.";
//       } else {
//         // Other errors (e.g., setting up the request)
//         errorMessage = err.message;
//       }
//       setError(errorMessage); // Set the specific error message in state
//     } finally {
//       setLoading(false); // Ensure loading indicator stops regardless of success/failure
//     }
//   };

//   // --- useEffect Hook ---
//   // Runs fetchRequests when the component mounts
//   useEffect(() => {
//     fetchRequests();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // Empty dependency array ensures this runs only once on mount

//   // --- Function to Handle Deleting a Request ---
//   const handleDelete = async (id) => {
//     // Ask for confirmation before deleting
//     if (!window.confirm("Are you sure you want to delete this monetization request?")) {
//       return; // Stop if user cancels
//     }

//     setError(""); // Clear previous errors
//     const token = getToken(); // Get token

//     if (!token) {
//       // If no token, show error and stop (should have been caught earlier, but good practice)
//       setError("Cannot delete: Authentication token not found. Please login.");
//       return;
//     }

//     try {
//       // Make the DELETE request with the Authorization header
//       await axios.delete(
//         `http://localhost:8081/api/monetization/${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       // Provide success feedback (using alert for simplicity here, state is better for UX)
//       alert("Request deleted successfully.");
//       // Refresh the list to reflect the deletion
//       fetchRequests();
//       // Alternative: Update state directly without re-fetching (faster UX)
//       // setRequests(currentRequests => currentRequests.filter(req => req.id !== id));
//     } catch (err) {
//       console.error("Delete Error:", err); // Log the error
//       let deleteErrorMessage = "Failed to delete request.";
//        if (err.response) {
//           if (err.response.status === 401 || err.response.status === 403) {
//              deleteErrorMessage = "Delete failed: You might not own this request or lack necessary permissions.";
//           } else {
//              deleteErrorMessage = `Error ${err.response.status}: ${err.response.data?.error || err.response.data?.message || err.response.statusText}`;
//           }
//        } else if (err.request) {
//           deleteErrorMessage = "Network error during delete operation.";
//        } else {
//           deleteErrorMessage = err.message;
//        }
//       setError(deleteErrorMessage); // Show error in the UI
//       alert(deleteErrorMessage); // Show alert for immediate feedback
//     }
//   };

//   // --- Function to Navigate to the Edit Page ---
//   const handleEdit = (id) => {
//     // Use navigate hook to go to the edit route, passing the request ID
//     navigate(`/edit-monetization/${id}`); // Ensure this route exists in your Router setup
//   };

//   // --- JSX Rendering ---
//   return (
//     <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
//       {/* Navbar */}
//       <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
//         <div className="text-2xl font-bold text-blue-600">SkillSphere</div>
//         <ul className="flex items-center gap-6 font-medium text-gray-700"> {/* Added items-center */}
//           <li><a href="/userdashboard" className="transition hover:text-blue-600">Home</a></li> {/* Changed to absolute path */}
//           <li><a href="/monetization-form" className="transition hover:text-blue-600">New Request</a></li>
//           {/* Add Logout button or other relevant links */}
//         </ul>
//       </nav>

//       {/* Page content */}
//       <div className="flex-grow p-4 md:p-8">
//         <h2 className="mb-6 text-3xl font-bold text-center text-blue-700">Monetization Requests</h2>

//         {/* Display Loading Indicator */}
//         {loading && (
//           <div className="text-lg text-center text-blue-600 animate-pulse">
//             Loading requests... Please wait.
//           </div>
//         )}

//         {/* Display Error Messages */}
//         {error && !loading && ( // Show error only when not loading
//           <div className="p-4 mb-4 text-center text-red-700 bg-red-100 border border-red-300 rounded shadow">
//             <p className="font-semibold">Error:</p>
//             <p>{error}</p>
//             <button
//               onClick={fetchRequests} // Allow retrying the fetch operation
//               className="px-4 py-2 mt-3 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//             >
//               Retry Fetch
//             </button>
//           </div>
//         )}

//         {/* Display Table or 'No Requests' Message */}
//         {!loading && !error && ( // Display table only if not loading and no error
//           requests.length === 0 ? (
//             <div className="py-10 text-center text-gray-600">
//               No monetization requests found.
//               <a href="/monetization-form" className="ml-2 text-blue-600 underline hover:text-blue-800">Create one?</a>
//             </div>
//           ) : (
//             <div className="overflow-x-auto shadow-lg rounded-xl">
//               <table className="min-w-full overflow-hidden bg-white table-auto">
//                 <thead className="text-sm text-white uppercase bg-blue-600"> {/* Adjusted header style */}
//                   <tr>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-left">Content Type</th>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-left">Description</th>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-left">Platform</th>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-right">Earnings ($)</th>
//                     <th className="hidden px-4 py-3 font-semibold tracking-wider text-left md:table-cell">Owner ID</th> {/* Changed header text */}
//                     <th className="px-4 py-3 font-semibold tracking-wider text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-gray-700 divide-y divide-gray-200">
//                   {requests.map((req) => (
//                     <tr key={req.id} className="transition-colors duration-150 hover:bg-gray-100">
//                       <td className="px-4 py-3 whitespace-nowrap">{req.contentType}</td>
//                       {/* Use a class to potentially truncate long descriptions with ellipsis */}
//                       <td className="max-w-xs px-4 py-3 truncate" title={req.description}>{req.description}</td>
//                       <td className="px-4 py-3 whitespace-nowrap">{req.platform}</td>
//                       <td className="px-4 py-3 text-right whitespace-nowrap">{req.expectedEarnings}</td>
//                       <td className="hidden px-4 py-3 md:table-cell whitespace-nowrap">{req.userId}</td>
//                       <td className="px-4 py-3 text-center whitespace-nowrap">
//                         {/* Edit Button */}
//                         <button
//                            onClick={() => handleEdit(req.id)}
//                            className="px-3 py-1 mr-2 text-xs font-medium text-white transition bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50" // Added focus styles
//                            aria-label={`Edit request for ${req.contentType}`} // Accessibility
//                         >
//                           Edit
//                         </button>
//                         {/* Delete Button */}
//                         <button
//                           onClick={() => handleDelete(req.id)}
//                           className="px-3 py-1 text-xs font-medium text-white transition bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50" // Added focus styles
//                            aria-label={`Delete request for ${req.contentType}`} // Accessibility
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )
//         )}
//       </div>
//     </div>
//   );
// };

// export default Applications;




// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom"; // useNavigate for programmatic navigation

// const Applications = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [fetchError, setFetchError] = useState(""); // Error specifically for fetching data
//   const [actionError, setActionError] = useState(""); // Error specifically for actions like delete
//   const navigate = useNavigate(); // Hook for navigation

//   // --- Helper Function to Get Token ---
//   const getToken = () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       // Set a general fetch error if token is missing during initial load or action
//       setFetchError("Authentication required. Please login first.");
//       // Could also clear actionError here if needed
//       setActionError("");
//     }
//     return token;
//   };

//   // --- Function to Fetch Monetization Requests ---
//   const fetchRequests = async () => {
//     setLoading(true);
//     setFetchError(""); // Clear previous fetch errors
//     setActionError(""); // Clear previous action errors
//     const token = getToken();

//     if (!token) {
//       setLoading(false);
//       return; // Stop if no token found by getToken
//     }

//     try {
//       const res = await axios.get(
//         "http://localhost:8081/api/monetization", // Backend endpoint
//         {
//           headers: { Authorization: `Bearer ${token}` }, // Send token
//         }
//       );
//       setRequests(res.data);
//     } catch (err) {
//       console.error("Fetch Error:", err);
//       let errorMessage = "Failed to load requests.";
//       if (err.response) {
//         if (err.response.status === 401 || err.response.status === 403) {
//           errorMessage = "Unauthorized: Session may have expired or permissions missing. Please login again.";
//         } else {
//           errorMessage = `Error ${err.response.status}: ${err.response.data?.message || err.response.data?.error || err.response.statusText}`;
//         }
//       } else if (err.request) {
//         errorMessage = "Network error: Could not connect to the server.";
//       } else {
//         errorMessage = err.message;
//       }
//       setFetchError(errorMessage); // Set fetch-specific error
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- useEffect Hook: Fetch on Mount ---
//   useEffect(() => {
//     fetchRequests();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // Run only once when component mounts

//   // --- Function to Navigate to Edit Page ---
//   // Called by the Edit button's onClick handler.
//   const handleEdit = (id) => {
//     // Navigates to the dynamic route for editing a specific request.
//     // Ensure this route is defined in your main Router setup (e.g., App.js).
//     navigate(`/edit-monetization/${id}`);
//   };

//   // --- Function to Handle Deleting a Request ---
//   // Called by the Delete button's onClick handler.
//   const handleDelete = async (id) => {
//     // Confirm before proceeding with deletion
//     if (!window.confirm("Are you sure you want to permanently delete this request?")) {
//       return;
//     }

//     setActionError(""); // Clear previous action errors
//     const token = getToken();
//     if (!token) {
//       // If getToken() sets an error, it will be displayed. We also stop here.
//       setActionError("Cannot delete: Authentication token missing."); // Set action-specific error
//       return;
//     }

//     try {
//       // Send DELETE request to the backend endpoint for the specific ID
//       await axios.delete(
//         `http://localhost:8081/api/monetization/${id}`, // Correct delete endpoint
//         {
//           headers: { Authorization: `Bearer ${token}` }, // MUST include token
//         }
//       );
//       // Provide success feedback (using alert is simple, state is better)
//       alert("Request deleted successfully.");
//       // Refresh the list to reflect the change
//       fetchRequests();
//       // Alternative (faster UI, less consistent if backend fails silently):
//       // setRequests(currentRequests => currentRequests.filter(req => req.id !== id));
//     } catch (err) {
//       console.error("Delete Error:", err);
//       let deleteErrorMessage = "Failed to delete request.";
//        if (err.response) {
//           if (err.response.status === 401 || err.response.status === 403) {
//              deleteErrorMessage = "Delete failed: You might not own this request or lack permissions.";
//           } else if (err.response.status === 404) {
//              deleteErrorMessage = "Delete failed: Request not found.";
//           } else {
//              deleteErrorMessage = `Error ${err.response.status}: ${err.response.data?.error || err.response.data?.message || err.response.statusText}`;
//           }
//        } else if (err.request) {
//           deleteErrorMessage = "Network error during delete.";
//        } else {
//           deleteErrorMessage = err.message;
//        }
//       setActionError(deleteErrorMessage); // Set action-specific error message
//       alert(`Deletion failed: ${deleteErrorMessage}`); // Also alert user immediately
//     }
//   };

//   // --- JSX Rendering ---
//   return (
//     <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
//       {/* Navbar */}
//       <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
//         <div className="text-2xl font-bold text-blue-600">SkillSphere</div>
//         <ul className="flex items-center gap-6 font-medium text-gray-700">
//           <li><a href="/userdashboard" className="transition hover:text-blue-600">Home</a></li>
//           <li><a href="/monetization-form" className="transition hover:text-blue-600">New Request</a></li>
//         </ul>
//       </nav>

//       {/* Page content */}
//       <div className="flex-grow p-4 md:p-8">
//         <h2 className="mb-6 text-3xl font-bold text-center text-blue-700">Monetization Requests</h2>

//         {/* Loading Indicator */}
//         {loading && <div className="text-lg text-center text-blue-600 animate-pulse">Loading...</div>}

//         {/* Display Fetch Error (if any) */}
//         {fetchError && !loading && (
//           <div className="p-4 mb-4 text-center text-red-700 bg-red-100 border border-red-300 rounded shadow">
//             <p className="font-semibold">Error Loading Data:</p>
//             <p>{fetchError}</p>
//             {!fetchError.includes("Authentication required") && (
//               <button onClick={fetchRequests} className="px-4 py-2 mt-3 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
//                 Retry Fetch
//               </button>
//             )}
//           </div>
//         )}

//          {/* Display Action Error (e.g., from delete, if any) */}
//          {actionError && !loading && (
//              <div className="p-3 mb-4 text-center text-red-700 bg-red-100 border border-red-300 rounded shadow">
//                  <p>{actionError}</p>
//              </div>
//          )}

//         {/* Table or 'No Requests' Message */}
//         {!loading && !fetchError && ( // Only show table/message if not loading and no initial fetch error
//           requests.length === 0 ? (
//             <div className="py-10 text-center text-gray-600">
//               No monetization requests found.
//               <a href="/monetization-form" className="ml-2 text-blue-600 underline hover:text-blue-800">Create one?</a>
//             </div>
//           ) : (
//             <div className="overflow-x-auto shadow-lg rounded-xl">
//               <table className="min-w-full overflow-hidden bg-white table-auto">
//                 {/* ... (thead definition as before) ... */}
//                 <thead className="text-sm text-white uppercase bg-blue-600">
//                   <tr>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-left">Content Type</th>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-left">Description</th>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-left">Platform</th>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-right">Earnings ($)</th>
//                     <th className="hidden px-4 py-3 font-semibold tracking-wider text-left md:table-cell">Owner ID</th>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-gray-700 divide-y divide-gray-200">
//                   {requests.map((req) => (
//                     <tr key={req.id} className="transition-colors duration-150 hover:bg-gray-100">
//                       {/* ... (td definitions for data as before) ... */}
//                        <td className="px-4 py-3 whitespace-nowrap">{req.contentType}</td>
//                       <td className="max-w-xs px-4 py-3 truncate" title={req.description}>{req.description}</td>
//                       <td className="px-4 py-3 whitespace-nowrap">{req.platform}</td>
//                       <td className="px-4 py-3 text-right whitespace-nowrap">{req.expectedEarnings}</td>
//                       <td className="hidden px-4 py-3 md:table-cell whitespace-nowrap">{req.userId}</td>
//                       <td className="px-4 py-3 text-center whitespace-nowrap">
//                         {/* --- EDIT BUTTON --- */}
//                         {/* Calls handleEdit with the request's ID */}
//                         <button
//                            onClick={() => handleEdit(req.id)}
//                            className="px-3 py-1 mr-2 text-xs font-medium text-white transition bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
//                            aria-label={`Edit request for ${req.contentType}`}
//                         >
//                           Edit
//                         </button>
//                         {/* --- DELETE BUTTON --- */}
//                         {/* Calls handleDelete with the request's ID */}
//                         <button
//                           onClick={() => handleDelete(req.id)}
//                           className="px-3 py-1 text-xs font-medium text-white transition bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
//                            aria-label={`Delete request for ${req.contentType}`}
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )
//         )}
//       </div>
//     </div>
//   );
// };

// export default Applications;




// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom"; // useNavigate for programmatic navigation

// const Applications = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [fetchError, setFetchError] = useState(""); // Error specifically for fetching data
//   const [actionError, setActionError] = useState(""); // Error specifically for actions like delete
//   const navigate = useNavigate(); // Hook for navigation

//   // --- Helper Function to Get Token ---
//   const getToken = () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setFetchError("Authentication required. Please login first.");
//       setActionError("");
//     }
//     return token;
//   };

//   // --- Function to Fetch Monetization Requests ---
//   const fetchRequests = async () => {
//     setLoading(true);
//     setFetchError("");
//     setActionError("");
//     const token = getToken();

//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await axios.get(
//         "http://localhost:8081/api/monetization",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setRequests(res.data);
//     } catch (err) {
//       console.error("Fetch Error:", err);
//       let errorMessage = "Failed to load requests.";
//       if (err.response) {
//         if (err.response.status === 401 || err.response.status === 403) {
//           errorMessage = "Unauthorized: Session may have expired or permissions missing. Please login again.";
//         } else {
//           errorMessage = `Error ${err.response.status}: ${err.response.data?.message || err.response.data?.error || err.response.statusText}`;
//         }
//       } else if (err.request) {
//         errorMessage = "Network error: Could not connect to the server.";
//       } else {
//         errorMessage = err.message;
//       }
//       setFetchError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- useEffect Hook: Fetch on Mount ---
//   useEffect(() => {
//     fetchRequests();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // --- Function to Navigate to Edit Page ---
//   const handleEdit = (id) => {
//     // Navigates to the dynamic route for editing.
//     // Ensure '/edit-monetization/:id' route exists in your Router setup.
//     navigate(`/edit-monetization/${id}`);
//   };

//   // --- Function to Handle Deleting a Request ---
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to permanently delete this request?")) {
//       return;
//     }
//     setActionError("");
//     const token = getToken();
//     if (!token) {
//       setActionError("Cannot delete: Authentication token missing.");
//       return;
//     }

//     try {
//       await axios.delete(
//         `http://localhost:8081/api/monetization/${id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       alert("Request deleted successfully.");
//       fetchRequests(); // Re-fetch after delete
//     } catch (err) {
//       console.error("Delete Error:", err);
//       let deleteErrorMessage = "Failed to delete request.";
//        if (err.response) {
//           // ... (error message logic as before) ...
//           if (err.response.status === 401 || err.response.status === 403) {
//              deleteErrorMessage = "Delete failed: You might not own this request or lack permissions.";
//           } else if (err.response.status === 404) {
//              deleteErrorMessage = "Delete failed: Request not found.";
//           } else {
//              deleteErrorMessage = `Error ${err.response.status}: ${err.response.data?.error || err.response.data?.message || err.response.statusText}`;
//           }
//        } else if (err.request) {
//           deleteErrorMessage = "Network error during delete.";
//        } else {
//           deleteErrorMessage = err.message;
//        }
//       setActionError(deleteErrorMessage);
//       alert(`Deletion failed: ${deleteErrorMessage}`);
//     }
//   };

//   // --- JSX Rendering ---
//   return (
//     <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
//       {/* Navbar */}
//       <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
//         <div className="text-2xl font-bold text-blue-600">SkillSphere</div>
//         <ul className="flex items-center gap-6 font-medium text-gray-700">
//           <li><a href="/userdashboard" className="transition hover:text-blue-600">Home</a></li>
//           <li><a href="/monetization-form" className="transition hover:text-blue-600">New Request</a></li>
//         </ul>
//       </nav>

//       {/* Page content */}
//       <div className="flex-grow p-4 md:p-8">
//         <h2 className="mb-6 text-3xl font-bold text-center text-blue-700">Monetization Requests</h2>

//         {/* Loading Indicator */}
//         {loading && <div className="text-lg text-center text-blue-600 animate-pulse">Loading...</div>}

//         {/* Fetch Error Display */}
//         {fetchError && !loading && (
//           <div className="p-4 mb-4 text-center text-red-700 bg-red-100 border border-red-300 rounded shadow">
//             <p className="font-semibold">Error Loading Data:</p>
//             <p>{fetchError}</p>
//             {!fetchError.includes("Authentication required") && (
//               <button onClick={fetchRequests} className="px-4 py-2 mt-3 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
//                 Retry Fetch
//               </button>
//             )}
//           </div>
//         )}

//          {/* Action Error Display */}
//          {actionError && !loading && (
//              <div className="p-3 mb-4 text-center text-red-700 bg-red-100 border border-red-300 rounded shadow">
//                  <p>{actionError}</p>
//              </div>
//          )}

//         {/* Table or 'No Requests' Message */}
//         {!loading && !fetchError && (
//           requests.length === 0 ? (
//              <div className="py-10 text-center text-gray-600">
//                No monetization requests found.
//                <a href="/monetization-form" className="ml-2 text-blue-600 underline hover:text-blue-800">Create one?</a>
//              </div>
//           ) : (
//             <div className="overflow-x-auto shadow-lg rounded-xl">
//               <table className="min-w-full overflow-hidden bg-white table-auto">
//                  {/* ... (thead definition as before) ... */}
//                  <thead className="text-sm text-white uppercase bg-blue-600">
//                   <tr>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-left">Content Type</th>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-left">Description</th>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-left">Platform</th>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-right">Earnings ($)</th>
//                     <th className="hidden px-4 py-3 font-semibold tracking-wider text-left md:table-cell">Owner ID</th>
//                     <th className="px-4 py-3 font-semibold tracking-wider text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-gray-700 divide-y divide-gray-200">
//                   {requests.map((req) => (
//                     <tr key={req.id} className="transition-colors duration-150 hover:bg-gray-100">
//                        {/* ... (td definitions for data as before) ... */}
//                        <td className="px-4 py-3 whitespace-nowrap">{req.contentType}</td>
//                       <td className="max-w-xs px-4 py-3 truncate" title={req.description}>{req.description}</td>
//                       <td className="px-4 py-3 whitespace-nowrap">{req.platform}</td>
//                       <td className="px-4 py-3 text-right whitespace-nowrap">{req.expectedEarnings}</td>
//                       <td className="hidden px-4 py-3 md:table-cell whitespace-nowrap">{req.userId}</td>
//                       <td className="px-4 py-3 text-center whitespace-nowrap">
//                         {/* EDIT BUTTON - Navigates on click */}
//                         <button
//                            onClick={() => handleEdit(req.id)}
//                            className="px-3 py-1 mr-2 text-xs font-medium text-white transition bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
//                            aria-label={`Edit request for ${req.contentType}`}
//                         >
//                           Edit
//                         </button>
//                         {/* DELETE BUTTON - Calls delete handler on click */}
//                         <button
//                           onClick={() => handleDelete(req.id)}
//                           className="px-3 py-1 text-xs font-medium text-white transition bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
//                            aria-label={`Delete request for ${req.contentType}`}
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )
//         )}
//       </div>
//     </div>
//   );
// };

// export default Applications;


import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const Applications = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFetchError("Authentication required. Please login first.");
    }
    return token;
  };

  const fetchRequests = async () => {
    setLoading(true);
    setFetchError("");
    setActionError("");
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:8081/api/monetization", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      let msg = "Failed to load requests.";
      if (err.response) {
        if ([401, 403].includes(err.response.status)) {
          msg = "Unauthorized. Please login again.";
        } else {
          msg = `Error ${err.response.status}: ${err.response.data?.message || "Unexpected error."}`;
        }
      } else {
        msg = "Network error: Unable to connect.";
      }
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this request permanently?")) return;
    const token = getToken();
    if (!token) {
      setActionError("Authentication token missing.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8081/api/monetization/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests();
    } catch (err) {
      let msg = "Delete failed.";
      if (err.response?.status === 404) msg = "Request not found.";
      else if ([401, 403].includes(err.response?.status)) msg = "Unauthorized or permission denied.";
      else if (err.request) msg = "Network error.";
      setActionError(msg);
    }
  };

  return (
    <div
      className="min-h-screen bg-fixed bg-center bg-no-repeat bg-cover"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1600')",
      }}
    >
      {/* Overlay for readability */}
      <div className="min-h-screen bg-black/10 backdrop-blur-sm">
        {/* Navbar */}
        <Navbar />
  
        {/* Main Content */}
        <div className="px-4 py-12 mx-auto max-w-7xl">
          <h2 className="mb-8 text-4xl font-bold text-center text-blue-600">
            My Monetization Requests
          </h2>
  
          {loading && (
            <div className="text-lg text-center text-blue-600 animate-pulse">
              Loading...
            </div>
          )}
  
          {fetchError && (
            <div className="p-4 mb-6 text-center text-red-700 bg-red-100 border border-red-300 rounded-lg">
              <p className="font-semibold">Error:</p>
              <p>{fetchError}</p>
              {!fetchError.includes("Authentication") && (
                <button
                  onClick={fetchRequests}
                  className="px-4 py-2 mt-3 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Retry
                </button>
              )}
            </div>
          )}
  
          {actionError && (
            <div className="p-4 mb-6 text-center text-red-600 border border-red-200 rounded bg-red-50">
              {actionError}
            </div>
          )}
  
          {!loading && !fetchError && requests.length === 0 && (
            <div className="py-10 text-center text-black">
              No requests found.{" "}
              <a
                href="/monetization-form"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Create one
              </a>
            </div>
          )}
  
          {!loading && !fetchError && requests.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 transition-all border border-gray-200 shadow-md bg-white/80 rounded-xl hover:shadow-lg"
                >
                  <h3 className="mb-1 text-xl font-semibold text-blue-700">
                    {req.contentType}
                  </h3>
                  <p
                    className="text-sm text-black line-clamp-3"
                    title={req.description}
                  >
                    <span className="font-medium">Description:</span> {req.description}
                  </p>
                  <p className="mt-2 text-sm text-black">
                    <span className="font-medium">User name: </span> {req.platform}
                  </p>
                  <p className="mt-2 text-sm text-black">
                    <span className="font-medium">Earnings:</span> $
                    {req.expectedEarnings}
                  </p>
                  <p className="mt-2 text-sm text-black ">
                  <span className="font-medium">User ID:</span> {req.userId}
                  </p>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(req.id)}
                      className="px-3 py-1 text-sm font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
