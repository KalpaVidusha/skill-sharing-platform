import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt, FaSyncAlt, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaRegLightbulb, FaUsers, FaPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import ProgressForm from "../../Progress/ProgressForm";
import ProgressLikeCommentOfUserdashnoard from "./ProgressLikeCommentOfUserdashnoard";
import apiService from "../../../services/api";
import Swal from 'sweetalert2';
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer"; 


// Helper function to check for valid date
function isValidDate(date) {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}


// Helper function to get the display name for a user
const getDisplayName = (user) => {
  if (!user) return localStorage.getItem('username') || "You";
  
  // Prioritize full name if available
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  } else if (user.firstName) {
    return user.firstName;
  } else if (user.lastName) {
    return user.lastName;
  } else {
    return user.username || user.name || "You";
  }
};

// Helper function to get initials for avatar
const getUserInitials = (user) => {
  if (!user) {
    const username = localStorage.getItem('username');
    if (username) {
      const parts = username.split(' ');
      if (parts.length > 1) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return username.charAt(0).toUpperCase();
    }
    return "U";
  }
  
  // Use first letter of first name and first letter of last name if available
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  } else if (user.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  } else if (user.lastName) {
    return user.lastName.charAt(0).toUpperCase();
  } else if (user.username) {
    return user.username.charAt(0).toUpperCase();
  } else if (user.name) {
    const parts = user.name.split(' ');
    if (parts.length > 1) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
  } else {
    return "U";
  }
};

