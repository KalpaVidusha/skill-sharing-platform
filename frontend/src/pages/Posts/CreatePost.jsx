import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import apiService from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

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

  // Process files with validation
  const processFiles = (files) => {
    // Convert FileList to Array
    const filesArray = Array.from(files);
    
    // Validate file types and sizes
    const validFiles = filesArray.filter(file => {
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
    
    // Check total number of files
    if (uploadedFiles.length + validFiles.length > 3) {
      setError("Maximum 3 files allowed");
      return;
    }
    
    setError(null);
    
    // Add new files to the existing ones
    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    // Create and add new preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    processFiles(e.target.files);
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set isDragging to false if we're leaving the drop area itself
    // not when leaving a child element of the drop area
    if (e.currentTarget === dropAreaRef.current) {
      setIsDragging(false);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePreview = (index) => {
    // Create copies of the arrays
    const newFiles = [...uploadedFiles];
    const newPreviews = [...previewUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    // Remove the items at the specified index
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    // Update state
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
        // Show some initial progress
        setUploadProgress(10);
        
        const uploadResponse = await apiService.uploadFiles(uploadedFiles);
        setUploadProgress(100);
        
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
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow min-h-screen bg-gradient-to-r from-blue-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-indigo-600 hover:text-indigo-500 font-medium mb-6"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>

          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create New Post</h2>

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

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Media (Images or Videos - Max 3 files, 10MB each)
              </label>
              
              {uploadedFiles.length === 0 ? (
                <div 
                  ref={dropAreaRef}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                    isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 border-dashed'
                  } rounded-md transition-colors duration-200`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    <FaImage className={`mx-auto h-12 w-12 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
                    <div className="flex justify-center text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload files</span>
                        <input 
                          id="file-upload" 
                          ref={fileInputRef}
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          onChange={handleFileChange}
                          accept="image/*,video/*"
                          multiple
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
                <div className="mt-1">
                  <div className="flex flex-wrap gap-4 mb-4">
                    {previewUrls.map((url, index) => {
                      const isVideo = uploadedFiles[index].type.startsWith('video/');
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
                              alt="Preview" 
                              className="max-h-full max-w-full object-cover"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePreview(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <FaTimesCircle className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                    
                    {uploadedFiles.length < 3 && (
                      <div 
                        ref={dropAreaRef}
                        className={`flex flex-col items-center justify-center w-32 h-32 border-2 ${
                          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 border-dashed'
                        } rounded-md cursor-pointer hover:bg-gray-50 transition-colors duration-200`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FaImage className={`h-8 w-8 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
                          <p className="text-xs text-gray-500 mt-1">Add more</p>
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                            multiple
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${isLoading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isLoading ? "Creating..." : "Create Post"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreatePost;