import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FaThumbsUp, FaRegThumbsUp, FaComment, FaRegComment } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { toast } from "react-toastify";

// Helper function to get the display name for a user
const getDisplayName = (user) => {
  if (!user) return "Unknown User";
  
  // Prioritize full name if available
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  } else if (user.firstName) {
    return user.firstName;
  } else if (user.lastName) {
    return user.lastName;
  } else {
    return user.username || "Unknown User";
  }
};

// Helper function to get initials for avatar
const getUserInitials = (user) => {
  if (!user) return "?";
  
  // Use first letter of first name and first letter of last name if available
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  } else if (user.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  } else if (user.lastName) {
    return user.lastName.charAt(0).toUpperCase();
  } else if (user.username) {
    return user.username.charAt(0).toUpperCase();
  } else {
    return "?";
  }
};

const ProgressLikeAndComment = ({ progress, onProgressUpdate }) => {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId');
  
  // Comments and likes state
  const [expandedComments, setExpandedComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  // State for comment replies
  const [commentReplies, setCommentReplies] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [loadingReplies, setLoadingReplies] = useState({});

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isParentComment, setIsParentComment] = useState(false);
  
  // Button loading states
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState({});
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  // Toggle comments visibility for a progress update
  const toggleComments = async () => {
    // Toggle expanded state
    setExpandedComments(prev => !prev);
    
    // If expanding and comments not loaded yet, fetch them
    if (!expandedComments && comments.length === 0) {
      try {
        setIsLoadingComments(true);
        console.log(`Fetching comments for progress ${progress.id}...`);
        const commentData = await apiService.getProgressComments(progress.id);
        console.log(`Received comments:`, commentData);
        
        // Store the comments in the state
        setComments(commentData || []);
        
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
          await Promise.all(replyPromises);
          
          // Update the progress comment count to reflect the actual number of comments + replies
          const totalCommentCount = commentData.length + totalReplyCount;
          
          // Update the progress via callback
          onProgressUpdate({
            ...progress,
            commentCount: totalCommentCount
          });
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load comments. Please try again later.');
        
        // Initialize with empty array in case of error
        setComments([]);
      } finally {
        setIsLoadingComments(false);
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
        setLoadingReplies(prev => ({
          ...prev,
          [commentId]: true
        }));
        
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
      } finally {
        setLoadingReplies(prev => ({
          ...prev,
          [commentId]: false
        }));
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

  // Handle adding a new comment
  const handleAddComment = async () => {
    // Check if user is logged in
    if (!currentUserId) {
      toast.info('Please sign in to comment on progress updates');
      // Redirect to sign in page
      window.location.href = '/signin';
      return;
    }
    
    if (!commentText.trim()) return;
    
    // Set loading state
    setIsSubmittingComment(true);
    
    try {
      const newComment = {
        content: commentText
      };
      
      const createdComment = await apiService.addProgressComment(progress.id, newComment);
      
      // Update comments state with the new comment
      setComments(prev => [...prev, createdComment]);

      // Initialize empty replies array for the new comment
      setCommentReplies(prev => ({
        ...prev,
        [createdComment.id]: []
      }));
      
      // Update progress via callback
      onProgressUpdate({
        ...progress,
        commentCount: (progress.commentCount || 0) + 1
      });
      
      // Clear comment input
      setCommentText('');
      
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
    } finally {
      // Reset loading state
      setIsSubmittingComment(false);
    }
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
  const handleUpdateComment = async (commentId) => {
    if (!checkAuthenticated()) return;
    if (!editCommentText.trim()) return;
    
    // Set loading state
    setIsUpdatingComment(true);
    
    try {
      const updatedComment = {
        content: editCommentText
      };
      
      await apiService.updateProgressComment(commentId, updatedComment);
      
      // Check if this is a reply by looking for it in commentReplies
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
              ? { ...reply, content: editCommentText } 
              : reply
          )
        }));
      } else {
        // It's a regular comment - update it in the comments state
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, content: editCommentText } 
            : comment
        ));
      }
      
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
    } finally {
      // Reset loading state
      setIsUpdatingComment(false);
    }
  };

  // Start delete comment process
  const handleDeleteComment = async (commentId) => {
    if (!checkAuthenticated()) return;
    
    // Find the comment to be deleted
    let commentObj = null;
    let isParent = true;
    
    // First check if it's a main comment
    commentObj = comments.find(c => c.id === commentId);
    
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
  };
  
  // Confirm delete after modal confirmation
  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      await apiService.deleteProgressComment(commentToDelete.id);
      
      if (isParentComment) {
        // This is a regular comment - count how many replies it has before removing it
        const replyCount = commentReplies[commentToDelete.id]?.length || 0;
        
        // Remove the comment from the comments state
        setComments(prev => prev.filter(comment => comment.id !== commentToDelete.id));
        
        // Remove associated replies if any
        if (commentReplies[commentToDelete.id]) {
          setCommentReplies(prev => {
            const newReplies = { ...prev };
            delete newReplies[commentToDelete.id];
            return newReplies;
          });
        }
        
        // Update progress via callback
        onProgressUpdate({
          ...progress,
          commentCount: Math.max(0, (progress.commentCount || 0) - (1 + replyCount))
        });
      } else {
        // This is a reply - find parent comment and remove reply
        let parentCommentId = null;
        
        // Find parent comment id
        for (const [parentId, replies] of Object.entries(commentReplies)) {
          if (replies.some(r => r.id === commentToDelete.id)) {
            parentCommentId = parentId;
            break;
          }
        }
        
        if (parentCommentId) {
          // This is a reply - remove it from the replies state
          setCommentReplies(prev => ({
            ...prev,
            [parentCommentId]: prev[parentCommentId].filter(reply => reply.id !== commentToDelete.id)
          }));
          
          // Update progress via callback
          onProgressUpdate({
            ...progress,
            commentCount: Math.max(0, (progress.commentCount || 0) - 1)
          });
        }
      }
      
      // Close modal and clear state
      setShowDeleteModal(false);
      setCommentToDelete(null);
      
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
  const handleAddReply = async (commentId) => {
    // Check if user is logged in
    if (!currentUserId) {
      toast.info('Please sign in to reply to comments');
      window.location.href = '/signin';
      return;
    }
    
    if (!replyText[commentId]?.trim()) return;
    
    // Set loading state for this specific reply
    setIsSubmittingReply(prev => ({
      ...prev,
      [commentId]: true
    }));
    
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
      
      // Update progress via callback
      onProgressUpdate({
        ...progress,
        commentCount: (progress.commentCount || 0) + 1
      });
      
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
    } finally {
      // Reset loading state
      setIsSubmittingReply(prev => ({
        ...prev,
        [commentId]: false
      }));
    }
  };
  
  // Toggle like on a progress update
  const toggleLike = async () => {
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
        
        // Update the progress via callback
        onProgressUpdate({
          ...progress,
          likes: progress.likes.filter(id => id !== currentUserId),
          likeCount: progress.likeCount - 1
        });
      } else {
        // Otherwise, add a like
        await apiService.likeProgress(progress.id);
        
        // Update the progress via callback
        onProgressUpdate({
          ...progress,
          likes: [...(progress.likes || []), currentUserId],
          likeCount: (progress.likeCount || 0) + 1
        });
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

  // Handle clicking on a user's profile
  const handleProfileClick = (profileUserId) => {
    // Check if user is logged in before allowing profile navigation
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      toast.info('Please sign in to view user profiles');
      window.location.href = '/signin';
      return;
    }
    
    // Navigate to the user's profile page
    navigate(`/profile/${profileUserId}`);
  };

  // Spinner component for loading states
  const LoadingSpinner = ({ size = 'sm' }) => (
    <div className={`inline-block ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} mr-2 animate-spin`}>
      <div className={`h-full w-full border-2 border-t-white border-white/30 rounded-full`}></div>
    </div>
  );

  return (
    <div>
      {/* Like and Comment Actions */}
      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center space-x-6">
        {/* Like button - clickable for all users, but prompts login for non-logged in users */}
        <button 
          onClick={toggleLike}
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
          onClick={toggleComments}
          className={`flex items-center text-sm ${expandedComments ? 'text-blue-600' : 'text-gray-500'} cursor-pointer hover:text-blue-600`}
        >
          {expandedComments ? <FaComment className="mr-1" /> : <FaRegComment className="mr-1" />}
          <span className={expandedComments ? "font-medium" : ""}>
            {progress.commentCount || 0}
          </span>
          <span className="ml-1">
            {progress.commentCount === 1 ? 'Comment' : 'Comments'}
          </span>
        </div>
      </div>
      
      {/* Comments Section - visible to all users */}
      {expandedComments && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          {/* Loading Indicator */}
          {isLoadingComments && (
            <div className="flex justify-center items-center py-6">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-600">Loading comments...</span>
            </div>
          )}
          
          {/* Comment List */}
          {!isLoadingComments && (
            <div className="space-y-3 mb-3">
              {comments.length > 0 ? (
                <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-2 mb-3">
                      <div 
                        className="w-8 h-8 bg-indigo-500 rounded-full text-white flex items-center justify-center font-bold mr-2 cursor-pointer"
                        onClick={() => comment.userId && handleProfileClick(comment.userId)}
                      >
                        {getUserInitials({ firstName: comment.userName?.split(' ')[0] || '', lastName: comment.userName?.split(' ')[1] || '' })}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-baseline">
                              <span 
                                className="font-medium text-indigo-700 hover:text-indigo-500 cursor-pointer"
                                onClick={() => comment.userId && handleProfileClick(comment.userId)}
                              >
                                {comment.userName || 'Unknown User'}
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
                                  className="text-xs text-white bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-70"
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
                                  <div 
                                    className="w-7 h-7 bg-purple-500 rounded-full text-white flex items-center justify-center font-bold mr-2 cursor-pointer"
                                    onClick={() => reply.userId && handleProfileClick(reply.userId)}
                                  >
                                    {getUserInitials({ firstName: reply.userName?.split(' ')[0] || '', lastName: reply.userName?.split(' ')[1] || '' })}
                                  </div>
                                  <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-baseline">
                                        <span 
                                          className="font-medium text-purple-700 hover:text-purple-500 cursor-pointer"
                                          onClick={() => reply.userId && handleProfileClick(reply.userId)}
                                        >
                                          {reply.userName || 'Unknown User'}
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
                                      <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                                    )}
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
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
              )}
            </div>
          )}
          
          {/* Add Comment Form - only for logged-in users */}
          {currentUserId ? (
            <div className="flex space-x-2 mt-3">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium">
                {getUserInitials({ firstName: localStorage.getItem('username')?.split(' ')[0], lastName: localStorage.getItem('username')?.split(' ')[1] })}
              </div>
              <div className="flex-1">
                <textarea
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  rows="1"
                />
                <div className="flex justify-end mt-1">
                  <button
                    onClick={handleAddComment}
                    className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-70 flex items-center"
                    disabled={isSubmittingComment || !commentText.trim()}
                  >
                    {isSubmittingComment ? (
                      <>
                        <LoadingSpinner />
                        <span>Commenting...</span>
                      </>
                    ) : (
                      'Comment'
                    )}
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && commentToDelete && (
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete {isParentComment ? 'Comment' : 'Reply'}</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-2">
                        Are you sure you want to delete this {isParentComment ? 'comment' : 'reply'}? This action cannot be undone.
                      </p>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-600">
                          <span className="text-blue-600">{commentToDelete.userName || 'User'}</span> wrote:
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{commentToDelete.content}</p>
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

export default ProgressLikeAndComment; 