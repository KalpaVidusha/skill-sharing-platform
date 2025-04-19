import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api";

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
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
  }
);

const apiService = {
  // Authentication
  login: (identifier, password) => {
    const payload = identifier.includes('@') 
      ? { email: identifier, password }
      : { username: identifier, password };
    return api.post("/users/login", payload);
  },

  signup: (userData) => api.post("/users/signup", userData),

  // Users
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updateUserProfile: (userId, userData) => api.put(`/users/${userId}`, userData),
  getCurrentUser: () => api.get("/users/current"),

  // Posts
  createPost: (postData) => api.post("/posts", postData),
  getAllPosts: () => api.get("/posts"),
  getPostById: (postId) => api.get(`/posts/${postId}`),
  updatePost: (postId, data) => api.put(`/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  getPostsByUser: (userId) => api.get(`/posts/user/${userId}`),
  getPostsByCategory: (category) => api.get(`/posts/category/${category}`),
  searchPosts: (title) => api.get(`/posts/search?title=${title}`),

  // Files
  uploadFiles: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    
    // Use a different axios instance for file uploads
    return axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      withCredentials: true
    }).then(response => response.data);
  }
};

export default apiService;