const ProgreesOfUserdashboard = (props) => {
  // Always call useNavigate hook unconditionally
  const navigateHook = useNavigate();
  // Use props.navigate if provided, otherwise use the hook result
  const navigate = props.navigate || navigateHook;
  
  const [userData, setUserData] = useState(props.userData || {
    name: "",
    email: "",
    followers: 0,
    following: 0
  });
  
  const [userProgress, setUserProgress] = useState([]);
  const [editingProgress, setEditingProgress] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [progressToDelete, setProgressToDelete] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("progress_tracker");
  const [loading, setLoading] = useState(!props.userData);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Function to fetch user progress data - extracted so it can be called to refresh
  const fetchUserProgressData = async () => {
    try {
      setIsRefreshing(true);
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      console.log("Fetching progress data for user:", userId);
      const progressResponse = await apiService.getAllProgress(userId);
      console.log("Progress response:", progressResponse);
      
      if (progressResponse && Array.isArray(progressResponse)) {
        // Sort progress based on current sort order
        const sortedProgress = sortProgressByDate(progressResponse, sortOrder);
        
        // Create a batch of promises to fetch comments and replies for each progress update
        const progressWithInteractionsPromises = sortedProgress.map(async (prog) => {
          // Just fetch basic comment count for display in the progress list
          let commentCount = prog.commentCount || 0;
          
          return {
            ...prog,
            comments: prog.comments || [],
            likes: prog.likes || [],
            likeCount: prog.likes ? prog.likes.length : 0,
            commentCount: commentCount
          };
        });
        
        // Wait for all progress items to be processed
        const progressWithInteractions = await Promise.all(progressWithInteractionsPromises);
        console.log("Progress with interactions:", progressWithInteractions);
        
        setUserProgress(progressWithInteractions);
      } else {
        console.error("Invalid progress response:", progressResponse);
      }
    } catch (error) {
      console.error('Error fetching user progress data:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load progress data. Please try again later.',
        icon: 'error',
        timer: 3000
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper function to sort progress by date
  const sortProgressByDate = (progress, order) => {
    return [...progress].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  // Function to handle sort order change
  const handleSortOrderChange = (order) => {
    setSortOrder(order);
    setUserProgress(sortProgressByDate(userProgress, order));
    setCurrentPage(1); // Reset to first page when sort order changes
  };

  // Function to fetch progress templates for formatting
  const fetchProgressTemplates = async () => {
    try {
      const templatesData = await apiService.getProgressTemplates();
      if (templatesData) {
        localStorage.setItem('progressTemplates', JSON.stringify(templatesData));
      }
    } catch (error) {
      console.error('Error fetching progress templates:', error);
    }
  };

  // Add a function to fetch user data if not provided through props
  const fetchUserData = async () => {
    if (props.userData) return; // Skip if user data is provided
    
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login');
        return;
      }
      
      // Get basic user info from localStorage
      const username = localStorage.getItem('username');
      const email = localStorage.getItem('email');
      
      // Fetch followers and following counts
      let followersCount = 0;
      let followingCount = 0;
      try {
        const followersResponse = await apiService.getFollowers(userId);
        const followingResponse = await apiService.getFollowing(userId);
        
        if (followersResponse && followersResponse.count) {
          followersCount = followersResponse.count;
        }
        
        if (followingResponse && followingResponse.count) {
          followingCount = followingResponse.count;
        }
      } catch (error) {
        console.error("Error fetching follow data:", error);
      }
      
      setUserData({
        name: username || 'User',
        email: email || 'user@example.com',
        followers: followersCount,
        following: followingCount
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modify useEffect to call fetchUserData
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    fetchUserData();
    fetchUserProgressData();
    fetchProgressTemplates();
  }, [navigate]);

  // Get current progress items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProgressItems = userProgress.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < Math.ceil(userProgress.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Helper function to format progress content
  const formatProgressContent = (progress, customFields = null) => {
    if (!progress || (!progress.content && !customFields)) return '';
    
    try {
      // Use custom fields if provided (for preview), otherwise use progress.content
      const contentToFormat = customFields || progress.content;
      
      // If content is already a string, return it
      if (typeof contentToFormat === 'string') {
        return contentToFormat;
      }
      
      // If content has a customContent field, use that
      if (contentToFormat.customContent) {
        return contentToFormat.customContent;
      }
      
      // If content is an object with field values
      if (typeof contentToFormat === 'object') {
        // Get template from localStorage
        const templates = JSON.parse(localStorage.getItem('progressTemplates') || '{}');
        const template = progress.templateType && templates[progress.templateType];
        
        if (template && template.format) {
          let formattedContent = template.format;
          
          // Replace placeholders with values
          Object.keys(contentToFormat).forEach(field => {
            const placeholder = `{${field}}`;
            const value = contentToFormat[field] || '';
            formattedContent = formattedContent.replace(placeholder, value);
          });
          
          return formattedContent;
        }
        
        // Fallback if template not found - create a basic formatted string
        return Object.entries(contentToFormat)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      }
      
      return JSON.stringify(contentToFormat);
    } catch (error) {
      console.error('Error formatting progress content:', error);
      return 'Progress update';
    }
  };

  // Render the media content (image or GIF)
  const renderMedia = (progress) => {
    if (!progress.mediaUrl) return null;
    
    return (
      <div className="mt-3 mb-4">
        <img 
          src={progress.mediaUrl.startsWith('http') ? progress.mediaUrl : `${process.env.PUBLIC_URL}${progress.mediaUrl}`} 
          alt="Progress media" 
          className="rounded-lg max-h-80 max-w-full mx-auto object-contain" 
        />
      </div>
    );
  };

  // Edit progress function
  const handleEditProgress = (progressId) => {
    const progressToEdit = userProgress.find(p => p.id === progressId);
    if (!progressToEdit) return;
    
    setEditingProgress(progressToEdit);
    
    // Initialize form data based on the progress type
    if (progressToEdit.templateType === 'completed_tutorial') {
      setEditFormData({
        tutorialName: progressToEdit.content.tutorialName || ''
      });
    } else if (progressToEdit.templateType === 'new_skill') {
      setEditFormData({
        skillName: progressToEdit.content.skillName || ''
      });
    } else if (progressToEdit.templateType === 'learning_goal') {
      setEditFormData({
        goalName: progressToEdit.content.goalName || '',
        targetDate: progressToEdit.content.targetDate || ''
      });
    } else if (progressToEdit.content && typeof progressToEdit.content === 'object') {
      setEditFormData({...progressToEdit.content});
    }

    // Check if there's existing media
    if (progressToEdit.mediaUrl) {
      setPreviewUrl(null); // Reset any new preview
    }
  };

  const cancelEdit = () => {
    setEditingProgress(null);
    setEditFormData({});
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection for edit form
  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type and size
    const isValidType = file.type.startsWith('image/');
    const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
    
    if (!isValidType) {
      Swal.fire({
        title: 'Error',
        text: 'Only image files are allowed',
        icon: 'error',
        timer: 3000
      });
      return;
    }
    
    if (!isValidSize) {
      Swal.fire({
        title: 'Error',
        text: 'Images must be less than 5MB',
        icon: 'error',
        timer: 3000
      });
      return;
    }
    
    setUploadedFile(file);
    
    // Create and set preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Remove file from edit form
  const handleRemoveEditFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  // Generate preview of edited content
  const getEditPreview = () => {
    if (!editingProgress) return '';
    
    let previewText = '';
    
    switch (editingProgress.templateType) {
      case 'completed_tutorial':
        previewText = `✅ I completed ${editFormData.tutorialName || 'a tutorial'} today!`;
        break;
      case 'new_skill':
        previewText = `🎯 Today I learned about ${editFormData.skillName || 'a new skill'}`;
        break;
      case 'learning_goal':
        previewText = `📅 I aim to finish ${editFormData.goalName || 'my goal'} by ${editFormData.targetDate || 'the deadline'}`;
        break;
      default:
        // Try to create a generic representation of the content
        if (editFormData && typeof editFormData === 'object') {
          previewText = Object.entries(editFormData)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        } else {
          previewText = 'Progress update';
        }
    }
    
    return previewText;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!editingProgress) return;
      
      setIsSubmitting(true); // Start loading state
      
      let mediaUrl = editingProgress.mediaUrl; // Keep existing media URL by default
      
      // Upload new image if selected
      if (uploadedFile) {
        setUploading(true);
        try {
          const uploadResponse = await apiService.uploadFiles([uploadedFile]);
          if (uploadResponse && uploadResponse.urls && uploadResponse.urls.length > 0) {
            mediaUrl = uploadResponse.urls[0];
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to upload image',
            icon: 'error',
            timer: 3000
          });
        } finally {
          setUploading(false);
        }
      }
      
      // Create updated progress with new content and media URL
      const updatedProgress = {
        ...editingProgress,
        content: editFormData,
        mediaUrl: mediaUrl
      };
      
      await apiService.updateProgress(editingProgress.id, updatedProgress);
      
      // Refresh progress data from server
      fetchUserProgressData();
      
      Swal.fire({
        title: 'Success',
        text: 'Progress updated successfully!',
        icon: 'success',
        timer: 2000
      });
      
      // Clear edit state
      setEditingProgress(null);
      setEditFormData({});
      handleRemoveEditFile();
    } catch (error) {
      console.error('Error updating progress:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update progress: ' + (error.message || 'Unknown error'),
        icon: 'error',
        timer: 3000
      });
    } finally {
      setIsSubmitting(false); // End loading state
    }
  };

  // Render edit form separately
  const renderEditForm = () => {
    if (!editingProgress) return null;
    
    return (
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={cancelEdit}></div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          {/* Modal content */}
          <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Edit Progress Update
              </h3>
              
              <form onSubmit={handleEditSubmit}>
                {editingProgress.templateType === 'completed_tutorial' && (
                  <div className="mb-4">
                    <label htmlFor="tutorialName" className="block text-sm font-medium text-gray-700 mb-1">
                      Tutorial Name
                    </label>
                    <input
                      type="text"
                      id="tutorialName"
                      name="tutorialName"
                      value={editFormData.tutorialName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                )}
                
                {editingProgress.templateType === 'new_skill' && (
                  <div className="mb-4">
                    <label htmlFor="skillName" className="block text-sm font-medium text-gray-700 mb-1">
                      Skill Name
                    </label>
                    <input
                      type="text"
                      id="skillName"
                      name="skillName"
                      value={editFormData.skillName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                )}
                
                {/* Add photo upload section */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Update Photo (optional)
                  </label>
                  
                  {/* Show current photo if exists */}
                  {editingProgress.mediaUrl && !previewUrl && (
                    <div className="mb-2 flex justify-center">
                      <img 
                        src={editingProgress.mediaUrl.startsWith('http') ? editingProgress.mediaUrl : `${process.env.PUBLIC_URL}${editingProgress.mediaUrl}`}
                        alt="Current progress media"
                        className="rounded-lg max-h-40 object-contain"
                      />
                    </div>
                  )}
                  
                  {/* Show preview of new photo if selected */}
                  {previewUrl && (
                    <div className="mb-2 flex justify-center">
                      <img 
                        src={previewUrl}
                        alt="New progress media preview"
                        className="rounded-lg max-h-40 object-contain"
                      />
                    </div>
                  )}
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex justify-center text-sm text-gray-600">
                        <label htmlFor="edit-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload a new photo</span>
                          <input 
                            id="edit-file-upload" 
                            name="edit-file-upload" 
                            type="file" 
                            className="sr-only" 
                            onChange={handleEditFileChange}
                            accept="image/*"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                  
                  {/* Remove photo button */}
                  {(editingProgress.mediaUrl || previewUrl) && (
                    <div className="flex justify-center mt-2">
                      <button
                        type="button"
                        onClick={handleRemoveEditFile}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove photo
                      </button>
                    </div>
                  )}
                </div>
                
                {editingProgress.templateType === 'learning_goal' && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="goalName" className="block text-sm font-medium text-gray-700 mb-1">
                        Goal Name
                      </label>
                      <input
                        type="text"
                        id="goalName"
                        name="goalName"
                        value={editFormData.goalName || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Target Date
                      </label>
                      <input
                        type="date"
                        id="targetDate"
                        name="targetDate"
                        value={editFormData.targetDate || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </>
                )}
                
                {!['completed_tutorial', 'new_skill', 'learning_goal'].includes(editingProgress.templateType) && 
                  editFormData && typeof editFormData === 'object' && Object.keys(editFormData).map(key => (
                    <div key={key} className="mb-4">
                      <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        id={key}
                        name={key}
                        value={editFormData[key] || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  ))
                }
                
                {/* Preview Section */}
                <div className="mt-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                  <p className="text-gray-800">{getEditPreview()}</p>
                  
                  {/* Special display for target date in learning goals */}
                  {editingProgress.templateType === 'learning_goal' && editFormData.targetDate && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>Target date: {editFormData.targetDate}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={isSubmitting || uploading}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploading}
                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting || uploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle delete progress
  const handleDeleteProgress = (progressId) => {
    setProgressToDelete(progressId);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProgressToDelete(null);
  };

  const deleteProgress = async (progressId) => {
    try {
      await apiService.deleteProgress(progressId);
      setUserProgress(userProgress.filter(progress => progress.id !== progressId));
      setShowDeleteModal(false);
      setProgressToDelete(null);
    } catch (error) {
      console.error('Error deleting progress:', error);
    }
  };

  // Add these functions if they don't already exist
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const showLogoutConfirmation = () => {
    Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      background: '#ffffff',
      backdrop: 'rgba(79, 70, 229, 0.1)'
    }).then((result) => {
      if (result.isConfirmed) {
        performLogout();
      }
    });
  };

  const performLogout = () => {
    import('../../../services/api').then(module => {
      const apiService = module.default;
      apiService.logout().then(() => {
        navigate('/login');
      });
    });
  };

  const handleAddPost = () => navigate("/add-post");

  // Maintain existing render content but wrap it with the dashboard layout
  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-r from-blue-50 to-white">
        {/* Sidebar - Make it fixed position */}
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          {props.sidebar || (
            <Sidebar defaultActiveTab="progress_tracker" />
          )}
        </div>
        <main className="flex-1 p-8 overflow-y-auto">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-blue-900">Your Learning Progress</h1>
            <button
              onClick={fetchUserProgressData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white transition duration-300 bg-blue-600 border-none rounded-lg hover:bg-blue-700"
            >
              {isRefreshing ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <FaSyncAlt className="mr-1" /> Refresh Progress
                </>
              )}
            </button>
          </header>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <ProgressForm onSubmitSuccess={fetchUserProgressData} />
            </div>
            
            <div className="md:col-span-1">
              <div className="p-5 mb-6 bg-white shadow-md rounded-xl">
                <h3 className="mb-3 text-lg font-semibold text-blue-500">Progress Tips</h3>
                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                  <li>Regular updates help track your learning journey</li>
                  <li>Share specific achievements and milestones</li>
                  <li>Reflect on challenges you've overcome</li>
                  <li>Set goals for your next learning sprint</li>
                </ul>
              </div>
            </div>
          </div>
          
          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                All Progress Updates 
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({userProgress.length} {userProgress.length === 1 ? 'entry' : 'entries'})
                </span>
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-600">Sort by:</span>
                  <select 
                    value={sortOrder}
                    onChange={(e) => handleSortOrderChange(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
                <button
                  onClick={fetchUserProgressData}
                  disabled={isRefreshing}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  {isRefreshing ? (
                    <>
                      <div className="w-3 h-3 mr-1 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <FaSyncAlt className="mr-1" /> Refresh
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 bg-white/80 backdrop-blur-lg rounded-xl shadow-md border border-white/70">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 mt-4 animate-pulse">Loading your progress updates...</p>
              </div>
            ) : userProgress.length === 0 ? (
              <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-lg rounded-xl shadow-md border border-white/70 p-16 text-center">
                <div className="p-4 rounded-full bg-blue-100 mb-6">
                  <FaRegLightbulb className="text-6xl text-blue-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Start Tracking Your Progress</h2>
                
                <p className="text-gray-600 max-w-lg mb-8 leading-relaxed">
                  Share your learning achievements, milestones, and skills with the community. Regular updates help you track your growth and inspire others.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mb-8">
                  <div className="flex items-start p-4 bg-blue-50/80 rounded-lg">
                    <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full mr-3">
                      <FaRegLightbulb className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800">Celebrate Achievements</h3>
                      <p className="text-sm text-gray-600 mt-1">Share your victories, no matter how small</p>
                    </div>
                  </div>
                  <div className="flex items-start p-4 bg-blue-50/80 rounded-lg">
                    <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full mr-3">
                      <FaUsers className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800">Connect With Others</h3>
                      <p className="text-sm text-gray-600 mt-1">Build your network and learn together</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => document.querySelector('.progress-form-container')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  <FaPlus /> Share Your First Progress Update
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 gap-4 mb-6">
                  {currentProgressItems.map((progress) => (
                    <div
                      key={progress.id}
                      className="border border-gray-200 rounded-lg overflow-hidden max-w-2xl w-full bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 bg-blue-500 rounded-full text-white flex items-center justify-center font-bold mr-3 cursor-pointer transition transform hover:scale-105"
                          >
                            {getUserInitials(progress.user)}
                          </div>
                          <div className="flex flex-col">
                            <div className="font-semibold text-blue-700 hover:text-blue-500 cursor-pointer">
                              {getDisplayName(progress.user)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {isValidDate(progress.createdAt)
                                ? formatDistanceToNow(new Date(progress.createdAt), { addSuffix: true })
                                : "Invalid date"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditProgress(progress.id)}
                            className="flex items-center px-2 py-1 text-sm text-blue-600 rounded-md hover:text-blue-800 bg-blue-50 hover:bg-blue-100"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProgress(progress.id)}
                            className="flex items-center px-2 py-1 text-sm text-red-600 rounded-md hover:text-red-800 bg-red-50 hover:bg-red-100"
                          >
                            <FaTrashAlt className="mr-1" /> Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="px-4 py-3">
                        <p className="text-gray-800">
                          {progress.formattedContent || formatProgressContent(progress)}
                        </p>
                        
                        {/* Display target date separately for learning goals */}
                        {progress.templateType === 'learning_goal' && progress.content.targetDate && (
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <FaCalendarAlt className="mr-1" />
                            <span>Target date: {progress.content.targetDate}</span>
                          </div>
                        )}
                        
                        {/* Display media content if available */}
                        {renderMedia(progress)}
                        
                        {/* Like and comment component remains the same */}
                        <ProgressLikeCommentOfUserdashnoard 
                          progress={progress} 
                          onProgressUpdate={(updatedProgress) => {
                            setUserProgress(userProgress.map(p => 
                              p.id === updatedProgress.id ? updatedProgress : p
                            ));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {userProgress.length > itemsPerPage && (
                  <div className="flex justify-center mt-6">
                    <nav className="flex items-center justify-center">
                      <button 
                        onClick={prevPage} 
                        disabled={currentPage === 1}
                        className={`mx-1 px-3 py-1 rounded flex items-center ${
                          currentPage === 1 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        <FaChevronLeft className="mr-1" /> Previous
                      </button>
                      
                      {/* Page number buttons */}
                      {[...Array(Math.ceil(userProgress.length / itemsPerPage)).keys()].map(number => (
                        <button
                          key={number + 1}
                          onClick={() => paginate(number + 1)}
                          className={`mx-1 px-3 py-1 rounded ${
                            currentPage === number + 1
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {number + 1}
                        </button>
                      ))}
                      
                      <button 
                        onClick={nextPage} 
                        disabled={currentPage === Math.ceil(userProgress.length / itemsPerPage)}
                        className={`mx-1 px-3 py-1 rounded flex items-center ${
                          currentPage === Math.ceil(userProgress.length / itemsPerPage)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        Next <FaChevronRight className="ml-1" />
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
      
      {/* Edit modal */}
      {editingProgress && renderEditForm()}
      
      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={cancelDelete}></div>

            {/* This element is to trick the browser into centering the modal contents */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal content */}
            <div className="inline-block overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="w-6 h-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Progress Update</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this progress update? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => deleteProgress(progressToDelete)}
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProgreesOfUserdashboard; 