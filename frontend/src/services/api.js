import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

// Helper function to derive recent chats from messages
const fetchDerivedRecentChats = async (currentUserId) => {
  try {
    console.log("Generating derived recent chats list...");
    
    // First get all users
    const usersResponse = await api.get("/users");
    const allUsers = Array.isArray(usersResponse) ? usersResponse : [];
    
    // Filter out current user
    const otherUsers = allUsers.filter(user => user.id !== currentUserId);
    
    if (otherUsers.length === 0) {
      console.log("No other users found to chat with");
      return [];
    }
    
    // For each user, try to get chat history
    const recentChats = [];
    
    // Use Promise.all for parallel processing
    const chatPromises = otherUsers.map(async (user) => {
      try {
        const messages = await api.get(
          `/chat/messages/${currentUserId}?otherUserId=${user.id}`
        );
        
        if (Array.isArray(messages) && messages.length > 0) {
          // Get the most recent message
          const lastMessage = messages[messages.length - 1];
          
          recentChats.push({
            userId: user.id,
            username: user.username,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            profilePicture: user.profilePicture || "",
            lastMessage: lastMessage.content,
            timestamp: lastMessage.createdAt || new Date(),
            isRead: true
          });
        }
      } catch (err) {
        console.log(`No messages with user ${user.username}`);
      }
    });
    
    // Wait for all promises to resolve
    await Promise.all(chatPromises);
    
    console.log("Derived recent chats:", recentChats);
    return recentChats;
  } catch (error) {
    console.error("Error generating derived recent chats:", error);
    return [];
  }
};

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
          
          // Store user roles if available
          if (data.roles) {
            localStorage.setItem("userRoles", JSON.stringify(data.roles));
          }
          
          return data;
        } else if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.id || data.userId);
          localStorage.setItem("username", data.username);
          localStorage.setItem("email", data.email);
          localStorage.setItem("isLoggedIn", "true");
          
          // Store user roles if available
          if (data.roles) {
            localStorage.setItem("userRoles", JSON.stringify(data.roles));
          }
          
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
    localStorage.removeItem("userRoles");
    
    // Force clear any browser cache for authenticated routes
    if (window.history && window.history.pushState) {
      // Add a random parameter to the URL to prevent browser caching
      window.history.pushState({}, "", 
        window.location.href.split("?")[0] + "?logout=" + Date.now());
    }
    
    // Return a resolved promise to allow chaining
    return Promise.resolve({ success: true });
  },

  // Users
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  getUserById: (userId) => api.get(`/users/${userId}`),
  updateUserProfile: (userId, userData) => api.put(`/users/${userId}`, userData),
  
  // Password verification and change
  verifyPassword: (userId, currentPassword) => {
    return api.post(`/users/${userId}/verify-password`, { password: currentPassword });
  },
  
  changePassword: (userId, passwordData) => {
    return api.post(`/users/${userId}/change-password`, passwordData);
  },
  
  // Follow/Unfollow functionality with multiple implementation attempts
  followUser: (targetUserId) => {
    const currentUserId = localStorage.getItem('userId');
    console.log(`Current user ${currentUserId} following user with ID: ${targetUserId}`);
    
    // Format: /{userId}/follow/{userToFollowId}
    return api.post(`/users/${currentUserId}/follow/${targetUserId}`);
  },
  
  unfollowUser: (targetUserId) => {
    const currentUserId = localStorage.getItem('userId');
    console.log(`Current user ${currentUserId} unfollowing user with ID: ${targetUserId}`);
    
    // Format: /{userId}/unfollow/{userToUnfollowId}
    return api.post(`/users/${currentUserId}/unfollow/${targetUserId}`);
  },
  
  getFollowers: (userId) => 
    api.get(`/users/${userId}/followers`),
  
  getFollowing: (userId) => 
    api.get(`/users/${userId}/following`),
  
  // Add isFollowing check function
  isFollowing: (currentUserId, targetUserId) => {
    console.log(`Checking if user ${currentUserId} is following user ${targetUserId}`);
    return api.get(`/users/${currentUserId}/following/${targetUserId}`)
      .then(response => {
        return { isFollowing: response.isFollowing || false };
      })
      .catch(error => {
        console.error("Error checking follow status:", error);
        return { isFollowing: false };
      });
  },
  
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
  },
  
  // Progress Updates
  getProgressTemplates: () => api.get("/progress/templates"),
  getAllProgress: (userId) => userId ? api.get(`/progress?userId=${userId}`) : api.get("/progress"),
  getProgressById: (progressId) => api.get(`/progress/${progressId}`),
  createProgress: (progressData) => api.post("/progress", progressData),
  updateProgress: (progressId, progressData) => api.put(`/progress/${progressId}`, progressData),
  deleteProgress: (progressId) => api.delete(`/progress/${progressId}`),
  
  // Progress Likes
  likeProgress: (progressId) => api.post(`/progress/${progressId}/like`),
  unlikeProgress: (progressId) => api.delete(`/progress/${progressId}/like`),
  
  // Progress Comments
  getProgressComments: (progressId) => api.get(`/progress/${progressId}/comments`),
    
  addProgressComment: (progressId, commentData) => {
    console.log(`Adding comment to progress ${progressId}:`, commentData);
    return api.post(`/progress/${progressId}/comments`, commentData)
      .catch(error => {
        console.error(`Error adding comment to progress ${progressId}:`, error);
        throw error;
      });
  },
  updateProgressComment: (commentId, commentData) => api.put(`/progress/comments/${commentId}`, commentData),
  deleteProgressComment: (commentId) => api.delete(`/progress/comments/${commentId}`),
  
  // Comment Replies
  getCommentReplies: (commentId) => api.get(`/progress/comments/${commentId}/replies`),
  addCommentReply: (commentId, replyData) => {
    console.log(`Adding reply to comment ${commentId}:`, replyData);
    return api.post(`/progress/comments/${commentId}/replies`, replyData)
      .catch(error => {
        console.error(`Error adding reply to comment ${commentId}:`, error);
        throw error;
      });
  },

  // Notifications
  getNotifications: () => api.get(`/notifications?t=${new Date().getTime()}`),
  getUnreadNotifications: () => api.get(`/notifications/unread?t=${new Date().getTime()}`),
  markNotificationAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllNotificationsAsRead: () => api.put("/notifications/read-all"),
  
  // Admin API
  admin: {
    getAllUsers: () => api.get("/admin/users"),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    promoteUserToAdmin: (userId) => api.put(`/admin/users/${userId}/promote`),
    demoteAdminToUser: (userId) => api.put(`/admin/users/${userId}/demote`),
    deleteAllPosts: () => api.delete("/admin/posts"),
    deleteAllProgress: () => api.delete("/admin/progress"),
    deleteAllComments: () => api.delete("/admin/comments"),
    // Individual item management
    deletePost: (postId) => api.delete(`/admin/posts/${postId}`),
    deleteProgressRecord: (progressId) => api.delete(`/admin/progress/${progressId}`),
    deleteComment: (commentId) => api.delete(`/admin/comments/${commentId}`)
  },
  
  // Helper function to check if user is admin
  isUserAdmin: () => {
    const userRoles = localStorage.getItem("userRoles");
    if (!userRoles) {
      return false;
    }
    
    try {
      const roles = JSON.parse(userRoles);
      return roles.includes("ROLE_ADMIN");
    } catch (error) {
      console.error("Error parsing user roles:", error);
      return false;
    }
  },

  // Chat API functions
  getChatUsers: () => {
    // This should return all available users to chat with
    const currentUserId = localStorage.getItem('userId');
    return api.get("/users")
      .then(response => {
        // Filter out the current user from the list
        return Array.isArray(response) 
          ? response.filter(user => user.id !== currentUserId)
          : [];
      })
      .catch(error => {
        console.error("Error fetching chat users:", error);
        return [];
      });
  },
  getMessages: (userId) => {
    const currentUserId = localStorage.getItem('userId');
    return api.get(`/chat/messages/${currentUserId}?otherUserId=${userId}`);
  },
  sendMessage: (recipientId, content) => {
    const senderId = localStorage.getItem('userId');
    // Prevent sending messages to self
    if (senderId === recipientId) {
      console.error("Cannot send message to yourself");
      return Promise.reject(new Error("Cannot send message to yourself"));
    }
    return api.post("/chat/messages", null, {
      params: {
        senderId,
        recipientId,
        content
      }
    });
  },
  editMessage: (messageId, content) => api.put(`/chat/messages/${messageId}`, null, {
    params: { content }
  }),
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),
  getRecentChats: () => {
    const currentUserId = localStorage.getItem('userId');
    // Explicitly log the API call for debugging
    console.log(`Fetching recent chats for user ${currentUserId}`);
    
    // Try the dedicated endpoint first
    return api.get(`/chat/users/${currentUserId}/recent`)
      .then(data => {
        console.log("Raw recent chats data:", data);
        if (data && Array.isArray(data) && data.length > 0) {
          // Filter out any self-chat entries
          return data.filter(chat => chat.userId !== currentUserId);
        }
        
        // If empty or not in expected format, fallback to derived recent chats
        console.log("No data from recent chats endpoint, falling back to messages");
        return fetchDerivedRecentChats(currentUserId);
      })
      .catch(error => {
        console.error("Error fetching recent chats:", error);
        // Fallback to derived recent chats on error
        return fetchDerivedRecentChats(currentUserId);
      });
  },

  // Learning Plans
  createLearningPlan: (planData, userId) => api.post(`/learning-plans?userId=${userId}`, planData),
  getLearningPlansByUser: (userId) => api.get(`/learning-plans/user/${userId}`),
  getLearningPlanById: (planId) => api.get(`/learning-plans/${planId}`),
  updateLearningPlan: (planId, planData) => api.put(`/learning-plans/${planId}`, planData),
  deleteLearningPlan: (planId) => api.delete(`/learning-plans/${planId}`),
};

export default apiService;