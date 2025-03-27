import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api"; // Adjust as needed

export const login = (email, password) => {
  return axios.post(`${API_BASE_URL}/login`, { email, password });
};

export const signup = (email, password) => {
  return axios.post(`${API_BASE_URL}/signup`, { email, password });
};
