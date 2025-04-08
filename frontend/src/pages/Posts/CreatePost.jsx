// src/pages/Posts/CreatePost.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

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
  const [currentUser, setCurrentUser] = useState(null);

  // Categories for dropdown
  const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Photography', 'Music', 'Cooking', 'Fitness', 'Language', 'Other'];

  useEffect(() => {
    // Get current user information from localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      apiService.getUserProfile(userId)
        .then(user => {
          setCurrentUser(user);
        })
        .catch(error => {
          console.error('Failed to fetch user data:', error);
          setError('Unable to retrieve user information. Please log in again.');
        });
    } else {
      navigate('/login', { state: { message: 'Please log in to create a post' } });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);
    
    // Create preview URLs for images
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  };

  const handleRemovePreview = (index) => {
    const newFiles = [...uploadedFiles];
    const newPreviews = [...previewUrls];
    
    // Release the object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setUploadedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let mediaUrls = [];
      
      // Upload files if any
      if (uploadedFiles.length > 0) {
        const uploadResponse = await apiService.uploadFiles(uploadedFiles);
        mediaUrls = uploadResponse.fileUrls || [];
      }
      
      // Create the post with user reference
      const postData = {
        ...formData,
        mediaUrls,
        user: { id: currentUser.id } // Just need the ID for reference
      };
      
      const createdPost = await apiService.createPost(postData);
      
      // Redirect to the post detail page
      navigate(`/posts/${createdPost.id}`);
    } catch (err) {
      setError('Failed to create post: ' + (err.message || 'Unknown error'));
      console.error('Post creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.headerRow}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 style={styles.title}>Create New Post</h1>
        </div>

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter a descriptive title"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="Describe your post in detail"
              rows="8"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Media (Optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              style={styles.fileInput}
              multiple
              accept="image/*"
            />
            
            {previewUrls.length > 0 && (
              <div style={styles.previewContainer}>
                {previewUrls.map((url, index) => (
                  <div key={index} style={styles.previewItem}>
                    <img src={url} alt="Preview" style={styles.previewImage} />
                    <button
                      type="button"
                      onClick={() => handleRemovePreview(index)}
                      style={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            style={isLoading ? {...styles.submitButton, ...styles.buttonDisabled} : styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '40px 20px'
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    padding: '30px'
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '30px'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#2684ff',
    cursor: 'pointer',
    fontSize: '16px',
    marginRight: '15px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  errorMessage: {
    padding: '12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#4b5563'
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    ':focus': {
      borderColor: '#3b82f6'
    }
  },
  select: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#fff',
    transition: 'border-color 0.3s ease',
    ':focus': {
      borderColor: '#3b82f6'
    }
  },
  textarea: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    resize: 'vertical',
    minHeight: '150px',
    transition: 'border-color 0.3s ease',
    ':focus': {
      borderColor: '#3b82f6'
    }
  },
  fileInput: {
    padding: '12px 0',
    fontSize: '14px'
  },
  previewContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    marginTop: '15px'
  },
  previewItem: {
    position: 'relative',
    width: '120px',
    height: '120px',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  removeButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '14px 24px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    ':hover': {
      backgroundColor: '#1976d2'
    }
  },
  buttonDisabled: {
    backgroundColor: '#90caf9',
    cursor: 'not-allowed'
  }
};

export default CreatePost;