import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import Navbar from '../../components/Navbar';

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    mediaUrls: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  const categories = ['Programming', 'Design', 'Business', 'Photography', 'Music', 'Cooking', 'Fitness', 'Language', 'Other'];

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      apiService.getUserProfile(userId)
        .then(user => setCurrentUser(user))
        .catch(() => setError("Failed to load user profile."));
    } else {
      navigate('/login', { state: { message: 'Please log in to continue' } });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = /^(image\/|video\/)/.test(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        setError("Only images and videos are allowed");
        return false;
      }
      
      if (!isValidSize) {
        setError("Files must be less than 10MB");
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    if (validFiles.length > 3) {
      setError("Maximum 3 files allowed");
      return;
    }
    
    setError(null);
    setUploadedFiles(validFiles);
    setPreviewUrls(validFiles.map(file => URL.createObjectURL(file)));
  };

  const handleRemovePreview = (index) => {
    const newFiles = [...uploadedFiles];
    const newPreviews = [...previewUrls];
    URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setUploadedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      let mediaUrls = [];
      if (uploadedFiles.length > 0) {
        const uploadResponse = await apiService.uploadFiles(uploadedFiles);
        mediaUrls = uploadResponse.urls || [];
      }
      
      const postData = {
        ...formData,
        mediaUrls,
        user: { id: currentUser.id }
      };
      
      const createdPost = await apiService.createPost(postData);
      navigate(`/posts/${createdPost.id}`);
    } catch (err) {
      setError("Failed to create post. Please try again.");
      console.error("Error creating post:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const renderPreview = (file, url, index) => {
    const isVideo = file.type.startsWith('video/');
    
    return (
      <div key={index} style={{
        position: "relative",
        width: "120px",
        height: "120px",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        {isVideo ? (
          <video 
            src={url} 
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
            controls
          />
        ) : (
          <img 
            src={url} 
            alt="Preview" 
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }} 
          />
        )}
        <button type="button" onClick={() => handleRemovePreview(index)} style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          backgroundColor: "#fff",
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          border: "1px solid #ddd",
          cursor: "pointer"
        }}>×</button>
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #e3f2fd, #fefefe)",
        padding: "80px 20px 50px",
        fontFamily: "'Poppins', sans-serif"
      }}>
        <div style={{
          maxWidth: "900px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.1)"
        }}>
          <button onClick={() => navigate(-1)} style={{
            background: "none",
            border: "none",
            color: "#1976d2",
            fontWeight: 500,
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "20px"
          }}>← Back</button>

          <h2 style={{ color: "#0d47a1", marginBottom: "20px" }}>Create New Post</h2>

          {error && <div style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "20px"
          }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={label}>Title</label>
              <input name="title" value={formData.title} onChange={handleChange} style={input} required />
            </div>

            <div>
              <label style={label}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required style={input}>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label style={label}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...input, height: "120px" }} required />
            </div>

            <div>
              <label style={label}>Upload Media (Images or Videos - Max 3 files, 10MB each)</label>
              <input 
                type="file" 
                onChange={handleFileChange} 
                multiple 
                accept="image/*,video/*"
                style={{ ...input, padding: "6px" }} 
              />
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div style={{ marginTop: "10px" }}>
                  <div style={{
                    width: "100%",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "4px",
                    height: "8px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${uploadProgress}%`,
                      backgroundColor: "#2196f3",
                      height: "100%"
                    }}></div>
                  </div>
                  <p style={{ textAlign: "center", fontSize: "12px", marginTop: "5px" }}>
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}
              
              {previewUrls.length > 0 && (
                <div style={{
                  display: "flex",
                  gap: "15px",
                  flexWrap: "wrap",
                  marginTop: "15px"
                }}>
                  {previewUrls.map((url, index) => renderPreview(uploadedFiles[index], url, index))}
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading} style={{
              backgroundColor: isLoading ? "#90caf9" : "#2196f3",
              color: "#fff",
              padding: "14px",
              fontSize: "16px",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.3s ease"
            }}>
              {isLoading ? "Creating..." : "Create Post"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const label = {
  display: "block",
  marginBottom: "6px",
  fontWeight: 500,
  color: "#0d47a1"
};

const input = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid #bbdefb",
  backgroundColor: "#f0f7ff",
  fontSize: "15px",
  outline: "none",
  transition: "border 0.3s ease"
};

export default CreatePost;