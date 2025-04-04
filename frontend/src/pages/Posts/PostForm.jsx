import React, { useState } from 'react';
import api from '../../services/api';

const PostForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('coding');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 3) {
      setError('Maximum 3 files allowed');
      return;
    }
    setError('');
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Upload files first
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Create post object
      const postData = {
        title,
        description,
        category,
        mediaUrls: uploadRes.data.urls,
        userId: localStorage.getItem('userId') // Get from auth
      };

      onSubmit(postData);
    } catch (err) {
      console.error('Post creation failed:', err);
      setError('Failed to create post. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="coding">Coding</option>
          <option value="cooking">Cooking</option>
          <option value="photography">Photography</option>
          <option value="diy">DIY Crafts</option>
        </select>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Upload Media (max 3 files)</label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          accept="image/*, video/*"
        />
        <div className="file-preview">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              {file.name} ({Math.round(file.size / 1024)} KB)
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="submit-button">
        Share Post
      </button>
    </form>
  );
};

export default PostForm;