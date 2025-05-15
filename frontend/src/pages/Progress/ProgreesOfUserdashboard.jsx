import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt, FaSyncAlt, FaChevronLeft, FaChevronRight, FaRegThumbsUp, FaThumbsUp, FaRegComment, FaPaperPlane } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import ProgressForm from "./ProgressForm";
import apiService from "../../services/api";
import Swal from 'sweetalert2';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer"; 

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
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [commentReplies, setCommentReplies] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("progress_tracker");
  const [loading, setLoading] = useState(!props.userData);

  // Helper function to map comment objects to a consistent format
  const normalizeComment = (comment) => {
    // Flag to identify current user's comments
    const isCurrentUser = comment.userId === localStorage.getItem('userId');
    
    return {
      id: comment.id,
      userId: comment.userId,
      username: comment.userName || comment.username || 'User', // Prioritize userName over username
      userName: comment.userName || comment.username || 'User', // Prioritize userName over username
      text: comment.content || comment.text || '',
      content: comment.content || comment.text || '',
      createdAt: comment.createdAt || comment.timestamp || new Date().toISOString(),
      isCurrentUser // Add flag for current user's comments
    };
  };

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
          try {
            // Fetch comments for this progress
            console.log("Fetching comments for progress:", prog.id);
            const comments = await apiService.getProgressComments(prog.id);
            console.log("Comments for progress", prog.id, ":", comments);
            
            // Map the comments to ensure they have consistent field names
            const mappedComments = comments ? comments.map(normalizeComment) : [];
            
            // Track the total number of comments including replies
            let totalCommentCount = mappedComments.length;
            
            // Fetch replies for each comment
            for (const comment of mappedComments) {
              try {
                const replies = await apiService.getCommentReplies(comment.id);
                console.log(`Fetched ${replies?.length || 0} replies for comment ${comment.id}`);
                
                if (replies && replies.length > 0) {
                  // Store normalized replies in state
                  const normalizedReplies = replies.map(normalizeComment);
                  setCommentReplies(prev => ({
                    ...prev,
                    [comment.id]: normalizedReplies
                  }));
                  
                  // Auto-expand comments that have replies
                  setExpandedReplies(prev => ({
                    ...prev,
                    [comment.id]: true
                  }));
                  
                  // Add to total comment count
                  totalCommentCount += normalizedReplies.length;
                } else {
                  // Initialize empty replies array if none exist
                  setCommentReplies(prev => ({
                    ...prev,
                    [comment.id]: []
                  }));
                }
              } catch (replyError) {
                console.error(`Error fetching replies for comment ${comment.id}:`, replyError);
              }
            }
            
            return {
              ...prog,
              comments: mappedComments,
              likes: prog.likes || [],
              likeCount: prog.likes ? prog.likes.length : 0,
              commentCount: totalCommentCount // Use our calculated total that includes replies
            };
          } catch (error) {
            console.error(`Error fetching comments for progress ${prog.id}:`, error);
            return {
              ...prog,
              comments: [],
              likes: prog.likes || [],
              likeCount: prog.likes ? prog.likes.length : 0,
              commentCount: 0
            };
          }
        });
        
        // Wait for all progress items to be processed with their comments and replies
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

  // Add new functions for likes and comments
  const handleLikeProgress = async (progressId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        // Redirect to login if not logged in
        Swal.fire({
          title: 'Login Required',
          text: 'Please log in to like progress updates',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Log in',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login');
          }
        });
        return;
      }
      
      // Find the progress item
      const progressItem = userProgress.find(p => p.id === progressId);
      if (!progressItem) return;
      
      // Check if user already liked this progress
      const alreadyLiked = progressItem.likes && progressItem.likes.includes(userId);
      
      // Call the appropriate API endpoint
      if (alreadyLiked) {
        await apiService.unlikeProgress(progressId);
      } else {
        await apiService.likeProgress(progressId);
      }
      
      // Create updated likes array for local state update
      let updatedLikes = [...(progressItem.likes || [])];
      
      if (alreadyLiked) {
        // Remove like if already liked
        updatedLikes = updatedLikes.filter(id => id !== userId);
      } else {
        // Add like if not already liked
        updatedLikes.push(userId);
      }
      
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

  // Edit progress function
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
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating progress content:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update progress: ' + (error.message || 'Unknown error'),
        icon: 'error'
      });
    }
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

  // Comments and replies functions
  const handleAddComment = async (progressId) => {
    try {
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      
      if (!userId || !username) {
        // Redirect to login if not logged in
        Swal.fire({
          title: 'Login Required',
          text: 'Please log in to comment on progress updates',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Log in',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login');
          }
        });
        return;
      }
      
      // Get comment text
      const text = commentText[progressId];
      if (!text || text.trim() === '') return;
      
      // Create comment data with the correct field name (content instead of text)
      const commentData = {
        content: text, // Backend expects 'content' field
        userId,
        username
      };
      
      // Call API to add comment
      const newComment = await apiService.addProgressComment(progressId, commentData);
      
      if (!newComment) {
        throw new Error('Failed to add comment - no response from server');
      }
      
      // Find the progress item
      const progressItem = userProgress.find(p => p.id === progressId);
      if (!progressItem) return;
      
      // Create normalized comment with consistent fields
      const normalizedComment = normalizeComment({
        id: newComment.id || Date.now().toString(),
        userId,
        username,
        content: text,
        createdAt: newComment.createdAt || new Date().toISOString()
      });
      
      // Create updated comments array
      const updatedComments = [...(progressItem.comments || []), normalizedComment];
      
      // Initialize empty replies array for the new comment
      setCommentReplies(prev => ({
        ...prev,
        [normalizedComment.id]: []
      }));
      
      // Update local state with new comment and increment comment count
      setUserProgress(userProgress.map(p => 
        p.id === progressId 
          ? { 
              ...p, 
              comments: updatedComments,
              commentCount: (p.commentCount || 0) + 1
            }
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
        text: `Failed to add comment: ${error.message || 'Unknown error'}`,
        icon: 'error'
      });
    }
  };

  // Comment editing functions
  const startEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditCommentText(comment.content || comment.text);
  };
  
  const cancelEditComment = () => {
    setEditingComment(null);
    setEditCommentText('');
  };
  
  const handleUpdateComment = async (commentId, progressId) => {
    try {
      if (!editCommentText.trim()) return;
      
      // Call API to update comment - use the progress-specific endpoint
      await apiService.updateProgressComment(commentId, { content: editCommentText });
      
      // Check if this is a reply by looking through commentReplies
      let isReply = false;
      let parentCommentId = null;
      
      // Search through all comment replies to find this comment
      Object.entries(commentReplies).forEach(([parent, replies]) => {
        if (replies.some(reply => reply.id === commentId)) {
          isReply = true;
          parentCommentId = parent;
        }
      });
      
      if (isReply && parentCommentId) {
        // It's a reply - update it in the commentReplies state
        setCommentReplies(prev => ({
          ...prev,
          [parentCommentId]: prev[parentCommentId].map(reply => 
            reply.id === commentId 
              ? { ...reply, content: editCommentText, text: editCommentText } 
              : reply
          )
        }));
      } else {
        // It's a regular comment - update it in the progress.comments array
        setUserProgress(userProgress.map(progress => {
          if (progress.id === progressId) {
            return {
              ...progress,
              comments: progress.comments.map(comment => 
                comment.id === commentId 
                  ? normalizeComment({ 
                      ...comment, 
                      content: editCommentText, 
                      text: editCommentText 
                    }) 
                  : comment
              )
            };
          }
          return progress;
        }));
      }
      
      // Reset editing state
      setEditingComment(null);
      setEditCommentText('');
      
      // Show success notification
      Swal.fire({
        title: 'Success!',
        text: 'Comment updated successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update comment: ' + (error.message || 'Unknown error'),
        icon: 'error'
      });
    }
  };
  
  const handleDeleteComment = async (commentId, progressId) => {
    try {
      // Confirm before delete
      const result = await Swal.fire({
        title: 'Delete Comment',
        text: 'Are you sure you want to delete this comment?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });
      
      if (result.isConfirmed) {
        // Call API to delete comment - use the progress-specific endpoint
        await apiService.deleteProgressComment(commentId);
        
        // Check if this is a reply to another comment
        let parentCommentId = null;
        let isReply = false;
        
        // Loop through all comments to find if this is a reply
        for (const progress of userProgress) {
          if (progress.id === progressId) {
            // Check in comment replies
            for (const [pCommentId, replies] of Object.entries(commentReplies)) {
              if (replies.some(reply => reply.id === commentId)) {
                parentCommentId = pCommentId;
                isReply = true;
                break;
              }
            }
          }
        }
        
        if (isReply && parentCommentId) {
          // This is a reply - update the replies array
          setCommentReplies(prev => ({
            ...prev,
            [parentCommentId]: prev[parentCommentId].filter(reply => reply.id !== commentId)
          }));
        } else {
          // This is a main comment - also remove any replies tied to this comment from state
          setCommentReplies(prev => {
            const newReplies = { ...prev };
            delete newReplies[commentId];
            return newReplies;
          });
        }
        
        // Update local state - remove comment and update counts
        setUserProgress(userProgress.map(progress => {
          if (progress.id === progressId) {
            // If it's a reply, keep the main comment but decrease comment count
            if (isReply) {
              return {
                ...progress,
                commentCount: progress.commentCount > 0 ? progress.commentCount - 1 : 0
              };
            } else {
              // If it's a main comment, remove it and any replies
              const updatedComments = progress.comments.filter(c => c.id !== commentId);
              const repliesCount = commentReplies[commentId]?.length || 0;
              return {
                ...progress,
                comments: updatedComments,
                commentCount: Math.max(0, (progress.commentCount || 0) - 1 - repliesCount)
              };
            }
          }
          return progress;
        }));
        
        // Show success notification
        Swal.fire({
          title: 'Success!',
          text: 'Comment deleted successfully',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete comment: ' + (error.message || 'Unknown error'),
        icon: 'error'
      });
    }
  };

  // Reply functions
  const startReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyText(prev => ({ ...prev, [commentId]: '' }));
  };
  
  const cancelReply = () => {
    setReplyingTo(null);
  };
  
  const handleAddReply = async (commentId, progressId) => {
    try {
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      
      if (!userId || !username) {
        Swal.fire({
          title: 'Login Required',
          text: 'Please log in to reply to comments',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Log in',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login');
          }
        });
        return;
      }
      
      if (!replyText[commentId]?.trim()) return;
      
      // Create reply data with consistent field naming
      const replyData = {
        content: replyText[commentId],
        userId,
        username: username, // Use consistent naming
        parentId: commentId
      };
      
      // Call API to add reply
      const newReply = await apiService.addCommentReply(commentId, replyData);
      
      // Normalize reply data
      const normalizedReply = normalizeComment({
        ...newReply,
        userId,
        username: username // Ensure username is set
      });
      
      // Update local state with new reply
      if (!commentReplies[commentId]) {
        setCommentReplies(prev => ({ ...prev, [commentId]: [normalizedReply] }));
      } else {
        setCommentReplies(prev => ({
          ...prev,
          [commentId]: [...prev[commentId], normalizedReply]
        }));
      }
      
      // Auto-expand replies section
      setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
      
      // Find the progress item to update its comment count
      const progressItem = userProgress.find(p => p.id === progressId);
      if (progressItem) {
        // Update progress comment count in the UI
        setUserProgress(userProgress.map(progress => {
          if (progress.id === progressId) {
            // Increment the total comment count by 1
            return {
              ...progress,
              commentCount: (progress.commentCount || 0) + 1
            };
          }
          return progress;
        }));
      }
      
      // Reset form and reply state
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      setReplyingTo(null);
      
      // Show success notification
      Swal.fire({
        title: 'Success!',
        text: 'Reply added successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add reply: ' + (error.message || 'Unknown error'),
        icon: 'error'
      });
    }
  };
  
  // Toggle replies visibility
  const toggleReplies = async (commentId) => {
    // Toggle expanded state for replies
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
    
    // If expanding and replies not loaded yet, fetch them
    if (!expandedReplies[commentId] && !commentReplies[commentId]) {
      try {
        const replyData = await apiService.getCommentReplies(commentId);
        
        if (replyData && replyData.length > 0) {
          // Store normalized replies in the state
          const normalizedReplies = replyData.map(normalizeComment);
          setCommentReplies(prev => ({
            ...prev,
            [commentId]: normalizedReplies
          }));
          
          // Update the comment count to include replies if it doesn't already
          const progressItem = userProgress.find(p => 
            p.comments && p.comments.some(c => c.id === commentId)
          );
          
          if (progressItem) {
            // Only update if the current count doesn't appear to include replies
            const commentCount = progressItem.comments.length;
            let totalReplies = 0;
            
            // Count all replies across all comments
            Object.values(commentReplies).forEach(replies => {
              totalReplies += replies.length;
            });
            
            // Add the newly fetched replies
            totalReplies += normalizedReplies.length;
            
            // If the stored count doesn't match comments + replies, update it
            if (progressItem.commentCount !== commentCount + totalReplies) {
              setUserProgress(userProgress.map(p => 
                p.id === progressItem.id 
                  ? { ...p, commentCount: commentCount + totalReplies }
                  : p
              ));
            }
          }
        } else {
          // Initialize with empty array if no replies
          setCommentReplies(prev => ({
            ...prev,
            [commentId]: []
          }));
        }
      } catch (error) {
        console.error('Error fetching replies:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load replies',
          icon: 'error',
          timer: 2000
        });
        
        // Initialize with empty array in case of error
        setCommentReplies(prev => ({
          ...prev,
          [commentId]: []
        }));
      }
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
    import('../../services/api').then(module => {
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
                          
                          {/* Display media content if available */}
                          {renderMedia(progress)}
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
                          Comments {progress.commentCount > 0 && `(${progress.commentCount})`}
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
                                  <div className="flex items-start space-x-2">
                                    <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium text-xs">
                                      {comment.userName?.charAt(0).toUpperCase() || comment.userName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                      <div className="bg-gray-50 rounded-lg p-2">
                                        <div className="flex justify-between items-start">
                                          <div className="font-medium text-sm text-gray-800">
                                            <Link to={`/profile/${comment.userId}`} className="hover:text-indigo-600 transition-colors">
                                              {comment.userName || comment.username || 'User'}
                                            </Link>
                                            {comment.userId === localStorage.getItem('userId') && (
                                              <span className="ml-1 text-xs text-indigo-600 font-normal">(You)</span>
                                            )}
                                          </div>
                                          <div className="flex space-x-2">
                                            {comment.userId === localStorage.getItem('userId') && (
                                              <>
                                                <button 
                                                  onClick={() => startEditComment(comment)}
                                                  className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                  Edit
                                                </button>
                                                <button 
                                                  onClick={() => handleDeleteComment(comment.id, progress.id)}
                                                  className="text-xs text-red-600 hover:text-red-800"
                                                >
                                                  Delete
                                                </button>
                                              </>
                                            )}
                                            <button 
                                              onClick={() => startReply(comment.id)}
                                              className="text-xs text-green-600 hover:text-green-800"
                                            >
                                              Reply
                                            </button>
                                          </div>
                                        </div>
                                        
                                        {editingComment === comment.id ? (
                                          <div className="mt-1">
                                            <textarea
                                              className="w-full text-sm border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                              value={editCommentText}
                                              onChange={e => setEditCommentText(e.target.value)}
                                              rows="2"
                                            />
                                            <div className="flex justify-end space-x-2 mt-1">
                                              <button 
                                                onClick={cancelEditComment}
                                                className="text-xs text-gray-700 hover:text-gray-900"
                                              >
                                                Cancel
                                              </button>
                                              <button 
                                                onClick={() => handleUpdateComment(comment.id, progress.id)}
                                                className="text-xs text-blue-600 hover:text-blue-800"
                                              >
                                                Save
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-sm text-gray-700 mt-1">{comment.content || comment.text}</p>
                                        )}
                                        
                                        <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                          <span>{new Date(comment.createdAt).toLocaleString()}</span>
                                          
                                          {/* Show reply count if there are replies or if replies are expanded */}
                                          {(commentReplies[comment.id]?.length > 0 || expandedReplies[comment.id]) && (
                                            <button 
                                              onClick={() => toggleReplies(comment.id)}
                                              className="text-blue-600 hover:text-blue-800"
                                            >
                                              {expandedReplies[comment.id] ? 'Hide' : 'Show'} {commentReplies[comment.id]?.length || 0} {commentReplies[comment.id]?.length === 1 ? 'reply' : 'replies'}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Reply Form */}
                                      {replyingTo === comment.id && (
                                        <div className="mt-2 ml-8">
                                          <textarea
                                            className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Write a reply..."
                                            value={replyText[comment.id] || ''}
                                            onChange={e => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                            rows="1"
                                          />
                                          <div className="flex justify-end mt-1 space-x-2">
                                            <button
                                              onClick={cancelReply}
                                              className="bg-gray-300 text-gray-700 text-sm px-3 py-1 rounded-md hover:bg-gray-400"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={() => handleAddReply(comment.id, progress.id)}
                                              className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700"
                                              disabled={!replyText[comment.id]?.trim()}
                                            >
                                              Reply
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Replies Section */}
                                      {expandedReplies[comment.id] && commentReplies[comment.id]?.length > 0 && (
                                        <div className="mt-2 ml-8 space-y-2">
                                          {commentReplies[comment.id].map(reply => (
                                            <div key={reply.id} className="flex items-start space-x-2">
                                              <div className="h-5 w-5 rounded-full bg-indigo-400 flex items-center justify-center text-white font-medium text-xs">
                                                {reply.username?.charAt(0).toUpperCase() || reply.userName?.charAt(0).toUpperCase() || 'U'}
                                              </div>
                                              <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                                <div className="flex justify-between items-start">
                                                  <div className="font-medium text-sm text-gray-800">
                                                    <Link to={`/profile/${reply.userId}`} className="hover:text-indigo-600 transition-colors">
                                                      {reply.userName || reply.username || 'User'}
                                                    </Link>
                                                    {reply.userId === localStorage.getItem('userId') && (
                                                      <span className="ml-1 text-xs text-indigo-600 font-normal">(You)</span>
                                                    )}
                                                  </div>
                                                  {reply.userId === localStorage.getItem('userId') && (
                                                    <div className="flex space-x-2">
                                                      <button 
                                                        onClick={() => startEditComment(reply)}
                                                        className="text-xs text-blue-600 hover:text-blue-800"
                                                      >
                                                        Edit
                                                      </button>
                                                      <button 
                                                        onClick={() => handleDeleteComment(reply.id, progress.id)}
                                                        className="text-xs text-red-600 hover:text-red-800"
                                                      >
                                                        Delete
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                                {editingComment === reply.id ? (
                                                  <div className="mt-1">
                                                    <textarea
                                                      className="w-full text-sm border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                      value={editCommentText}
                                                      onChange={e => setEditCommentText(e.target.value)}
                                                      rows="2"
                                                    />
                                                    <div className="flex justify-end space-x-2 mt-1">
                                                      <button 
                                                        onClick={cancelEditComment}
                                                        className="text-xs text-gray-700 hover:text-gray-900"
                                                      >
                                                        Cancel
                                                      </button>
                                                      <button 
                                                        onClick={() => handleUpdateComment(reply.id, progress.id)}
                                                        className="text-xs text-blue-600 hover:text-blue-800"
                                                      >
                                                        Save
                                                      </button>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <p className="text-sm text-gray-700 mt-1">{reply.content || reply.text}</p>
                                                )}
                                                <div className="text-xs text-gray-500 mt-1">
                                                  {new Date(reply.createdAt).toLocaleString()}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
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
        </main>
      </div>
    </div>
  );
};

export default ProgreesOfUserdashboard; 