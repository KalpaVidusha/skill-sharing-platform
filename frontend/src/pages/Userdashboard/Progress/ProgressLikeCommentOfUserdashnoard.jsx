import React, { useState } from "react";
import { FaRegThumbsUp, FaThumbsUp, FaRegComment, FaPaperPlane } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../../services/api";
import Swal from 'sweetalert2';

const ProgressLikeCommentOfUserdashnoard = ({ progress, onProgressUpdate }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  // States for comments and likes
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [commentReplies, setCommentReplies] = useState({});
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState({});
  
  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isParentComment, setIsParentComment] = useState(false);
  
  // Button loading states
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState({});
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  // Helper function to normalize comment objects
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

  // Handle like functionality
  const handleLikeProgress = async () => {
    try {
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
      
      // Check if user already liked this progress
      const alreadyLiked = progress.likes && progress.likes.includes(userId);
      
      // Call the appropriate API endpoint
      if (alreadyLiked) {
        await apiService.unlikeProgress(progress.id);
      } else {
        await apiService.likeProgress(progress.id);
      }
      
      // Create updated likes array for local state update
      let updatedLikes = [...(progress.likes || [])];
      
      if (alreadyLiked) {
        // Remove like if already liked
        updatedLikes = updatedLikes.filter(id => id !== userId);
      } else {
        // Add like if not already liked
        updatedLikes.push(userId);
      }
      
      // Update progress via callback
      const updatedProgress = {
        ...progress,
        likes: updatedLikes,
        likeCount: updatedLikes.length
      };
      
      onProgressUpdate(updatedProgress);
      
    } catch (error) {
      console.error('Error updating like status:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update like status',
        icon: 'error'
      });
    }
  };
  
  // Toggle comments visibility
  const handleToggleComments = async () => {
    // If comments are already shown, just hide them
    if (showComments) {
      setShowComments(false);
      return;
    }
    
    setShowComments(true);
    
    // If no comments loaded yet, load them
    if (!progress.comments || progress.comments.length === 0) {
      try {
        setIsLoadingComments(true);
        const comments = await apiService.getProgressComments(progress.id);
        
        // Map the comments to ensure they have consistent field names
        const mappedComments = comments ? comments.map(normalizeComment) : [];
        
        // Track the total number of comments including replies
        let totalCommentCount = mappedComments.length;
        
        // Fetch replies for each comment
        for (const comment of mappedComments) {
          try {
            const replies = await apiService.getCommentReplies(comment.id);
            
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
        
        // Update the progress with fetched comments
        const updatedProgress = {
          ...progress,
          comments: mappedComments,
          commentCount: totalCommentCount
        };
        
        onProgressUpdate(updatedProgress);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    }
  };
  
  // Handle comment input change
  const handleCommentChange = (text) => {
    setCommentText(text);
  };

  // Handle add comment
  const handleAddComment = async () => {
    try {
      if (!userId) {
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
      if (!commentText || commentText.trim() === '') return;
      
      // Set loading state
      setIsSubmittingComment(true);
      
      const username = localStorage.getItem('username');
      
      // Create comment data with the correct field name (content instead of text)
      const commentData = {
        content: commentText, // Backend expects 'content' field
        userId,
        username
      };
      
      // Call API to add comment
      const newComment = await apiService.addProgressComment(progress.id, commentData);
      
      if (!newComment) {
        throw new Error('Failed to add comment - no response from server');
      }
      
      // Create normalized comment with consistent fields
      const normalizedComment = normalizeComment({
        id: newComment.id || Date.now().toString(),
        userId,
        username,
        content: commentText,
        createdAt: newComment.createdAt || new Date().toISOString()
      });
      
      // Create updated comments array
      const updatedComments = [...(progress.comments || []), normalizedComment];
      
      // Initialize empty replies array for the new comment
      setCommentReplies(prev => ({
        ...prev,
        [normalizedComment.id]: []
      }));
      
      // Update progress via callback
      const updatedProgress = {
        ...progress,
        comments: updatedComments,
        commentCount: (progress.commentCount || 0) + 1
      };
      
      onProgressUpdate(updatedProgress);
      
      // Clear comment input
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Swal.fire({
        title: 'Error!',
        text: `Failed to add comment: ${error.message || 'Unknown error'}`,
        icon: 'error'
      });
    } finally {
      // Reset loading state
      setIsSubmittingComment(false);
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
  
  const handleUpdateComment = async (commentId) => {
    try {
      if (!editCommentText.trim()) return;
      
      // Set loading state
      setIsUpdatingComment(true);
      
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
        const updatedComments = progress.comments.map(comment => 
          comment.id === commentId 
            ? normalizeComment({ 
                ...comment, 
                content: editCommentText, 
                text: editCommentText 
              }) 
            : comment
        );
        
        // Update progress via callback
        const updatedProgress = {
          ...progress,
          comments: updatedComments
        };
        
        onProgressUpdate(updatedProgress);
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
    } finally {
      // Reset loading state
      setIsUpdatingComment(false);
    }
  };
  
  // Handle start delete comment process
  const handleDeleteComment = async (commentId) => {
    try {
      // Find the comment to be deleted
      let commentObj = null;
      let isParent = true;
      
      // First check if it's a main comment
      if (progress.comments) {
        commentObj = progress.comments.find(c => c.id === commentId);
      }
      
      // If not found in main comments, check in replies
      if (!commentObj) {
        isParent = false;
        // Loop through all replies to find the comment
        for (const [parentId, replies] of Object.entries(commentReplies)) {
          const foundReply = replies.find(r => r.id === commentId);
          if (foundReply) {
            commentObj = foundReply;
            break;
          }
        }
      }
      
      if (commentObj) {
        setCommentToDelete(commentObj);
        setIsParentComment(isParent);
        setShowDeleteModal(true);
      }
    } catch (error) {
      console.error('Error preparing to delete comment:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to prepare comment for deletion: ' + (error.message || 'Unknown error'),
        icon: 'error'
      });
    }
  };
  
  // Confirm delete comment after modal confirmation
  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      // Call API to delete comment - use the progress-specific endpoint
      await apiService.deleteProgressComment(commentToDelete.id);
      
      if (isParentComment) {
        // This is a main comment - also remove any replies tied to this comment from state
        setCommentReplies(prev => {
          const newReplies = { ...prev };
          delete newReplies[commentToDelete.id];
          return newReplies;
        });
        
        // Update local state - remove comment and update counts
        const updatedComments = progress.comments.filter(c => c.id !== commentToDelete.id);
        const repliesCount = commentReplies[commentToDelete.id]?.length || 0;
        const updatedProgress = {
          ...progress,
          comments: updatedComments,
          commentCount: Math.max(0, (progress.commentCount || 0) - 1 - repliesCount)
        };
        onProgressUpdate(updatedProgress);
      } else {
        // This is a reply - find its parent comment
        let parentCommentId = null;
        
        // Loop through all comments to find if this is a reply
        for (const [pCommentId, replies] of Object.entries(commentReplies)) {
          if (replies.some(reply => reply.id === commentToDelete.id)) {
            parentCommentId = pCommentId;
            break;
          }
        }
        
        if (parentCommentId) {
          // This is a reply - update the replies array
          setCommentReplies(prev => ({
            ...prev,
            [parentCommentId]: prev[parentCommentId].filter(reply => reply.id !== commentToDelete.id)
          }));
          
          // Update progress comment count
          const updatedProgress = {
            ...progress,
            commentCount: progress.commentCount > 0 ? progress.commentCount - 1 : 0
          };
          onProgressUpdate(updatedProgress);
        }
      }
      
      // Close modal and clear state
      setShowDeleteModal(false);
      setCommentToDelete(null);
      
      // Show success notification
      Swal.fire({
        title: 'Success!',
        text: 'Comment deleted successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete comment: ' + (error.message || 'Unknown error'),
        icon: 'error'
      });
      
      // Close modal and clear state even on error
      setShowDeleteModal(false);
      setCommentToDelete(null);
    }
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };

  // Reply functions
  const startReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyText(prev => ({ ...prev, [commentId]: '' }));
  };
  
  const cancelReply = () => {
    setReplyingTo(null);
  };
  
  const handleAddReply = async (commentId) => {
    try {
      if (!userId) {
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
      
      // Set loading state
      setIsSubmittingReply(prev => ({
        ...prev,
        [commentId]: true
      }));
      
      const username = localStorage.getItem('username');
      
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
      
      // Update progress comment count
      const updatedProgress = {
        ...progress,
        commentCount: (progress.commentCount || 0) + 1
      };
      onProgressUpdate(updatedProgress);
      
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
    } finally {
      // Reset loading state
      setIsSubmittingReply(prev => ({
        ...prev,
        [commentId]: false
      }));
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
        // Set loading state for this specific comment's replies
        setLoadingReplies(prev => ({
          ...prev,
          [commentId]: true
        }));
        
        const replyData = await apiService.getCommentReplies(commentId);
        
        if (replyData && replyData.length > 0) {
          // Store normalized replies in the state
          const normalizedReplies = replyData.map(normalizeComment);
          setCommentReplies(prev => ({
            ...prev,
            [commentId]: normalizedReplies
          }));
          
          // Update the comment count to include replies if it doesn't already
          if (progress.commentCount !== (progress.comments?.length || 0) + normalizedReplies.length) {
            const updatedProgress = {
              ...progress,
              commentCount: (progress.comments?.length || 0) + normalizedReplies.length
            };
            onProgressUpdate(updatedProgress);
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
      } finally {
        // Clear loading state
        setLoadingReplies(prev => ({
          ...prev,
          [commentId]: false
        }));
      }
    }
  };

  // Spinner component for loading states
  const LoadingSpinner = ({ size = 'sm' }) => (
    <div className={`inline-block ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} mr-2 animate-spin`}>
      <div className={`h-full w-full border-2 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full`}></div>
    </div>
  );

  return (
    <div>
      {/* Like and Comment Actions */}
      <div className="flex items-center pt-4 mt-4 border-t border-gray-200">
        <button 
          onClick={handleLikeProgress}
          className={`flex items-center mr-4 px-2 py-1 text-sm rounded-md 
            ${progress.likes && progress.likes.includes(userId) 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
        >
          {progress.likes && progress.likes.includes(userId) 
            ? <FaThumbsUp className="mr-1" /> 
            : <FaRegThumbsUp className="mr-1" />}
          Like {progress.likeCount > 0 && `(${progress.likeCount})`}
        </button>
        
        <button 
          onClick={handleToggleComments}
          className="flex items-center px-2 py-1 text-sm text-gray-500 rounded-md hover:text-blue-600 hover:bg-blue-50"
        >
          <FaRegComment className="mr-1" /> 
          Comments {progress.commentCount > 0 && `(${progress.commentCount})`}
        </button>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          {/* Loading Indicator */}
          {isLoadingComments && (
            <div className="flex justify-center items-center py-6">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-600">Loading comments...</span>
            </div>
          )}
          
          {/* Comment List */}
          {!isLoadingComments && progress.comments && progress.comments.length > 0 ? (
            <div className="mb-4 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {progress.comments.map(comment => (
                <div key={comment.id} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium text-xs">
                      {comment.userName?.charAt(0).toUpperCase() || comment.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-sm text-gray-800">
                            <Link to={`/profile/${comment.userId}`} className="hover:text-indigo-600 transition-colors">
                              {comment.userName || comment.username || 'User'}
                            </Link>
                            {comment.userId === userId && (
                              <span className="ml-1 text-xs text-indigo-600 font-normal">(You)</span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {comment.userId === userId && (
                              <>
                                <button 
                                  onClick={() => startEditComment(comment)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteComment(comment.id)}
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
                                disabled={isUpdatingComment}
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleUpdateComment(comment.id)}
                                className="text-xs text-white bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-70 flex items-center"
                                disabled={isUpdatingComment || !editCommentText.trim()}
                              >
                                {isUpdatingComment ? (
                                  <>
                                    <LoadingSpinner />
                                    <span>Updating...</span>
                                  </>
                                ) : (
                                  'Save'
                                )}
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
                              disabled={isSubmittingReply[comment.id]}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAddReply(comment.id)}
                              className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-70 flex items-center"
                              disabled={isSubmittingReply[comment.id] || !replyText[comment.id]?.trim()}
                            >
                              {isSubmittingReply[comment.id] ? (
                                <>
                                  <LoadingSpinner />
                                  <span>Replying...</span>
                                </>
                              ) : (
                                'Reply'
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Replies Section */}
                      {expandedReplies[comment.id] && (
                        <div className="mt-2 ml-8 space-y-2">
                          {/* Loading indicator for replies */}
                          {loadingReplies[comment.id] && (
                            <div className="flex items-center justify-center py-2">
                              <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                              <span className="ml-2 text-xs text-gray-500">Loading replies...</span>
                            </div>
                          )}
                          
                          {commentReplies[comment.id]?.length > 0 ? (
                            commentReplies[comment.id].map(reply => (
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
                                      {reply.userId === userId && (
                                        <span className="ml-1 text-xs text-indigo-600 font-normal">(You)</span>
                                      )}
                                    </div>
                                    {reply.userId === userId && (
                                      <div className="flex space-x-2">
                                        <button 
                                          onClick={() => startEditComment(reply)}
                                          className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                          Edit
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteComment(reply.id)}
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
                                          disabled={isUpdatingComment}
                                        >
                                          Cancel
                                        </button>
                                        <button 
                                          onClick={() => handleUpdateComment(reply.id)}
                                          className="text-xs text-white bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-70 flex items-center"
                                          disabled={isUpdatingComment || !editCommentText.trim()}
                                        >
                                          {isUpdatingComment ? (
                                            <>
                                              <LoadingSpinner />
                                              <span>Updating...</span>
                                            </>
                                          ) : (
                                            'Save'
                                          )}
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
                            ))
                          ) : (
                            !loadingReplies[comment.id] && <p className="text-xs text-gray-500 italic">No replies yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isLoadingComments && <p className="mb-4 text-sm text-gray-500 italic">No comments yet. Be the first to comment!</p>
          )}
          
          {/* Comment Form */}
          <div className="flex">
            <input
              type="text"
              value={commentText}
              onChange={(e) => handleCommentChange(e.target.value)}
              placeholder="Add a comment..."
              className="flex-grow p-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              className="flex items-center justify-center px-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-70"
              disabled={isSubmittingComment || !commentText}
            >
              {isSubmittingComment ? (
                <LoadingSpinner />
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && commentToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={cancelDelete}></div>

            {/* This element centers the modal contents */}
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete {isParentComment ? 'Comment' : 'Reply'}</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-2">
                        Are you sure you want to delete this {isParentComment ? 'comment' : 'reply'}? This action cannot be undone.
                      </p>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-600">
                          <span className="text-blue-600">{commentToDelete.userName || commentToDelete.username || 'User'}</span> wrote:
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{commentToDelete.content || commentToDelete.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDeleteComment}
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

export default ProgressLikeCommentOfUserdashnoard; 