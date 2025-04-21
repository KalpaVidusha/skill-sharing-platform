import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor for authentication
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  response => response.data,
  error => {
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    console.error("API Error:", errorMessage);
    return Promise.reject({ 
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

const apiService = {
  // Authentication
  login: (identifier, password) => {
    // Determine if identifier is an email or username
    const isEmail = identifier.includes('@');
    
    // Create proper login request payload
    const loginRequest = isEmail 
      ? { email: identifier, password: password }
      : { username: identifier, password: password };
    
    // Only use the JWT endpoint with no fallback
    return api.post("/users/signin", loginRequest)
      .then(data => {
        if (data.accessToken) {
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("userId", data.id);
          localStorage.setItem("username", data.username);
          localStorage.setItem("email", data.email);
          localStorage.setItem("isLoggedIn", "true");
          return data;
        } else if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.id || data.userId);
          localStorage.setItem("username", data.username);
          localStorage.setItem("email", data.email);
          localStorage.setItem("isLoggedIn", "true");
          return data;
        }
        throw new Error("No authentication token received");
      });
  },
  
  // Google OAuth login
  googleLogin: (googleAuthData) => {
    return api.post("/oauth/google", googleAuthData)
      .then(data => {
        if (data.accessToken) {
          return data;
        } else if (data.token) {
          // Normalize the response
          return {
            accessToken: data.token,
            id: data.id || data.userId,
            username: data.username,
            email: data.email
          };
        }
        throw new Error("No authentication token received from Google login");
      });
  },

  signup: (userData) => {
    // Format the userData to match the SignupRequest expected by the backend
    const signupRequest = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      skills: userData.skills || [],
      role: userData.role || ["user"]
    };

    // Only use the JWT endpoint with no fallback
    return api.post("/users/signup", signupRequest);
  },

  logout: () => {
    // Clear JWT token and user info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("isLoggedIn");
    
    // Return a resolved promise to allow chaining
    return Promise.resolve({ success: true });
  },

  // Users
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updateUserProfile: (userId, userData) => api.put(`/users/${userId}`, userData),
  
  // Follow/Unfollow functionality
  followUser: (userId, userToFollowId) => 
    api.post(`/users/${userId}/follow/${userToFollowId}`),
  
  unfollowUser: (userId, userToUnfollowId) => 
    api.post(`/users/${userId}/unfollow/${userToUnfollowId}`),
  
  getFollowers: (userId) => 
    api.get(`/users/${userId}/followers`),
  
  getFollowing: (userId) => 
    api.get(`/users/${userId}/following`),
  
  searchUsers: (query, page = 0, size = 10) => 
    api.get(`/users/search`, { params: { query, page, size } }),

  // Posts
  createPost: (postData) => api.post("/posts", postData),
  getAllPosts: () => api.get("/posts"),
  getPostById: (postId) => api.get(`/posts/${postId}`),
  updatePost: (postId, data) => api.put(`/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  getPostsByUser: (userId) => api.get(`/posts/user/${userId}`),
  getPostsByCategory: (category) => api.get(`/posts/category/${category}`),
  searchPosts: (title) => api.get(`/posts/search?title=${title}`),
  toggleLike: (postId) => api.post(`/posts/${postId}/like`),
  
  // Comments
  getCommentsByPost: (postId) => api.get(`/comments/post/${postId}`),
  addComment: (comment) => api.post("/comments", comment),
  updateComment: (commentId, comment) => api.put(`/comments/${commentId}`, comment),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),

  // Files
  uploadFiles: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    
    // Get token for authorization
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "multipart/form-data" };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Use a different axios instance for file uploads
    return axios.post(`${API_BASE_URL}/upload`, formData, {
      headers,
      withCredentials: true
    }).then(response => response.data);
  }
};

export default apiService;