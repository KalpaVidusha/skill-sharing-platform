import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

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
    navigate(`/userdashboard/Applications/edit/${id}`);
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
      <Navbar />
      {/* Overlay for readability */}
      <div className="min-h-screen bg-black/10 backdrop-blur-sm">
        {/* Navbar */}
        
        
        <div className="flex min-h-screen pt-20 font-sans">
          {/* Sidebar */}
          <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
            <Sidebar defaultActiveTab="monetization" />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-8 overflow-y-auto">
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
                      <span className="font-medium">Channel Link:</span> {req.platform}
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
    </div>
  );
};

export default Applications;
