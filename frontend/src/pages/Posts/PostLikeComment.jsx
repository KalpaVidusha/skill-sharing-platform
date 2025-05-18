import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaPencilAlt, FaTrash, FaHeart, FaRegHeart,
  FaComment, FaUser
} from 'react-icons/fa';
import apiService from '../../services/api';
import { format } from 'date-fns';

// Helper function to parse dates correctly regardless of format
const parseDate = (dateValue) => {
  if (!dateValue) return null;
  
  // Handle string date
  if (typeof dateValue === 'string') {
    return new Date(dateValue);
  }
  
  // Handle array format [year, month, day, hour, minute, second]
  if (Array.isArray(dateValue) && dateValue.length >= 3) {
    // Month in JS Date is 0-indexed, but likely 1-indexed in the array
    return new Date(
      dateValue[0], 
      dateValue[1] - 1, 
      dateValue[2], 
      dateValue[3] || 0, 
      dateValue[4] || 0, 
      dateValue[5] || 0
    );
  }
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  return null;
};

const PostLikeComment = ({ postId, isLoggedIn, isPostOwner, initialLikeCount = 0, initialLiked = false }) => {
  const navigate = useNavigate();
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(initialLiked);
  const [showConfirm, setShowConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [userCache, setUserCache] = useState({});

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsData = await apiService.getCommentsByPost(postId);
        setComments(commentsData);
        
        // Fetch user details for each comment
        const uniqueUserIds = [...new Set(commentsData.map(comment => comment.userId))];
        const newUserCache = { ...userCache };
        
        for (const userId of uniqueUserIds) {
          if (!newUserCache[userId]) {
            try {
              const userData = await apiService.getUserById(userId);
              newUserCache[userId] = userData;
            } catch (userErr) {
              console.error(`Error fetching user ${userId}:`, userErr);
              newUserCache[userId] = { username: 'Unknown User' };
            }
          }
        }
        
        setUserCache(newUserCache);
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };

    fetchComments();
  }, [postId]);

  useEffect(() => {
    // Update like count and status when props change
    setLikeCount(initialLikeCount);
    setLiked(initialLiked);
  }, [initialLikeCount, initialLiked]);

  const handleAddComment = async () => {
    if (!isLoggedIn) return navigate(`/login`, { state: { returnTo: `/posts/${postId}` } });
    if (!newComment.trim()) return setError('Comment cannot be empty');
    try {
      await apiService.addComment({ postId, content: newComment });
      setNewComment('');
      setError('');
      const data = await apiService.getCommentsByPost(postId);
      setComments(data);
      
      // Update user cache for new comments
      const newUserIds = data
        .filter(comment => !userCache[comment.userId])
        .map(comment => comment.userId);
      
      if (newUserIds.length > 0) {
        const newUserCache = { ...userCache };
        for (const userId of newUserIds) {
          try {
            const userData = await apiService.getUserById(userId);
            newUserCache[userId] = userData;
          } catch (userErr) {
            console.error(`Error fetching user ${userId}:`, userErr);
            newUserCache[userId] = { username: 'Unknown User' };
          }
        }
        setUserCache(newUserCache);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment.');
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      await apiService.updateComment(commentId, { content });
      const data = await apiService.getCommentsByPost(postId);
      setComments(data);
      setEditingComment(null);
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment.');
    }
  };

  const confirmDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setCommentToDelete(null);
    setShowConfirm(false);
  };

  const handleDeleteComment = async () => {
    try {
      await apiService.deleteComment(commentToDelete);
      const data = await apiService.getCommentsByPost(postId);
      setComments(data);
      setShowConfirm(false);
      setCommentToDelete(null);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment.');
    }
  };

  const handleToggleLike = async () => {
    if (!isLoggedIn) return navigate(`/login`, { state: { returnTo: `/posts/${postId}` } });
    try {
      const data = await apiService.toggleLike(postId);
      setLikeCount(data.likeCount);
      setLiked(data.likedByCurrentUser);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const canEditComment = (comment) => {
    const userId = localStorage.getItem('userId');
    return isLoggedIn && comment.userId === userId;
  };

  const canDeleteComment = (comment) => {
    const userId = localStorage.getItem('userId');
    return isLoggedIn && (comment.userId === userId || isPostOwner);
  };

  // Helper function to get the username for a comment
  const getCommentAuthor = (comment) => {
    if (!comment || !comment.userId) return 'Unknown User';
    const user = userCache[comment.userId];
    
    if (!user) return 'Unknown User';
    
    // Return full name if both firstName and lastName are available
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    // Fallback options in order of preference
    return user.fullName || user.name || user.username || 'Unknown User';
  };

  return (
    <>
      <button 
        onClick={handleToggleLike}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
          liked 
            ? 'bg-indigo-600 text-white' 
            : 'bg-indigo-100 text-indigo-700'
        } transition hover:shadow-md`}
      >
        {liked ? (
          <FaHeart className="mr-2" />
        ) : (
          <FaRegHeart className="mr-2" />
        )}
        <span>{liked ? 'Liked' : 'Like'} ({likeCount})</span>
      </button>

      <div className="mt-12 border border-gray-200 rounded-xl p-6 bg-white">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
          <FaComment className="mr-2 text-indigo-600" /> Leave a Comment
        </h3>
        <textarea
          placeholder={isLoggedIn ? "Share your thoughts..." : "Please log in to leave a comment"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-32 resize-y"
          disabled={!isLoggedIn}
        />
        {error && (
          <p className="text-red-600 bg-red-50 p-2 rounded-md mt-2 text-sm border border-red-200">
            {error}
          </p>
        )}
        <button
          onClick={handleAddComment}
          disabled={!isLoggedIn}
          className={`mt-4 px-6 py-2 rounded-lg font-medium flex items-center ${
            isLoggedIn 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          } transition`}
        >
          <FaPencilAlt className="mr-2" /> Post Comment
        </button>
      </div>

      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-800 pb-3 border-b-2 border-indigo-200 flex items-center">
          <FaComment className="mr-2 text-indigo-600" /> Comments ({comments.length})
        </h3>
        
        {comments.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg mt-4 border border-gray-200">
            <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {comments.map((c) => (
              <div 
                key={c.id} 
                className="bg-white p-5 rounded-lg border-l-4 border-indigo-500 shadow-sm"
              >
                {editingComment === c.id ? (
                  <>
                    <textarea
                      value={c.content}
                      onChange={(e) => {
                        const updated = comments.map(comment =>
                          comment.id === c.id ? { ...comment, content: e.target.value } : comment
                        );
                        setComments(updated);
                      }}
                      className="w-full p-4 border border-gray-300 rounded-lg mb-4 min-h-32 resize-y"
                    />
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleUpdateComment(c.id, c.content)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                      >
                        <FaPencilAlt className="mr-2" /> Save
                      </button>
                      <button 
                        onClick={() => setEditingComment(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 mr-2">
                        <FaUser />
                      </div>
                      <Link 
                        to={`/profile/${c.userId}`} 
                        className="font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
                      >
                        {getCommentAuthor(c)}
                      </Link>
                    </div>
                    <p className="text-gray-700 mb-3">{c.content}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {c.createdAt && (() => {
                          const parsedDate = parseDate(c.createdAt);
                          return parsedDate && !isNaN(parsedDate.getTime())
                            ? `Posted on ${format(parsedDate, 'MMM dd, yyyy h:mm a')}`
                            : 'Recently posted';
                        })()}
                      </span>
                      
                      {(canEditComment(c) || canDeleteComment(c)) && (
                        <div className="flex space-x-2">
                          {canEditComment(c) && (
                            <button 
                              onClick={() => setEditingComment(c.id)}
                              className="text-xs flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                            >
                              <FaPencilAlt className="mr-1" /> Edit
                            </button>
                          )}
                          {canDeleteComment(c) && (
                            <button 
                              onClick={() => confirmDeleteComment(c.id)}
                              className="text-xs flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                            >
                              <FaTrash className="mr-1" /> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaTrash className="text-red-600 mr-2" /> Delete Comment
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteComment} 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <FaTrash className="mr-2" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostLikeComment;