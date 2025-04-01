import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api"; // Adjust as needed

export const login = (identifier, password) => {
  // Determine if identifier is email or username
  const isEmail = identifier.includes('@');
  
  const payload = { password };
  
  if (isEmail) {
    payload.email = identifier;
  } else {
    payload.username = identifier;
  }
  
  return axios.post(`${API_BASE_URL}/users/login`, payload);
};

export const signup = (userData) => {
  return axios.post(`${API_BASE_URL}/users`, userData);
};

// Additional API methods can be added here
export const getUserProfile = (userId) => {
  return axios.get(`${API_BASE_URL}/users/${userId}`);
};

export const updateUserProfile = (userId, userData) => {
  return axios.put(`${API_BASE_URL}/users/${userId}`, userData);
};