import React, { useState, useEffect, useRef, useCallback, createRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import apiService from '../../services/api';
import { formatDistanceToNow, format, parse, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { FaEdit, FaTrash, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaSyncAlt, FaSort, FaThumbsUp, FaRegThumbsUp, FaComment, FaRegComment, FaHeart, FaRegHeart, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from "react-toastify";

const ProgressFeed = ({ userId, limit, sortOrder: externalSortOrder, hideFilters }) => {
  const navigate = useNavigate();
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingProgress, setEditingProgress] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const currentUserId = localStorage.getItem('userId');
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  
  // Sorting state - use external value if provided
  const [sortOrder, setSortOrder] = useState(externalSortOrder || 'newest');

  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarRef = useRef(null);
  const [calendarPosition, setCalendarPosition] = useState({ left: 0, top: 0 });

  // Comments and likes state
  const [expandedComments, setExpandedComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  
  // State for comment replies
  const [commentReplies, setCommentReplies] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  // Update internal sort order when external changes
  useEffect(() => {
    if (externalSortOrder) {
      setSortOrder(externalSortOrder);
    }
  }, [externalSortOrder]);

  useEffect(() => {
    // Close calendar when clicking outside
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Update calendar position when it's shown
    if (showCalendar) {
      const targetDateElement = document.getElementById('targetDate');
      if (targetDateElement) {
        const rect = targetDateElement.getBoundingClientRect();
        setCalendarPosition({
          left: rect.left,
          top: rect.bottom + 5
        });
      }
    }
  }, [showCalendar]);

  // Fetch progress updates
  const fetchProgress = async () => {
    try {
      setLoading(true);
      
      // Check for authentication if this is a user-specific feed
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const token = localStorage.getItem('token');
      
      if (userId && (!isLoggedIn || !token)) {
        // User is requesting their own feed but is not logged in
        setError('Please login to view your personal progress updates');
        setLoading(false);
        return;
      }
      
      try {
        const data = await apiService.getAllProgress(userId);
        
        // Process the data to ensure likes and comments are properly initialized
        const processedData = data.map(progress => ({
          ...progress,
          likes: progress.likes || [],
          likeCount: progress.likes?.length || 0,
          commentCount: progress.commentCount || 0
        }));
        
        // Sort the data based on current sort order
        const sortedData = sortProgressByDate(processedData, sortOrder);
        // If limit is provided, only show that many updates
        const limitedData = limit ? sortedData.slice(0, limit) : sortedData;
        setProgressUpdates(limitedData);
        
        // Reset to page 1 when data changes significantly
        setCurrentPage(1);
      } catch (error) {
        console.error('Error fetching progress:', error);
        // Only show "Could not load progress updates" for user feeds
        // For global feeds with a 401 error, show a more specific message
        if (userId) {
          setError('Could not load progress updates');
        } else if (error.status === 401) {
          setError('Login to see progress updates');
        } else {
          setError('Could not load progress updates');
        }
      }
    } finally {
      setLoading(false);
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
    setProgressUpdates(sortProgressByDate(progressUpdates, order));
    setCurrentPage(1); // Reset to first page when sort order changes
  };

  useEffect(() => {
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, limit, sortOrder]);

  // Format template content into readable text
  const formatProgressContent = (progress) => {
    if (!progress?.templateType || !progress?.content) return '';
    
    let text = '';
    
    switch (progress.templateType) {
      case 'completed_tutorial':
        text = `✅ I completed ${progress.content.tutorialName || 'a tutorial'} today!`;
        break;
      case 'new_skill':
        text = `🎯 Today I learned about ${progress.content.skillName || 'a new skill'}`;
        break;
      case 'learning_goal':
        text = `📅 I aim to finish ${progress.content.goalName || 'my goal'} by ${progress.content.targetDate || 'the deadline'}`;
        break;
      default:
        // Try to create a generic representation of the content
        if (progress.content && typeof progress.content === 'object') {
          text = Object.entries(progress.content)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        } else {
          text = 'Progress update';
        }
    }
    
    return text;
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

  // Handle progress deletion
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteProgress(deleteId);
      setProgressUpdates(progressUpdates.filter(p => p.id !== deleteId));
      setShowConfirm(false);

      toast.error('Progress deleted successfully!', {
      });
    } catch (error) {
      setError('Could not delete progress update');
      console.error(error);
      toast.error('Failed to delete progress');
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setShowConfirm(false);
  };

  // Handle edit functions
  const startEdit = (progress) => {
    setEditingProgress(progress);
    
    // Initialize form data based on the progress type
    if (progress.templateType === 'completed_tutorial') {
      setEditFormData({
        tutorialName: progress.content.tutorialName || ''
      });
    } else if (progress.templateType === 'new_skill') {
      setEditFormData({
        skillName: progress.content.skillName || ''
      });
    } else if (progress.templateType === 'learning_goal') {
      setEditFormData({
        goalName: progress.content.goalName || '',
        targetDate: progress.content.targetDate || ''
      });
    } else if (progress.content && typeof progress.content === 'object') {
      setEditFormData({...progress.content});
    }
  };

  const cancelEdit = () => {
    setEditingProgress(null);
    setEditFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!editingProgress) return;
      
      // Create updated progress with new content
      const updatedProgress = {
        ...editingProgress,
        content: editFormData
      };
      
      await apiService.updateProgress(editingProgress.id, updatedProgress);
      
      // Update the progress in the local state
      setProgressUpdates(prevUpdates => {
        return prevUpdates.map(p => {
          if (p.id === editingProgress.id) {
            return {
              ...p,
              content: editFormData
            };
          }
          return p;
        });
      });
      
      toast.success('Progress updated successfully!');
      
      // Clear edit state
      setEditingProgress(null);
      setEditFormData({});
    } catch (error) {
      setError('Could not update progress');
      console.error(error);
      toast.error('Failed to update progress');
    }
  };

  // Handle date selection
  const handleDateChange = (day) => {
    setSelectedDate(day);
    const formattedDate = format(day, 'yyyy-MM-dd');
    setEditFormData(prev => ({
      ...prev,
      targetDate: formattedDate
    }));
    setShowCalendar(false);
  };

  // Handle month navigation
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Generate calendar days
  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'eeee';
    const days = [];

    let day = startDate;
    const weekDays = [];

    // Create week day headers
    for (let i = 0; i < 7; i++) {
      weekDays.push(
        <div key={i} className="px-1 py-1 text-center font-medium text-xs text-gray-500">
          {format(day, 'EEEEEE')}
        </div>
      );
      day = addDays(day, 1);
    }

    days.push(
      <div key="header" className="grid grid-cols-7 mb-1">
        {weekDays}
      </div>
    );

    // Reset to start date
    day = startDate;
    const rows = [];

    // Create calendar rows and days
    while (day <= endDate) {
      let formattedDate = format(day, 'd');
      const cloneDay = day;
      const isToday = isSameDay(day, new Date());
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isCurrentMonth = isSameMonth(day, monthStart);

      rows.push(
        <div
          key={day.toString()}
          className={`
            px-1 py-1 text-center text-sm rounded cursor-pointer
            ${isToday ? 'border border-blue-400' : ''}
            ${isSelected ? 'bg-indigo-600 text-white' : ''}
            ${!isCurrentMonth ? 'text-gray-300' : isToday ? 'text-blue-600' : 'text-gray-700'}
            hover:bg-indigo-100
          `}
          onClick={() => handleDateChange(cloneDay)}
        >
          {formattedDate}
        </div>
      );

      day = addDays(day, 1);
    }

    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < rows.length; i += 7) {
      weeks.push(
        <div key={i} className="grid grid-cols-7 mb-1">
          {rows.slice(i, i + 7)}
        </div>
      );
    }

    return (
      <div className="calendar">
        {days}
        {weeks}
      </div>
    );
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
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <FaCalendarAlt className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="targetDate"
                          name="targetDate"
                          value={editFormData.targetDate || ''}
                          readOnly
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                          placeholder="YYYY-MM-DD"
                          required
                          onClick={() => setShowCalendar(!showCalendar)}
                        />
                        
                        {/* Render the calendar using a portal */}
                        {showCalendar && createPortal(
                          <div
                            ref={calendarRef}
                            className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2"
                            style={{ 
                              width: '240px',
                              maxHeight: '300px',
                              left: `${calendarPosition.left}px`,
                              top: `${calendarPosition.top}px`
                            }}
                          >
                            {/* Calendar header */}
                            <div className="flex justify-between items-center mb-2">
                              <button 
                                type="button" 
                                onClick={prevMonth}
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                <FaChevronLeft />
                              </button>
                              <div className="font-semibold text-center">
                                {format(currentMonth, 'MMMM yyyy')}
                              </div>
                              <button 
                                type="button" 
                                onClick={nextMonth}
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                <FaChevronRight />
                              </button>
                            </div>
                            
                            {/* Calendar days */}
                            {renderCalendarDays()}
                          </div>,
                          document.body
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">Click to open the date picker</div>
                    </div>
                  </>
                )}
                
                {!['completed_tutorial', 'new_skill', 'learning_goal'].includes(editingProgress.templateType) && 
                  Object.keys(editFormData).map(key => (
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
                      <FaCalendarAlt className="mr-1" />
                      <span>Target date: {editFormData.targetDate}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get current progress items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProgressItems = !limit ? progressUpdates.slice(indexOfFirstItem, indexOfLastItem) : progressUpdates;
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < Math.ceil(progressUpdates.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Toggle comments visibility for a progress update
  const toggleComments = async (progressId) => {
    // Toggle expanded state
    setExpandedComments(prev => ({
      ...prev,
      [progressId]: !prev[progressId]
    }));
    
    // If expanding and comments not loaded yet, fetch them
    if (!expandedComments[progressId] && !comments[progressId]) {
      try {
        console.log(`Fetching comments for progress ${progressId}...`);
        const commentData = await apiService.getProgressComments(progressId);
        console.log(`Received comments:`, commentData);
        
        // Store the comments in the state
        setComments(prev => ({
          ...prev,
          [progressId]: commentData || []
        }));
        
        // For each comment, check if it has replies and fetch them
        let totalReplyCount = 0;
        if (commentData && commentData.length > 0) {
          const replyPromises = commentData.map(async (comment) => {
            try {
              console.log(`Fetching replies for comment ${comment.id}...`);
              const replyData = await apiService.getCommentReplies(comment.id);
              console.log(`Received replies for comment ${comment.id}:`, replyData);
              
              if (replyData && replyData.length > 0) {
                totalReplyCount += replyData.length;
                
                // Store the replies in the state
                setCommentReplies(prev => ({
                  ...prev,
                  [comment.id]: replyData
                }));
                
                // Auto-expand replies that have content
                setExpandedReplies(prev => ({
                  ...prev,
                  [comment.id]: true
                }));
              }
              return replyData || [];
            } catch (error) {
              console.error(`Error fetching replies for comment ${comment.id}:`, error);
              return [];
            }
          });
          
          // Wait for all reply requests to complete
          const allReplies = await Promise.all(replyPromises);
          
          // Update the progress comment count to reflect the actual number of comments + replies
          const totalCommentCount = commentData.length + totalReplyCount;
          
          // Update the progress update with the correct comment count
          setProgressUpdates(prev => 
            prev.map(p => 
              p.id === progressId 
                ? { ...p, commentCount: totalCommentCount } 
                : p
            )
          );
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load comments. Please try again later.');
        
        // Initialize with empty array in case of error
        setComments(prev => ({
          ...prev,
          [progressId]: []
        }));
      }
    }
  };
  
  // Toggle replies for a comment
  const toggleReplies = async (commentId) => {
    // Toggle expanded state for replies
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
    
    // If expanding and replies not loaded yet, fetch them
    if (!expandedReplies[commentId] && !commentReplies[commentId]) {
      try {
        console.log(`Fetching replies for comment ${commentId}...`);
        const replyData = await apiService.getCommentReplies(commentId);
        console.log(`Received replies:`, replyData);
        
        // Store the replies in the state
        setCommentReplies(prev => ({
          ...prev,
          [commentId]: replyData || []
        }));
      } catch (error) {
        console.error('Error fetching replies:', error);
        toast.error('Failed to load replies. Please try again later.');
        
        // Initialize with empty array in case of error
        setCommentReplies(prev => ({
          ...prev,
          [commentId]: []
        }));
      }
    }
  };

  // Handle adding a new comment
  const handleAddComment = async (progressId) => {
    // Check if user is logged in
    if (!currentUserId) {
      toast.info('Please sign in to comment on progress updates');
      // Redirect to sign in page
      window.location.href = '/signin';
      return;
    }
    
    if (!commentText[progressId]?.trim()) return;
    
    try {
      const newComment = {
        content: commentText[progressId]
      };
      
      const createdComment = await apiService.addProgressComment(progressId, newComment);
      
      // Update comments state with the new comment
      setComments(prev => ({
        ...prev,
        [progressId]: [...(prev[progressId] || []), createdComment]
      }));
      
      // Clear comment input
      setCommentText(prev => ({
        ...prev,
        [progressId]: ''
      }));
      
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      
      // Check if error is unauthorized
      if (error.status === 401) {
        toast.error('Please sign in to comment on progress updates');
        // Redirect to sign in page after a short delay
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1500);
      } else {
        toast.error('Failed to add comment');
      }
    }
  };

  // Helper function to check if user is authenticated
  const checkAuthenticated = () => {
    if (!currentUserId) {
      toast.info('Please sign in to perform this action');
      // Redirect to sign in page
      window.location.href = '/signin';
      return false;
    }
    return true;
  };

  // Start editing a comment
  const startEditComment = (comment) => {
    if (!checkAuthenticated()) return;
    
    // Check if the current user is the comment owner
    if (comment.userId !== currentUserId) {
      toast.error('You can only edit your own comments');
      return;
    }
    
    setEditingComment(comment.id);
    setEditCommentText(comment.content);
  };

  // Cancel editing a comment
  const cancelEditComment = () => {
    setEditingComment(null);
    setEditCommentText('');
  };

  // Handle updating a comment
  const handleUpdateComment = async (commentId, progressId) => {
    if (!checkAuthenticated()) return;
    if (!editCommentText.trim()) return;
    
    try {
      const updatedComment = {
        content: editCommentText
      };
      
      await apiService.updateProgressComment(commentId, updatedComment);
      
      // Update comments state with edited comment
      setComments(prev => ({
        ...prev,
        [progressId]: prev[progressId].map(comment => 
          comment.id === commentId 
            ? { ...comment, content: editCommentText } 
            : comment
        )
      }));
      
      // Exit edit mode
      setEditingComment(null);
      setEditCommentText('');
      
      toast.success('Comment updated');
    } catch (error) {
      console.error('Error updating comment:', error);
      
      if (error.status === 401) {
        toast.error('Please sign in to update comments');
      } else if (error.status === 403) {
        toast.error('You can only edit your own comments');
      } else {
        toast.error('Failed to update comment');
      }
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId, progressId) => {
    if (!checkAuthenticated()) return;
    
    try {
      await apiService.deleteProgressComment(commentId);
      
      // Check if the comment is a reply by looking through all commentReplies
      let isReply = false;
      let parentCommentId = null;
      
      // Loop through all comments to find out if this is a reply and what its parent is
      Object.entries(commentReplies).forEach(([parent, replies]) => {
        if (replies.some(reply => reply.id === commentId)) {
          isReply = true;
          parentCommentId = parent;
        }
      });
      
      if (isReply && parentCommentId) {
        // This is a reply - remove it from the replies state
        setCommentReplies(prev => ({
          ...prev,
          [parentCommentId]: prev[parentCommentId].filter(reply => reply.id !== commentId)
        }));

        // Update the comment count in the progress update for the deleted reply
        setProgressUpdates(prev => 
          prev.map(p => 
            p.id === progressId 
              ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) - 1) } 
              : p
          )
        );
      } else {
        // This is a regular comment - count how many replies it has before removing it
        const replyCount = commentReplies[commentId]?.length || 0;
        
        // Remove the comment from the comments state
        setComments(prev => ({
          ...prev,
          [progressId]: prev[progressId].filter(comment => comment.id !== commentId)
        }));
        
        // Remove associated replies if any
        if (commentReplies[commentId]) {
          setCommentReplies(prev => {
            const newReplies = { ...prev };
            delete newReplies[commentId];
            return newReplies;
          });
        }
        
        // Update the comment count in the progress update - decreasing by comment + all its replies
        setProgressUpdates(prev => 
          prev.map(p => 
            p.id === progressId 
              ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) - (1 + replyCount)) } 
              : p
          )
        );
      }
      
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      
      if (error.status === 401) {
        toast.error('Please sign in to delete comments');
      } else if (error.status === 403) {
        toast.error('You can only delete your own comments');
      } else {
        toast.error('Failed to delete comment');
      }
    }
  };

  // Toggle like on a progress update
  const toggleLike = async (progress) => {
    // Check if user is logged in
    if (!currentUserId) {
      toast.info('Please sign in to like progress updates');
      // Redirect to sign in page
      window.location.href = '/signin';
      return;
    }
    
    try {
      // If user already liked the progress, unlike it
      if (progress.likes?.includes(currentUserId)) {
        await apiService.unlikeProgress(progress.id);
        
        // Update progress state to remove the like
        setProgressUpdates(prev => 
          prev.map(p => 
            p.id === progress.id 
              ? { 
                  ...p, 
                  likes: p.likes.filter(id => id !== currentUserId),
                  likeCount: p.likeCount - 1
                } 
              : p
          )
        );
      } else {
        // Otherwise, add a like
        await apiService.likeProgress(progress.id);
        
        // Update progress state to add the like
        setProgressUpdates(prev => 
          prev.map(p => 
            p.id === progress.id 
              ? { 
                  ...p, 
                  likes: [...(p.likes || []), currentUserId],
                  likeCount: (p.likeCount || 0) + 1
                } 
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      
      // Check if error is unauthorized
      if (error.status === 401) {
        toast.error('Please sign in to like progress updates');
        // Redirect to sign in page after a short delay
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1500);
      } else {
        toast.error('Failed to update like');
      }
    }
  };

  // Start replying to a comment
  const startReply = (commentId) => {
    if (!checkAuthenticated()) return;
    setReplyingTo(commentId);
  };
  
  // Cancel replying to a comment
  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText({});
  };
  
  // Handle adding a reply to a comment
  const handleAddReply = async (commentId, progressId) => {
    // Check if user is logged in
    if (!currentUserId) {
      toast.info('Please sign in to reply to comments');
      window.location.href = '/signin';
      return;
    }
    
    if (!replyText[commentId]?.trim()) return;
    
    try {
      const newReply = {
        content: replyText[commentId]
      };
      
      const createdReply = await apiService.addCommentReply(commentId, newReply);
      
      // If replies for this comment haven't been loaded yet, initialize the array
      if (!commentReplies[commentId]) {
        setCommentReplies(prev => ({
          ...prev,
          [commentId]: []
        }));
      }
      
      // Update replies state with the new reply
      setCommentReplies(prev => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), createdReply]
      }));
      
      // Automatically expand replies when adding a new one
      if (!expandedReplies[commentId]) {
        setExpandedReplies(prev => ({
          ...prev,
          [commentId]: true
        }));
      }
      
      // Clear reply input and exit reply mode
      setReplyText(prev => ({
        ...prev,
        [commentId]: ''
      }));
      setReplyingTo(null);
      
      // Make sure the new reply isn't also added to the regular comments list
      // by filtering it out if it exists there
      setComments(prev => {
        const currentComments = prev[progressId] || [];
        return {
          ...prev,
          [progressId]: currentComments.filter(comment => comment.id !== createdReply.id)
        };
      });
      
      // Update the comment count in the progress update
      setProgressUpdates(prev => 
        prev.map(p => 
          p.id === progressId 
            ? { ...p, commentCount: (p.commentCount || 0) + 1 } 
            : p
        )
      );
      
      toast.success('Reply added');
    } catch (error) {
      console.error('Error adding reply:', error);
      
      // Check if error is unauthorized
      if (error.status === 401) {
        toast.error('Please sign in to reply to comments');
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1500);
      } else {
        toast.error('Failed to add reply');
      }
    }
  };

  // Handle clicking on a user's profile
  const handleProfileClick = (profileUserId) => {
    // Check if user is logged in before allowing profile navigation
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    // Navigate to the user's profile page
    navigate(`/profile/${profileUserId}`);
  };
  
  // Handle closing the login modal and redirecting to login
  const handleCloseModal = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (progressUpdates.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
        No progress updates yet.
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Authentication Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

            {/* Modal content */}
            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Authentication Required</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You need to be logged in to view user profiles. This helps maintain a safe and interactive community for all our users.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseModal}
                >
                  Log In
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowLoginModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Login Prompt for non-logged users */}
      {!currentUserId && !error && progressUpdates.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
          <div className="flex-1">
            <h3 className="font-medium text-blue-800">Want to engage with the community?</h3>
            <p className="text-sm text-blue-700 mt-1">Sign in to like and comment on progress updates.</p>
          </div>
          <Link 
            to="/login" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
          >
            Sign In
          </Link>
        </div>
      )}
      
      {/* Sorting Controls - Only show if not using limit param and hideFilters is not true */}
      {!limit && !hideFilters && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Sort by:</span>
              <select 
                value={sortOrder}
                onChange={(e) => handleSortOrderChange(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <button
              onClick={fetchProgress}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <FaSyncAlt className="mr-1" /> Refresh
            </button>
          </div>
          {!limit && progressUpdates.length > 0 && (
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, progressUpdates.length)} of {progressUpdates.length}
            </div>
          )}
        </div>
      )}
      
      {/* Display counter when hideFilters is true (parent component controls filters) */}
      {!limit && hideFilters && progressUpdates.length > 0 && (
        <div className="flex justify-end mb-4">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, progressUpdates.length)} of {progressUpdates.length}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {currentProgressItems.map((progress) => (
          <div key={progress.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 bg-blue-500 rounded-full text-white flex items-center justify-center font-bold mr-3 cursor-pointer transition transform hover:scale-105"
                  onClick={() => progress.user?.id && handleProfileClick(progress.user.id)}
                >
                  {progress.user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <div
                    className="font-semibold text-blue-700 hover:text-blue-500 cursor-pointer"
                    onClick={() => progress.user?.id && handleProfileClick(progress.user.id)}
                  >
                    {progress.user?.username || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(progress.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              {/* Show edit/delete buttons only for current user's posts */}
              {currentUserId === progress.user?.id && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(progress)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                  >
                    <FaEdit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => confirmDelete(progress.id)}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                  >
                    <FaTrash className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="px-4 py-3">
              <p className="text-gray-800">{formatProgressContent(progress)}</p>
              
              {/* Display target date separately for learning goals */}
              {progress.templateType === 'learning_goal' && progress.content.targetDate && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <FaCalendarAlt className="mr-1" />
                  <span>Target date: {progress.content.targetDate}</span>
                </div>
              )}
              
              {/* Display media content if available */}
              {renderMedia(progress)}
              
              {/* Like and Comment Actions */}
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center space-x-6">
                {/* Like button - clickable for all users, but prompts login for non-logged in users */}
                <button 
                  onClick={() => toggleLike(progress)}
                  className={`flex items-center text-sm ${progress.likes?.includes(currentUserId) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                >
                  {progress.likes?.includes(currentUserId) ? <FaThumbsUp className="mr-1" /> : <FaRegThumbsUp className="mr-1" />}
                  <span className={progress.likes?.includes(currentUserId) ? "font-medium" : ""}>
                    {progress.likeCount || 0}
                  </span>
                  <span className="ml-1">{progress.likeCount === 1 ? 'Like' : 'Likes'}</span>
                </button>
                
                {/* Display comment count - clickable for all users */}
                <div 
                  onClick={() => toggleComments(progress.id)}
                  className={`flex items-center text-sm ${expandedComments[progress.id] ? 'text-blue-600' : 'text-gray-500'} cursor-pointer hover:text-blue-600`}
                >
                  {expandedComments[progress.id] ? <FaComment className="mr-1" /> : <FaRegComment className="mr-1" />}
                  <span className={expandedComments[progress.id] ? "font-medium" : ""}>
                    {progress.commentCount || 0}
                  </span>
                  <span className="ml-1">
                    {progress.commentCount === 1 ? 'Comment' : 'Comments'}
                  </span>
                </div>
              </div>
              
              {/* Comments Section - visible to all users */}
              {expandedComments[progress.id] && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  {/* Comment List */}
                  <div className="space-y-3 mb-3">
                    {comments[progress.id]?.length > 0 ? (
                      comments[progress.id].map(comment => (
                        <div key={comment.id} className="flex items-start space-x-2">
                          <div 
                            className="w-8 h-8 bg-indigo-500 rounded-full text-white flex items-center justify-center font-bold mr-2 cursor-pointer"
                            onClick={() => comment.userId && handleProfileClick(comment.userId)}
                          >
                            {comment.userName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-lg p-2">
                              <div className="flex justify-between items-start">
                                <div className="flex items-baseline">
                                  <span 
                                    className="font-medium text-indigo-700 hover:text-indigo-500 cursor-pointer"
                                    onClick={() => comment.userId && handleProfileClick(comment.userId)}
                                  >
                                    {comment.userName || 'User'}
                                  </span>
                                  {currentUserId === comment.userId && (
                                    <span className="ml-1 text-xs text-indigo-600 font-normal">(You)</span>
                                  )}
                                  <span className="text-xs text-gray-500 ml-2">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  {currentUserId === comment.userId && (
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
                                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                              )}
                              
                              <div className="text-xs text-gray-500 mt-1 flex justify-between">
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
                                    <div 
                                      className="w-7 h-7 bg-purple-500 rounded-full text-white flex items-center justify-center font-bold mr-2 cursor-pointer"
                                      onClick={() => reply.userId && handleProfileClick(reply.userId)}
                                    >
                                      {reply.userName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-baseline">
                                          <span 
                                            className="font-medium text-purple-700 hover:text-purple-500 cursor-pointer"
                                            onClick={() => reply.userId && handleProfileClick(reply.userId)}
                                          >
                                            {reply.userName || 'User'}
                                          </span>
                                          {currentUserId === reply.userId && (
                                            <span className="ml-1 text-xs text-indigo-600 font-normal">(You)</span>
                                          )}
                                          <span className="text-xs text-gray-500 ml-2">
                                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                          </span>
                                        </div>
                                        {currentUserId === reply.userId && (
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
                                        <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                  
                  {/* Add Comment Form - only for logged-in users */}
                  {currentUserId ? (
                    <div className="flex space-x-2 mt-3">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium">
                        {localStorage.getItem('username')?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <textarea
                          className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Write a comment..."
                          value={commentText[progress.id] || ''}
                          onChange={e => setCommentText(prev => ({ ...prev, [progress.id]: e.target.value }))}
                          rows="1"
                        />
                        <div className="flex justify-end mt-1">
                          <button
                            onClick={() => handleAddComment(progress.id)}
                            className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700"
                            disabled={!commentText[progress.id]?.trim()}
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => window.location.href = '/signin'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                      >
                        Sign in to comment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination Controls - Only show if not using limit param and if needed */}
      {!limit && progressUpdates.length > itemsPerPage && (
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
            {[...Array(Math.ceil(progressUpdates.length / itemsPerPage)).keys()].map(number => (
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
              disabled={currentPage === Math.ceil(progressUpdates.length / itemsPerPage)}
              className={`mx-1 px-3 py-1 rounded flex items-center ${
                currentPage === Math.ceil(progressUpdates.length / itemsPerPage)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Next <FaChevronRight className="ml-1" />
            </button>
          </nav>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      {showConfirm && (
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
                  onClick={handleDelete}
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
      
      {/* Edit modal */}
      {editingProgress && renderEditForm()}
    </div>
  );
};

export default ProgressFeed;