import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaImage, FaTimesCircle } from 'react-icons/fa';
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const categories = ['Programming', 'Design', 'Business', 'Photography', 'Music', 'Cooking', 'Fitness', 'Language', 'Other'];

  useEffect(() => {
    // Get current user ID
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      // If not logged in, redirect to login
      navigate('/login', { state: { from: `/edit-post/${id}` } });
      return;
    }

    const fetchPost = async () => {
      try {
        const post = await apiService.getPostById(id);
        
        // Check if the current user is the post owner
        if (post.user && post.user.id !== currentUserId) {
          setError('You are not authorized to edit this post');
          setIsAuthorized(false);
          return;
        }
        
        setIsAuthorized(true);
        setFormData({
          title: post.title,
          description: post.description,
          category: post.category,
          mediaUrls: post.mediaUrls || []
        });
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Post not found or you do not have permission to edit it');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check authorization before submitting
    if (!isAuthorized) {
      setError('You are not authorized to edit this post');
      return;
    }
    
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
      if (err.status === 403) {
        setError('You do not have permission to edit this post');
      } else {
        setError('Failed to update post. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const processFiles = useCallback((files) => {
    // Validate file types and sizes
    const validFiles = Array.from(files).filter(file => {
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
    const totalFilesAfterAdd = formData.mediaUrls.length + uploadedFiles.length + validFiles.length;
    if (totalFilesAfterAdd > 3) {
      setError(`You can have a maximum of 3 media files (current total: ${formData.mediaUrls.length + uploadedFiles.length})`);
      return;
    }
    
    setError(null);
    
    // Add new files to the uploadedFiles state
    setUploadedFiles(prevFiles => [...prevFiles, ...validFiles]);
    
    // Create preview URLs for newly added files
    const newPreviewUrls = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      isNew: true
    }));
    
    setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
  }, [formData.mediaUrls.length, uploadedFiles.length]);
  
  const handleFileChange = (e) => {
    processFiles(e.target.files);
  };

  const handleRemoveExistingMedia = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleRemoveNewMedia = (indexToRemove) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    
    // Also remove the preview URL
    setPreviewUrls(prevUrls => {
      const newUrls = [...prevUrls];
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(prevUrls[indexToRemove].url);
      return newUrls.filter((_, index) => index !== indexToRemove);
    });
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
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
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-white flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // If not authorized, show error page
  if (!isAuthorized && !loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-white pt-28 pb-20 px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-indigo-600 hover:text-indigo-500 font-medium mb-6"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>

            <div className="bg-red-50 text-red-700 p-6 rounded-md flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-center">You are not authorized to edit this post. Only the post owner can edit it.</p>
              <button 
                onClick={() => navigate('/posts')} 
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Go to Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate how many more files can be added
  const remainingFileSlots = 3 - (formData.mediaUrls.length + uploadedFiles.length);

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-white pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-indigo-600 hover:text-indigo-500 font-medium mb-6"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>

          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Post</h2>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32"
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Media
              </label>
              {formData.mediaUrls.length === 0 ? (
                <p className="text-gray-600">No media files attached</p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {formData.mediaUrls.map((url, index) => {
                    const isVideo = url.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
                    return (
                      <div key={`existing-${index}`} className="relative rounded-md overflow-hidden border border-gray-300 h-32 w-32 flex items-center justify-center">
                        {isVideo ? (
                          <video 
                            src={url} 
                            className="max-h-full max-w-full object-cover"
                            controls
                          />
                        ) : (
                          <img 
                            src={url} 
                            alt="Media preview" 
                            className="max-h-full max-w-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingMedia(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FaTimesCircle className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add New Media {(formData.mediaUrls.length > 0 || uploadedFiles.length > 0) && 
                  `(${remainingFileSlots} remaining)`}
              </label>
              
              {remainingFileSlots > 0 ? (
                <div 
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300'} border-dashed rounded-md relative`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex justify-center text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload files</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          onChange={handleFileChange}
                          accept="image/*,video/*"
                          multiple
                          disabled={remainingFileSlots <= 0}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, MP4 up to 10MB
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm italic">Maximum of 3 media files reached</p>
              )}
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-1">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}
              
              {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {previewUrls.map((preview, index) => {
                    const isVideo = preview.url.includes('video/') || preview.url.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
                    return (
                      <div key={`preview-${index}`} className="relative rounded-md overflow-hidden border border-gray-300 h-32 w-32 flex items-center justify-center">
                        {isVideo ? (
                          <video 
                            src={preview.url} 
                            className="max-h-full max-w-full object-cover"
                            controls
                          />
                        ) : (
                          <img 
                            src={preview.url} 
                            alt="Preview" 
                            className="max-h-full max-w-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveNewMedia(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FaTimesCircle className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${isSubmitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isSubmitting ? "Updating..." : "Update Post"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPost;