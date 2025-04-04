import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Define all API methods
const apiService = {
  // Authentication endpoints
  login: (identifier, password) => {
    const isEmail = identifier.includes('@');
    const payload = { password };
    isEmail ? payload.email = identifier : payload.username = identifier;
    return api.post("/users/login", payload);
  },

  signup: (userData) => api.post("/users", userData),

  // User endpoints
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updateUserProfile: (userId, userData) => api.put(`/users/${userId}`, userData),

  // Post endpoints
  createPost: (postData) => api.post("/posts", postData),
  getPostsByUser: (userId) => api.get(`/posts/user/${userId}`),
  getAllPosts: () => api.get("/posts"),
  getPostById: (postId) => api.get(`/posts/${postId}`),
  updatePost: (postId, data) => api.put(`/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/posts/${postId}`),

  // Comment endpoints
  createComment: (postId, comment) => api.post(`/posts/${postId}/comments`, comment),
  
  // File upload
  uploadFiles: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
};

export default apiService;