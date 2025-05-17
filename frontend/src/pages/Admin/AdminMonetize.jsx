import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar"; // Ensure this path is correct

const Applications = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate(); // Not used in handleApprove directly anymore but kept if needed elsewhere

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Set fetchError here if token is crucial for initial load and not just actions
      // For actions, local error messages are usually better.
      console.error("Authentication token not found in localStorage.");
    }
    return token;
  };

  const fetchRequests = async () => {
    setLoading(true);
    setFetchError(""); // Clear previous fetch errors
    // setActionError(""); // Optionally clear action errors when re-fetching
    const token = getToken();
    if (!token) {
      setFetchError("Authentication required to load requests. Please login first.");
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
        if (err.response.status === 401) {
          msg = "Unauthorized: Could not load requests. Your session might have expired. Please login again.";
        } else if (err.response.status === 403) {
          msg = "Forbidden: You do not have permission to view these requests.";
        } else {
          msg = `Error ${err.response.status}: ${err.response.data?.message || "Unexpected server error."}`;
        }
      } else if (err.request) {
        msg = "Network error: Unable to connect to the server to load requests.";
      } else {
        msg = `Request setup error: ${err.message}`;
      }
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    const token = getToken();
    if (!token) {
      setActionError("Authentication token missing. Please login to approve requests.");
      return;
    }

    setActionError(""); // Clear previous action error
    console.log(`Attempting to approve request ID: ${id}`);

    try {
      const response = await axios.patch(
        `http://localhost:8081/api/monetization/${id}/approve?isApproved=true`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Approval successful for ID:", id, "Response:", response.data);
      // Refresh the list of requests to reflect the change
      fetchRequests();
    } catch (err) {
      console.error("Error during approval for ID:", id, err);
      let msg = "Approval failed.";

      if (err.response) {
        // Server responded with an error status code (4xx, 5xx)
        console.error("Approval - Server Error Response Data:", err.response.data);
        console.error("Approval - Server Error Response Status:", err.response.status);
        if (err.response.status === 404) {
          msg = "Request not found on the server.";
        } else if (err.response.status === 401) {
          msg = "Unauthorized. Your session might have expired. Please login again.";
        } else if (err.response.status === 403) {
          msg = "Forbidden. You do not have permission to approve this request.";
        } else {
          msg = `Server error ${err.response.status}: ${err.response.data?.message || "An unexpected error occurred."}`;
        }
      } else if (err.request) {
        // Request was made, but no response received (Network error, CORS issue)
        msg = "Network error. Could not connect to the server or a CORS policy is blocking the request. Please check your network and the server's CORS configuration for PATCH requests.";
        console.error("Approval - Network Error (err.request):", err.request);
      } else {
        // Something else happened in setting up the request
        msg = `Request setup error: ${err.message}`;
        console.error("Approval - Request Setup Error (err.message):", err.message);
      }
      setActionError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request permanently? This action cannot be undone.")) return;

    const token = getToken();
    if (!token) {
      setActionError("Authentication token missing. Please login to delete requests.");
      return;
    }

    setActionError(""); // Clear previous action error

    try {
      await axios.delete(`http://localhost:8081/api/monetization/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh the list of requests
      fetchRequests();
    } catch (err) {
      let msg = "Deletion failed.";
      if (err.response) {
        if (err.response.status === 404) msg = "Request not found.";
        else if (err.response.status === 401) msg = "Unauthorized. Your session might have expired. Please login again.";
        else if (err.response.status === 403) msg = "Forbidden. You do not have permission to delete this request.";
        else msg = `Server error ${err.response.status}: ${err.response.data?.message || "An unexpected error occurred."}`;
      } else if (err.request) {
        msg = "Network error: Unable to connect to the server for deletion.";
      } else {
        msg = `Request setup error: ${err.message}`;
      }
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
      <div className="min-h-screen bg-white/70 backdrop-blur-sm">
        <div className="flex min-h-screen">
          <div className="sticky top-0 self-start h-screen">
            <AdminSidebar activeTab="monetization" />
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="mb-8 text-4xl font-bold text-center text-black">
              Monetization Requests
            </h2>

            {loading && (
              <div className="text-lg text-center text-blue-600 animate-pulse">
                Loading requests...
              </div>
            )}

            {fetchError && (
              <div className="p-4 mb-6 text-center text-red-700 bg-red-100 border border-red-300 rounded-lg">
                <p className="font-semibold">Error loading requests:</p>
                <p>{fetchError}</p>
                {!fetchError.includes("Authentication") && !fetchError.includes("Forbidden") && (
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
                <p className="font-semibold">Action Error:</p>
                <p>{actionError}</p>
              </div>
            )}

            {!loading && !fetchError && requests.length === 0 && (
              <div className="py-10 text-center text-black">
                No pending monetization requests found.
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
                      <span className="font-medium">Description:</span>{" "}
                      {req.description}
                    </p>
                    <p className="mt-2 text-sm text-black">
                      <span className="font-medium">Channel Link:</span>{" "}
                      {req.platform}
                    </p>
                    <p className="mt-2 text-sm text-black">
                      <span className="font-medium">Earnings:</span> ${req.expectedEarnings}
                    </p>
                    <p className="mt-2 text-sm text-black">
                      <span className="font-medium">User ID:</span> {req.userId}
                    </p>
                     <p className="mt-2 text-sm text-black">
                      <span className="font-medium">Status:</span> {req.approved ? <span className="font-semibold text-green-600">Approved</span> : <span className="font-semibold text-orange-600">Pending</span>}
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                      {!req.approved && ( // Only show Approve button if not already approved
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-3 py-1 text-sm font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600"
                          disabled={loading} // Disable button while any loading is happening
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                        disabled={loading} // Disable button while any loading is happening
                      >
                        Delete {/* Changed from "Rejected" to "Delete" to match function */}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applications;