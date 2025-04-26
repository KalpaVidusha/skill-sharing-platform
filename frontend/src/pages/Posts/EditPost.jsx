import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import Navbar from '../../components/Navbar';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    mediaUrls: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Programming', 'Design', 'Business', 'Photography', 'Music', 'Cooking', 'Fitness', 'Language', 'Other'];

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const post = await apiService.getPostById(id);
        setFormData({
          title: post.title,
          description: post.description,
          category: post.category,
          mediaUrls: post.mediaUrls || []
        });
      } catch (err) {
        setError('Post not found');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Upload any new files first
      let newMediaUrls = [...formData.mediaUrls]; // Start with existing URLs that weren't removed
      
      if (uploadedFiles.length > 0) {
        setUploadProgress(10);
        const uploadResponse = await apiService.uploadFiles(uploadedFiles);
        setUploadProgress(100);
        
        if (uploadResponse.urls && uploadResponse.urls.length > 0) {
          newMediaUrls = [...newMediaUrls, ...uploadResponse.urls];
        }
      }
      
      // Update the post with both existing and new media URLs
      const updatedData = {
        ...formData,
        mediaUrls: newMediaUrls
      };
      
      await apiService.updatePost(id, updatedData);
      navigate(`/posts/${id}`);
    } catch (err) {
      console.error('Failed to update post:', err);
      setError('Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    
    // Check total files (existing + new) doesn't exceed 3
    if (formData.mediaUrls.length + validFiles.length > 3) {
      setError(`You can have a maximum of 3 media files (${formData.mediaUrls.length} existing + ${validFiles.length} new)`);
      return;
    }
    
    setError(null);
    setUploadedFiles(prevFiles => [...prevFiles, ...validFiles]);
    
    // Create preview URLs for newly added files
    const newPreviewUrls = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      isNew: true
    }));
    
    setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
  };

  const handleRemoveExistingMedia = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleRemoveNewMedia = (indexToRemove) => {
    // Calculate the actual index in the uploadedFiles array
    setUploadedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    
    // Also remove the preview URL
    setPreviewUrls(prevUrls => {
      const newUrls = [...prevUrls];
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(newUrls[indexToRemove].url);
      return newUrls.filter((_, index) => index !== indexToRemove);
    });
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(item => {
        if (item.isNew) URL.revokeObjectURL(item.url);
      });
    };
  }, [previewUrls]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to right, #e3f2fd, #fefefe)"
        }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "5px solid #f3f3f3",
            borderTop: "5px solid #2196f3",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  const renderMediaPreview = (url, index, isExisting = true) => {
    const isVideo = typeof url === 'string' ? 
      url.match(/\.(mp4|webm|ogg)(\?.*)?$/i) : 
      url.url.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
    
    const displayUrl = isExisting ? url : url.url;
    
    return (
      <div key={index} style={{
        position: "relative",
        width: "120px",
        height: "120px",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        margin: "10px"
      }}>
        {isVideo ? (
          <video 
            src={displayUrl} 
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
            controls
          />
        ) : (
          <img 
            src={displayUrl} 
            alt="Media preview" 
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }} 
          />
        )}
        <button type="button" 
          onClick={() => isExisting ? handleRemoveExistingMedia(index) : handleRemoveNewMedia(index)} 
          style={{
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
          }}
        >×</button>
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

          <h2 style={{ color: "#0d47a1", marginBottom: "20px" }}>Edit Post</h2>

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
              <label style={label}>Current Media</label>
              {formData.mediaUrls.length === 0 ? (
                <p style={{ color: "#666" }}>No media files attached</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {formData.mediaUrls.map((url, index) => renderMediaPreview(url, index))}
                </div>
              )}
            </div>

            <div>
              <label style={label}>
                Add New Media {formData.mediaUrls.length > 0 && `(${3 - formData.mediaUrls.length} remaining)`}
              </label>
              <input 
                type="file" 
                onChange={handleFileChange} 
                multiple 
                accept="image/*,video/*"
                style={{ ...input, padding: "6px" }}
                disabled={formData.mediaUrls.length >= 3}
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
                  {previewUrls.map((preview, index) => renderMediaPreview(preview, index, false))}
                </div>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} style={{
              backgroundColor: isSubmitting ? "#90caf9" : "#2196f3",
              color: "#fff",
              padding: "14px",
              fontSize: "16px",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "background-color 0.3s ease"
            }}>
              {isSubmitting ? "Updating..." : "Update Post"}
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

export default EditPost;