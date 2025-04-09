// src/services/PostService.js
import axios from "axios";

const API_BASE = "http://localhost:8080/api";

// ----- Comment APIs -----

export const getCommentsByPost = (postId) =>
  axios.get(`${API_BASE}/comments/post/${postId}`);

export const addComment = (comment) =>
  axios.post(`${API_BASE}/comments`, comment);

export const updateComment = (id, updated) =>
  axios.put(`${API_BASE}/comments/${id}`, updated);

export const deleteComment = (id) =>
  axios.delete(`${API_BASE}/comments/${id}`);

// ----- Like APIs -----

export const likePost = (likeData) =>
  axios.post(`${API_BASE}/likes`, likeData);

export const unlikePost = (likeId) =>
  axios.delete(`${API_BASE}/likes/${likeId}`);
