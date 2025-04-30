import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus, FaUser, FaSignOutAlt, FaChartLine,
  FaFileAlt, FaComments, FaCompass, FaSearch, FaUsers,
  FaEdit, FaTrashAlt, FaSort, FaCalendarAlt, FaSave, FaSyncAlt,
  FaChevronLeft, FaChevronRight,FaBellSlash,FaChartPie,
  FaThumbsUp, FaRegThumbsUp, FaRegComment, FaPaperPlane
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import FollowList from "../components/FollowList";
import UserSearch from "../components/UserSearch";
import ProgressForm from "./Progress/ProgressForm";
import apiService from "../services/api";
import Swal from 'sweetalert2';

const UserDashboard = () => {
  const [animate, setAnimate] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    memberSince: "",
    posts: 0,
    likesReceived: 0,
    comments: 0,
    followers: 0,
    following: 0,
    recentPosts: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [userProgress, setUserProgress] = useState([]);
  const [editingProgress, setEditingProgress] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [progressToDelete, setProgressToDelete] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const navigate = useNavigate();

  // Function to fetch user data - extracted so it can be called to refresh
  const fetchUserData = async () => {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userId = localStorage.getItem('userId');
      
      if (!isLoggedIn || !userId) {
        Swal.fire({
          title: 'Access Required',
          html: `
            <div class="text-center">
              <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">
                Welcome to <span class="text-indigo-600 font-extrabold">SkillSphere</span>
              </h3>
              <p class="text-base text-gray-700 font-medium tracking-wide mb-2">
                Please sign in to continue your learning journey
              </p>
              <p class="text-sm text-gray-500 font-medium tracking-tight">
                Don't have an account? Join us today!
              </p>
            </div>
          `,
          background: 'rgba(255, 255, 255, 0.9)',
          backdrop: `
            rgba(0, 0, 0, 0.15)
            left top
            no-repeat
          `,
          showCancelButton: true,
          confirmButtonText: 'Sign In',
          cancelButtonText: 'Register',
          focusConfirm: false,
          customClass: {
            popup: 'rounded-xl shadow-lg border border-gray-200 backdrop-blur-md',
            htmlContainer: 'text-center mx-4',
            actions: 'mt-4 flex justify-center gap-4',
            confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition',
            cancelButton: 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-5 py-2 rounded-lg font-medium transition'
          },
          buttonsStyling: false,
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login');
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            navigate('/signup');
          }
        });
        return;
      }           
      
      // Get basic user info from localStorage
      const username = localStorage.getItem('username');
      const email = localStorage.getItem('email');
      
      // Fetch user's recent posts
      let userPosts = [];
      try {
        const postsResponse = await apiService.getPostsByUser(userId);
        
        if (postsResponse && Array.isArray(postsResponse)) {
          userPosts = postsResponse;
          console.log("Fetched posts:", userPosts);
        }
      } catch (postError) {
        console.error("Error fetching user posts:", postError);
      }
      
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
      } catch (followError) {
        console.error("Error fetching follow data:", followError);
      }
      
      // Calculate total comments from all posts
      let totalComments = 0;
      try {
        // First try to get comments count from each post
        for (const post of userPosts) {
          if (post.commentCount) {
            totalComments += post.commentCount;
          } else if (post.id) {
            // If commentCount isn't available, try to fetch comments for this post
            try {
              const commentsResponse = await apiService.getCommentsByPost(post.id);
              if (commentsResponse && Array.isArray(commentsResponse)) {
                totalComments += commentsResponse.length;
              }
            } catch (err) {
              console.error(`Error fetching comments for post ${post.id}:`, err);
            }
          }
        }
      } catch (commentsError) {
        console.error("Error calculating total comments:", commentsError);
      }
      
      // Set user data including posts and follow counts
      setUserData({
        name: username || 'User',
        email: email || 'user@example.com',
        memberSince: 'Jan 2024', // Mock data until we have a real date
        posts: userPosts.length,
        likesReceived: userPosts.reduce((total, post) => total + (post.likeCount || 0), 0),
        comments: totalComments,
        followers: followersCount,
        following: followingCount,
        recentPosts: userPosts.slice(0, 3).map(post => ({
          id: post.id,
          title: post.title || 'Untitled Post',
          content: post.content || '',
          summary: post.summary || '',
          icon: getPostIcon(post.category)
        }))
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  // Function to fetch user progress data
  const fetchUserProgressData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      const progressResponse = await apiService.getAllProgress(userId);
      
      if (progressResponse && Array.isArray(progressResponse)) {
        // Sort progress based on current sort order
        const sortedProgress = sortProgressByDate(progressResponse, sortOrder);
        
        // Initialize progress with empty comments/likes arrays if they don't exist
        const progressWithInteractions = sortedProgress.map(prog => ({
          ...prog,
          comments: prog.comments || [],
          likes: prog.likes || [],
          likeCount: prog.likes ? prog.likes.length : 0
        }));
        
        setUserProgress(progressWithInteractions);
      }
    } catch (error) {
      console.error('Error fetching user progress data:', error);
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

  useEffect(() => {
    const verifyAuthentication = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      // Check for all required auth data, not just isLoggedIn flag
      if (!isLoggedIn || !token || !userId) {
        // Clear any partial auth data that might exist
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("isLoggedIn");
        
        // Redirect to login
        navigate('/login');
        return false;
      }
      
      // Set local auth state
      setIsLoggedIn(true);
      setUsername(localStorage.getItem('username') || '');
      return true;
    };
    
    // Verify authentication before fetching data
    if (verifyAuthentication()) {
      fetchUserData();
      fetchUserProgressData();
      fetchProgressTemplates();
    }
    
    // Listen for auth state changes
    window.addEventListener('authStateChanged', () => {
      if (!verifyAuthentication()) {
        // Redirect happened in verifyAuthentication
        return;
      }
      fetchUserData();
      fetchUserProgressData();
    });
    
    // Check auth status when component is focused (user returns from another tab/window)
    window.addEventListener('focus', verifyAuthentication);
    
    // Cleanup
    return () => {
      window.removeEventListener('authStateChanged', verifyAuthentication);
      window.removeEventListener('focus', verifyAuthentication);
    };
  }, [navigate]);

  // Helper function to get an icon based on post category
  const getPostIcon = (category) => {
    if (!category) return '📝';
    
    const categoryLowerCase = category.toLowerCase().trim();
    console.log("Category:", categoryLowerCase);
    
    switch(categoryLowerCase) {
      case 'photography': return '📷';
      case 'programming': return '💻';
      case 'design': return '🎨';
      case 'cooking': return '🍳';
      case 'music': return '🎵';
      case 'writing': return '📚';
      default: 
        console.log("Using default icon for category:", category);
        return '📝';
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

  const handleAddPost = () => navigate("/add-post");

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
    import('../services/api').then(module => {
      const apiService = module.default;
      apiService.logout().then(() => {
        setIsLoggedIn(false);
        setUsername('');
        
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#ffffff'
        }).then(() => {
          navigate('/login');
          window.dispatchEvent(new Event('authStateChanged'));
        });
      });
    });
  };

  const handleEditProgress = (progressId) => {
    const progressToEdit = userProgress.find(p => p.id === progressId);
    if (!progressToEdit) return;
    
    setEditingProgress(progressToEdit);
    
    // Check if this is a templated progress entry
    if (progressToEdit.templateType && typeof progressToEdit.content === 'object') {
      // Get the template from localStorage
      const templates = JSON.parse(localStorage.getItem('progressTemplates') || '{}');
      const template = templates[progressToEdit.templateType];
      
      if (template && template.fields) {
        // Create form HTML for each template field
        const fieldsHtml = template.fields.map(field => {
          const fieldValue = progressToEdit.content[field] || '';
          const isDateField = field.toLowerCase().includes('date');
          
          if (isDateField) {
            // Use HTML5 date input for date fields
            return `
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">${field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input 
                  type="date"
                  id="progress-field-${field}" 
                  class="w-full p-2 border border-gray-300 rounded-md"
                  value="${fieldValue}"
                />
              </div>
            `;
          } else {
            // Use text input for non-date fields
            return `
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">${field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input 
                  id="progress-field-${field}" 
                  class="w-full p-2 border border-gray-300 rounded-md"
                  value="${fieldValue.replace(/"/g, '&quot;')}"
                />
              </div>
            `;
          }
        }).join('');
        
        // Store template format for preview
        const templateFormat = template.format;
        
        Swal.fire({
          title: `Edit ${progressToEdit.templateType.charAt(0).toUpperCase() + progressToEdit.templateType.slice(1)}`,
          html: `
            <div class="p-4">
              ${fieldsHtml}
              <div class="mt-4 p-3 bg-gray-50 rounded text-sm">
                <p class="font-medium">Preview:</p>
                <p id="preview-content" class="text-gray-600">${formatProgressContent(progressToEdit)}</p>
              </div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Save Changes',
          confirmButtonColor: '#4f46e5',
          cancelButtonText: 'Cancel',
          didOpen: () => {
            // Function to update preview
            const updatePreview = () => {
              const fields = {};
              template.fields.forEach(field => {
                const input = document.getElementById(`progress-field-${field}`);
                if (input) {
                  fields[field] = input.value;
                }
              });
              
              let format = templateFormat;
              template.fields.forEach(field => {
                const value = fields[field] || '';
                format = format.replace(new RegExp(`{${field}}`, 'g'), value);
              });
              
              const previewElement = document.getElementById('preview-content');
              if (previewElement) {
                previewElement.textContent = format;
              }
            };

            // Add event listeners to all inputs
            template.fields.forEach(field => {
              const input = document.getElementById(`progress-field-${field}`);
              if (input) {
                input.addEventListener('input', updatePreview);
                input.addEventListener('change', updatePreview);
              }
            });

            // Initial preview update
            updatePreview();

            // Store updatePreview in window for cleanup
            window.updatePreview = updatePreview;
          },
          willClose: () => {
            // Clean up event listeners
            template.fields.forEach(field => {
              const input = document.getElementById(`progress-field-${field}`);
              if (input) {
                input.removeEventListener('input', window.updatePreview);
                input.removeEventListener('change', window.updatePreview);
              }
            });
            // Clean up window reference
            delete window.updatePreview;
          },
          preConfirm: () => {
            // Collect updated values for each field
            const updatedFields = {};
            template.fields.forEach(field => {
              const input = document.getElementById(`progress-field-${field}`);
              updatedFields[field] = input.value;
            });
            
            return { fields: updatedFields };
          }
        }).then((result) => {
          if (result.isConfirmed) {
            updateProgressContent(progressId, result.value.fields, true);
          }
          setEditingProgress(null);
        });
      } else {
        // Fallback for missing template
        showSimpleEditForm(progressToEdit);
      }
    } else {
      // For non-templated progress, use simple edit form
      showSimpleEditForm(progressToEdit);
    }
  };
  
  const showSimpleEditForm = (progressToEdit) => {
    const progressType = progressToEdit.templateType 
      ? `${progressToEdit.templateType.charAt(0).toUpperCase() + progressToEdit.templateType.slice(1)}`
      : 'Progress';
    
    // Check if content has date patterns to offer date selection
    const contentStr = progressToEdit.formattedContent || formatProgressContent(progressToEdit);
    const hasDatePatterns = contentStr.toLowerCase().includes('date') || 
                            contentStr.match(/\d{4}-\d{2}-\d{2}/) || 
                            contentStr.match(/\d{2}\/\d{2}\/\d{4}/);
    
    Swal.fire({
      title: `Edit ${progressType}`,
      html: `
        <div class="p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Progress Content</label>
            <textarea 
              id="progress-content" 
              class="w-full p-2 border border-gray-300 rounded-md" 
              rows="4"
            >${contentStr}</textarea>
          </div>
          
          ${hasDatePatterns ? `
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date Selection</label>
            <input 
              id="date-picker" 
              class="flatpickr w-full p-2 border border-gray-300 rounded-md"
              placeholder="Select a date..."
            />
            <p class="mt-1 text-sm text-gray-500">
              Select a date and click "Insert Date" to add it to your progress content.
            </p>
            <button 
              type="button"
              onclick="insertDate()"
              class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center justify-center"
            >
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
              </svg>
              Insert Date
            </button>
          </div>
          ` : ''}
          
          ${progressToEdit.templateType ? `
          <div class="p-3 bg-yellow-50 rounded-md mb-3 text-sm text-yellow-700">
            <p class="font-medium">Note:</p>
            <p>This is a formatted progress entry. Editing as plain text will convert it to a custom format.</p>
          </div>
          ` : ''}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      confirmButtonColor: '#4f46e5',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const content = document.getElementById('progress-content').value;
        if (!content) {
          Swal.showValidationMessage('Progress content cannot be empty');
          return false;
        }
        return { content };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        updateProgressContent(progressToEdit.id, result.value.content, false);
      }
    });
  };

  const updateProgressContent = async (progressId, content, isTemplated) => {
    try {
      // Get the progress to update
      const progressToUpdate = userProgress.find(p => p.id === progressId);
      if (!progressToUpdate) return;
      
      // Create the updated progress data
      let updatedProgressData = { ...progressToUpdate };
      
      if (isTemplated) {
        // If it's templated, update the field values
        updatedProgressData.content = content;
      } else if (typeof progressToUpdate.content === 'object') {
        // If content is an object but we're using simple edit, convert to custom content
        updatedProgressData.content = { 
          customContent: content 
        };
      } else {
        // If content is a string, simply update it
        updatedProgressData.content = content;
      }
      
      // Update the progress in the backend
      await apiService.updateProgress(progressId, updatedProgressData);
      
      // Refresh the progress data
      fetchUserProgressData();
      
      // Show success message
      Swal.fire({
        title: 'Success!',
        text: 'Progress updated successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update progress',
        icon: 'error'
      });
    }
  };

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

  // Set active tab and reset pagination when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Add new functions for likes and comments
  const handleLikeProgress = async (progressId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      // Find the progress item
      const progressItem = userProgress.find(p => p.id === progressId);
      if (!progressItem) return;
      
      // Check if user already liked this progress
      const alreadyLiked = progressItem.likes && progressItem.likes.includes(userId);
      
      // Create updated likes array
      let updatedLikes = [...(progressItem.likes || [])];
      
      if (alreadyLiked) {
        // Remove like if already liked
        updatedLikes = updatedLikes.filter(id => id !== userId);
      } else {
        // Add like if not already liked
        updatedLikes.push(userId);
      }
      
      // Update progress with new likes
      const updatedProgress = {
        ...progressItem,
        likes: updatedLikes
      };
      
      // Call API to update progress
      await apiService.updateProgress(progressId, updatedProgress);
      
      // Update local state
      setUserProgress(userProgress.map(p => 
        p.id === progressId 
          ? { ...p, likes: updatedLikes, likeCount: updatedLikes.length }
          : p
      ));
      
    } catch (error) {
      console.error('Error updating like status:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update like status',
        icon: 'error'
      });
    }
  };
  
  const handleToggleComments = (progressId) => {
    setShowComments(prev => ({
      ...prev,
      [progressId]: !prev[progressId]
    }));
  };
  
  const handleCommentChange = (progressId, text) => {
    setCommentText(prev => ({
      ...prev,
      [progressId]: text
    }));
  };
  
  const handleAddComment = async (progressId) => {
    try {
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      if (!userId || !username) return;
      
      // Get comment text
      const text = commentText[progressId];
      if (!text || text.trim() === '') return;
      
      // Find the progress item
      const progressItem = userProgress.find(p => p.id === progressId);
      if (!progressItem) return;
      
      // Create new comment
      const newComment = {
        id: Date.now().toString(), // Simple unique ID for now
        userId,
        username,
        text,
        createdAt: new Date().toISOString()
      };
      
      // Create updated comments array
      const updatedComments = [...(progressItem.comments || []), newComment];
      
      // Update progress with new comments
      const updatedProgress = {
        ...progressItem,
        comments: updatedComments
      };
      
      // Call API to update progress
      await apiService.updateProgress(progressId, updatedProgress);
      
      // Update local state
      setUserProgress(userProgress.map(p => 
        p.id === progressId 
          ? { ...p, comments: updatedComments }
          : p
      ));
      
      // Clear comment input
      setCommentText(prev => ({
        ...prev,
        [progressId]: ''
      }));
      
    } catch (error) {
      console.error('Error adding comment:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add comment',
        icon: 'error'
      });
    }
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="relative">
          {/* Animated sphere logo */}
          <div className="w-24 h-24 rounded-full shadow-lg bg-gradient-to-tr from-blue-600 to-indigo-800 animate-pulse">
            <div className="absolute rounded-full inset-4 bg-white/30"></div>
          </div>
          
          {/* SkillSphere text with animation */}
          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text">
              SkillSphere
            </h1>
            <p className="mt-2 text-blue-700/80 animate-pulse">Crafting your learning universe...</p>
          </div>
        </div>
        
        {/* Animated loading dots */}
        <div className="flex mt-8 space-x-2">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
        
        {/* Subtle footer */}
        <p className="absolute text-sm bottom-6 text-blue-900/50">
          Loading your personalized dashboard...
        </p>
      </div>
    );
  }

  const renderTabContent = () => {
    const userId = localStorage.getItem('userId');
    
    switch(activeTab) {
      case 'profile':
        return (
          <>
            <header className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-semibold text-blue-900">Welcome, {userData.name} 👋</h1>
              <button
                onClick={handleAddPost}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white transition duration-300 bg-blue-900 border-none rounded-lg hover:bg-blue-700"
                onMouseEnter={() => setHovered("mainAddPost")}
                onMouseLeave={() => setHovered(null)}
              >
                <FaPlus /> Add Post
              </button>
            </header>

            <section className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
              <div className="p-5 bg-white shadow-md rounded-xl">
                <h3 className="mb-3 text-lg font-semibold text-blue-500">Your Info</h3>
                <p>Name: {userData.name}</p>
                <p>Email: {userData.email}</p>
                <p>Member Since: {userData.memberSince}</p>
              </div>
              <div className="p-5 bg-white shadow-md rounded-xl">
                <h3 className="mb-3 text-lg font-semibold text-blue-500">Progress</h3>
                <p>Posts: {userData.posts}</p>
                <p>Likes Received: {userData.likesReceived}</p>
                <p>Comments: {userData.comments}</p>
                <button
                  className="flex items-center gap-2 px-3 py-2 mt-3 font-medium text-blue-800 transition duration-300 bg-blue-100 border-none rounded-lg cursor-pointer hover:bg-blue-200"
                  onMouseEnter={() => setHovered("viewProgress")}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleTabChange('progress')}
                >
                  <FaChartLine /> View Progress
                </button>
              </div>
              <div className="p-5 bg-white shadow-md rounded-xl">
                <h3 className="mb-3 text-lg font-semibold text-blue-500">Connections</h3>
                <p>Followers: {userData.followers}</p>
                <p>Following: {userData.following}</p>
                <button
                  className="flex items-center gap-2 px-3 py-2 mt-3 font-medium text-blue-800 transition duration-300 bg-blue-100 border-none rounded-lg cursor-pointer hover:bg-blue-200"
                  onMouseEnter={() => setHovered("viewConnections")}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleTabChange('followers')}
                >
                  <FaUsers /> View Connections
                </button>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-xl font-semibold">Recent Posts</h2>
              
              {userData.recentPosts.length === 0 ? (
                <div className="p-5 text-center text-gray-500 rounded-lg bg-gray-50">
                  You haven't created any posts yet.
                  <div className="mt-2">
                    <button
                      onClick={handleAddPost}
                      className="flex items-center gap-2 px-4 py-2 mx-auto text-sm text-white transition bg-blue-600 border-none rounded-lg hover:bg-blue-700"
                      onMouseEnter={() => setHovered("emptyAddPost")}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <FaPlus /> Create Your First Post
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {userData.recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-5 transition bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg"
                      onClick={() => navigate(`/posts/${post.id}`)}
                    >
                      <div className="mb-2 text-2xl">{post.icon}</div>
                      <h3 className="mb-2 text-lg font-semibold text-blue-800">{post.title}</h3>
                      <p className="text-gray-600 line-clamp-2">
                        {post.summary || post.content.substring(0, 120) + '...'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Progress</h2>
                <button
                  onClick={() => handleTabChange('progress')}
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View All <FaChartLine />
                </button>
              </div>
              
              {userProgress.length === 0 ? (
                <div className="p-5 text-center text-gray-500 rounded-lg bg-gray-50">
                  You haven't shared any progress updates yet.
                  <div className="mt-2">
                    <button
                      onClick={() => handleTabChange('progress')}
                      className="flex items-center gap-2 px-4 py-2 mx-auto text-sm text-white transition bg-blue-600 border-none rounded-lg hover:bg-blue-700"
                    >
                      <FaChartLine /> Track Your Progress
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md">
                  {userProgress.slice(0, 3).map((progress, index) => (
                    <div
                      key={progress.id}
                      className={`p-4 ${index !== userProgress.slice(0, 3).length - 1 ? 'border-b border-gray-200' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="mb-1 font-semibold text-blue-800 text-md">
                            {progress.templateType && progress.templateType.charAt(0).toUpperCase() + progress.templateType.slice(1)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {progress.formattedContent || formatProgressContent(progress)}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(progress.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        );
        
      case 'followers':
        return <FollowList type="followers" userId={userId} />;
        
      case 'following':
        return <FollowList type="following" userId={userId} />;
        
      case 'findUsers':
        return <UserSearch />;
        
      case 'progress':
        return (
          <>
            <header className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-semibold text-blue-900">Your Learning Progress</h1>
              <button
                onClick={fetchUserProgressData}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white transition duration-300 bg-blue-600 border-none rounded-lg hover:bg-blue-700"
              >
                <FaSyncAlt className="mr-1" /> Refresh Progress
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
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FaSyncAlt className="mr-1" /> Refresh
                  </button>
                </div>
              </div>
              
              {userProgress.length === 0 ? (
                <div className="p-5 text-center text-gray-500 rounded-lg bg-gray-50">
                  You haven't shared any progress updates yet. Use the form above to share your learning journey!
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {currentProgressItems.map((progress) => (
                      <div
                        key={progress.id}
                        className="p-5 bg-white rounded-lg shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-grow">
                            <h3 className="mb-2 text-lg font-semibold text-blue-800">
                              {progress.templateType && progress.templateType.charAt(0).toUpperCase() + progress.templateType.slice(1)}
                            </h3>
                            <p className="text-gray-600">
                              {progress.formattedContent || formatProgressContent(progress)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="mb-2 text-sm text-gray-500">
                              {new Date(progress.createdAt).toLocaleDateString()}
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
                        </div>
                        
                        {/* Add Like and Comment Actions */}
                        <div className="flex items-center pt-4 mt-4 border-t border-gray-200">
                          <button 
                            onClick={() => handleLikeProgress(progress.id)}
                            className={`flex items-center mr-4 px-2 py-1 text-sm rounded-md 
                              ${progress.likes && progress.likes.includes(localStorage.getItem('userId')) 
                                ? 'text-blue-600 bg-blue-50' 
                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                          >
                            {progress.likes && progress.likes.includes(localStorage.getItem('userId')) 
                              ? <FaThumbsUp className="mr-1" /> 
                              : <FaRegThumbsUp className="mr-1" />}
                            Like {progress.likeCount > 0 && `(${progress.likeCount})`}
                          </button>
                          
                          <button 
                            onClick={() => handleToggleComments(progress.id)}
                            className="flex items-center px-2 py-1 text-sm text-gray-500 rounded-md hover:text-blue-600 hover:bg-blue-50"
                          >
                            <FaRegComment className="mr-1" /> 
                            Comments {progress.comments && progress.comments.length > 0 && `(${progress.comments.length})`}
                          </button>
                        </div>
                        
                        {/* Comments Section */}
                        {showComments[progress.id] && (
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            {/* Comment List */}
                            {progress.comments && progress.comments.length > 0 ? (
                              <div className="mb-4 max-h-60 overflow-y-auto">
                                {progress.comments.map(comment => (
                                  <div key={comment.id} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center mb-1">
                                      <span className="font-medium text-blue-600">{comment.username}</span>
                                      <span className="ml-2 text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{comment.text}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mb-4 text-sm text-gray-500 italic">No comments yet. Be the first to comment!</p>
                            )}
                            
                            {/* Comment Form */}
                            <div className="flex">
                              <input
                                type="text"
                                value={commentText[progress.id] || ''}
                                onChange={(e) => handleCommentChange(progress.id, e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-grow p-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(progress.id)}
                              />
                              <button
                                onClick={() => handleAddComment(progress.id)}
                                className="flex items-center justify-center px-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                                disabled={!commentText[progress.id]}
                              >
                                <FaPaperPlane />
                              </button>
                            </div>
                          </div>
                        )}
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
          </>
        );
        
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans text-blue-900 bg-gradient-to-r from-blue-100 to-white">
        <aside className="flex flex-col w-64 gap-4 p-6 text-white bg-blue-600">
          <h2 className="mb-8 text-2xl font-bold">SkillSphere</h2>
          
          <div className="flex flex-col gap-4">
            {[
              { id: "profile", icon: <FaUser />, label: "Profile", onClick: () => handleTabChange('profile') },
              { id: "followers", icon: <FaUsers />, label: `Followers (${userData.followers})`, onClick: () => handleTabChange('followers') },
              { id: "following", icon: <FaUsers />, label: `Following (${userData.following})`, onClick: () => handleTabChange('following') },
              { id: "findUsers", icon: <FaSearch />, label: "Find Users", onClick: () => handleTabChange('findUsers') },
              { id: "explore", icon: <FaCompass />, label: "Explore", onClick: () => navigate("/") },
              { id: "myposts", icon: <FaFileAlt />, label: "My Posts", onClick: () => navigate("/my-posts") },
              { id: "addpost", icon: <FaPlus />, label: "Add Post", onClick: handleAddPost },
              { id: "progress_tracker", icon: <FaChartLine />, label: "Progress", onClick: () => handleTabChange('progress') },
              { id: "monetization", icon: <FaChartPie />, label: "Monetization", onClick: () => navigate("/monetize") },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={item.onClick}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-left transition ${
                  activeTab === item.id ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {item.icon} {item.label}
                {hovered === item.id && (
                  <span className="w-1 h-1 rounded-full bg-white ml-auto animate-pulse"></span>
                )}
              </button>
            ))}
          </div>
          
          <button 
            onClick={showLogoutConfirmation}
            className="mt-auto bg-red-600 hover:bg-red-700 text-white flex items-center gap-3 py-2.5 px-3 rounded-lg transition"
            onMouseEnter={() => setHovered("logout")}
            onMouseLeave={() => setHovered(null)}
          >
            <FaSignOutAlt /> Logout
            {hovered === "logout" && (
              <span className="w-1 h-1 rounded-full bg-white ml-auto animate-pulse"></span>
            )}
          </button>
        </aside>
        
        <main className="flex-1 p-6 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>

      {/* Delete Progress Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={cancelDelete}></div>

            {/* This element is to trick the browser into centering the modal contents */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal content */}
            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Progress Update</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this progress update? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => deleteProgress(progressToDelete)}
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;