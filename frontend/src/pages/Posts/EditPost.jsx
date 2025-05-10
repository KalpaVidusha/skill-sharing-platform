import React, { useState, useEffect } from 'react';
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
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-white flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
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
                      <div key={index} className="relative rounded-md overflow-hidden border border-gray-300 h-32 w-32 flex items-center justify-center">
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
                Add New Media {formData.mediaUrls.length > 0 && `(${3 - formData.mediaUrls.length} remaining)`}
              </label>
              
              {formData.mediaUrls.length < 3 ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
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
                          disabled={formData.mediaUrls.length >= 3}
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
                    const isVideo = preview.url.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
                    return (
                      <div key={index} className="relative rounded-md overflow-hidden border border-gray-300 h-32 w-32 flex items-center justify-center">
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