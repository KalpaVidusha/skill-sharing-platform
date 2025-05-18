// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   FaPencilAlt, FaTrash, FaHeart, FaRegHeart,
//   FaComment
// } from 'react-icons/fa';
// import apiService from '../../services/api';

// const PostLikeComment = ({ postId, isLoggedIn, isPostOwner, initialLikeCount = 0, initialLiked = false }) => {
//   const navigate = useNavigate();
  
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState('');
//   const [error, setError] = useState('');
//   const [editingComment, setEditingComment] = useState(null);
//   const [likeCount, setLikeCount] = useState(initialLikeCount);
//   const [liked, setLiked] = useState(initialLiked);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [commentToDelete, setCommentToDelete] = useState(null);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const commentsData = await apiService.getCommentsByPost(postId);
//         setComments(commentsData);
//       } catch (err) {
//         console.error('Error fetching comments:', err);
//       }
//     };

//     fetchComments();
//   }, [postId]);

//   useEffect(() => {
//     // Update like count and status when props change
//     setLikeCount(initialLikeCount);
//     setLiked(initialLiked);
//   }, [initialLikeCount, initialLiked]);

//   const handleAddComment = async () => {
//     if (!isLoggedIn) return navigate(`/login`, { state: { returnTo: `/posts/${postId}` } });
//     if (!newComment.trim()) return setError('Comment cannot be empty');
//     try {
//       await apiService.addComment({ postId, content: newComment });
//       setNewComment('');
//       setError('');
//       const data = await apiService.getCommentsByPost(postId);
//       setComments(data);
//     } catch (err) {
//       console.error('Error adding comment:', err);
//       setError('Failed to add comment.');
//     }
//   };

//   const handleUpdateComment = async (commentId, content) => {
//     try {
//       await apiService.updateComment(commentId, { content });
//       const data = await apiService.getCommentsByPost(postId);
//       setComments(data);
//       setEditingComment(null);
//     } catch (err) {
//       console.error('Error updating comment:', err);
//       setError('Failed to update comment.');
//     }
//   };

//   const confirmDeleteComment = (commentId) => {
//     setCommentToDelete(commentId);
//     setShowConfirm(true);
//   };

//   const cancelDelete = () => {
//     setCommentToDelete(null);
//     setShowConfirm(false);
//   };

//   const handleDeleteComment = async () => {
//     try {
//       await apiService.deleteComment(commentToDelete);
//       const data = await apiService.getCommentsByPost(postId);
//       setComments(data);
//       setShowConfirm(false);
//       setCommentToDelete(null);
//     } catch (err) {
//       console.error('Error deleting comment:', err);
//       setError('Failed to delete comment.');
//     }
//   };

//   const handleToggleLike = async () => {
//     if (!isLoggedIn) return navigate(`/login`, { state: { returnTo: `/posts/${postId}` } });
//     try {
//       const data = await apiService.toggleLike(postId);
//       setLikeCount(data.likeCount);
//       setLiked(data.likedByCurrentUser);
//     } catch (err) {
//       console.error('Like error:', err);
//     }
//   };

//   const canEditComment = (comment) => {
//     const userId = localStorage.getItem('userId');
//     return isLoggedIn && comment.userId === userId;
//   };

//   const canDeleteComment = (comment) => {
//     const userId = localStorage.getItem('userId');
//     return isLoggedIn && (comment.userId === userId || isPostOwner);
//   };

//   return (
//     <>
//       <button 
//         onClick={handleToggleLike}
//         className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
//           liked 
//             ? 'bg-indigo-600 text-white' 
//             : 'bg-indigo-100 text-indigo-700'
//         } transition hover:shadow-md`}
//       >
//         {liked ? (
//           <FaHeart className="mr-2" />
//         ) : (
//           <FaRegHeart className="mr-2" />
//         )}
//         <span>{liked ? 'Liked' : 'Like'} ({likeCount})</span>
//       </button>

//       <div className="p-6 mt-12 bg-white border border-gray-200 rounded-xl">
//         <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800">
//           <FaComment className="mr-2 text-indigo-600" /> Leave a Comment
//         </h3>
//         <textarea
//           placeholder={isLoggedIn ? "Share your thoughts..." : "Please log in to leave a comment"}
//           value={newComment}
//           onChange={(e) => setNewComment(e.target.value)}
//           className="w-full p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-32"
//           disabled={!isLoggedIn}
//         />
//         {error && (
//           <p className="p-2 mt-2 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
//             {error}
//           </p>
//         )}
//         <button
//           onClick={handleAddComment}
//           disabled={!isLoggedIn}
//           className={`mt-4 px-6 py-2 rounded-lg font-medium flex items-center ${
//             isLoggedIn 
//               ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
//               : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//           } transition`}
//         >
//           <FaPencilAlt className="mr-2" /> Post Comment
//         </button>
//       </div>

//       <div className="mt-12">
//         <h3 className="flex items-center pb-3 text-lg font-semibold text-gray-800 border-b-2 border-indigo-200">
//           <FaComment className="mr-2 text-indigo-600" /> Comments ({comments.length})
//         </h3>
        
//         {comments.length === 0 ? (
//           <div className="p-8 mt-4 text-center border border-gray-200 rounded-lg bg-gray-50">
//             <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
//           </div>
//         ) : (
//           <div className="mt-6 space-y-4">
//             {comments.map((c) => (
//               <div 
//                 key={c.id} 
//                 className="p-5 bg-white border-l-4 border-indigo-500 rounded-lg shadow-sm"
//               >
//                 {editingComment === c.id ? (
//                   <>
//                     <textarea
//                       value={c.content}
//                       onChange={(e) => {
//                         const updated = comments.map(comment =>
//                           comment.id === c.id ? { ...comment, content: e.target.value } : comment
//                         );
//                         setComments(updated);
//                       }}
//                       className="w-full p-4 mb-4 border border-gray-300 rounded-lg resize-y min-h-32"
//                     />
//                     <div className="flex space-x-3">
//                       <button 
//                         onClick={() => handleUpdateComment(c.id, c.content)}
//                         className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
//                       >
//                         <FaPencilAlt className="mr-2" /> Save
//                       </button>
//                       <button 
//                         onClick={() => setEditingComment(null)}
//                         className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <p className="mb-3 text-gray-700">{c.content}</p>
//                     <div className="flex items-center justify-between mt-4">
//                       <span className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
//                         Posted on {new Date(c.createdAt).toLocaleString()}
//                       </span>
                      
//                       {(canEditComment(c) || canDeleteComment(c)) && (
//                         <div className="flex space-x-2">
//                           {canEditComment(c) && (
//                             <button 
//                               onClick={() => setEditingComment(c.id)}
//                               className="flex items-center px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
//                             >
//                               <FaPencilAlt className="mr-1" /> Edit
//                             </button>
//                           )}
//                           {canDeleteComment(c) && (
//                             <button 
//                               onClick={() => confirmDeleteComment(c.id)}
//                               className="flex items-center px-3 py-1 text-xs text-red-700 bg-red-100 rounded-md hover:bg-red-200"
//                             >
//                               <FaTrash className="mr-1" /> Delete
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {showConfirm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-xl">
//             <h3 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
//               <FaTrash className="mr-2 text-red-600" /> Delete Comment
//             </h3>
//             <p className="mb-6 text-gray-700">
//               Are you sure you want to delete this comment? This action cannot be undone.
//             </p>
//             <div className="flex justify-end space-x-3">
//               <button 
//                 onClick={cancelDelete}
//                 className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={handleDeleteComment} 
//                 className="flex items-center px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
//               >
//                 <FaTrash className="mr-2" /> Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default PostLikeComment;


import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaPencilAlt,
  FaTrash,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaUser,
} from "react-icons/fa";
import apiService from "../../services/api";

// ✅ Helper to parse array-based timestamp
const parseCreatedAt = (arr) => {
  if (!Array.isArray(arr) || arr.length < 6) return new Date("Invalid");
  return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
};

const PostLikeComment = ({
  postId,
  isLoggedIn,
  isPostOwner,
  initialLikeCount = 0,
  initialLiked = false,
}) => {
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
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

        const uniqueUserIds = [
          ...new Set(commentsData.map((comment) => comment.userId)),
        ];
        const newUserCache = { ...userCache };

        for (const userId of uniqueUserIds) {
          if (!newUserCache[userId]) {
            try {
              const userData = await apiService.getUserById(userId);
              newUserCache[userId] = userData;
            } catch {
              newUserCache[userId] = { username: "Unknown User" };
            }
          }
        }

        setUserCache(newUserCache);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    fetchComments();
  }, [postId]);

  useEffect(() => {
    setLikeCount(initialLikeCount);
    setLiked(initialLiked);
  }, [initialLikeCount, initialLiked]);

  const handleAddComment = async () => {
    if (!isLoggedIn)
      return navigate(`/login`, { state: { returnTo: `/posts/${postId}` } });
    if (!newComment.trim()) return setError("Comment cannot be empty");
    try {
      await apiService.addComment({ postId, content: newComment });
      setNewComment("");
      setError("");
      const data = await apiService.getCommentsByPost(postId);
      setComments(data);

      const newUserIds = data
        .filter((comment) => !userCache[comment.userId])
        .map((comment) => comment.userId);

      if (newUserIds.length > 0) {
        const newUserCache = { ...userCache };
        for (const userId of newUserIds) {
          try {
            const userData = await apiService.getUserById(userId);
            newUserCache[userId] = userData;
          } catch {
            newUserCache[userId] = { username: "Unknown User" };
          }
        }
        setUserCache(newUserCache);
      }
    } catch (err) {
      setError("Failed to add comment.");
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      await apiService.updateComment(commentId, { content });
      const data = await apiService.getCommentsByPost(postId);
      setComments(data);
      setEditingComment(null);
    } catch {
      setError("Failed to update comment.");
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
    } catch {
      setError("Failed to delete comment.");
    }
  };

  const handleToggleLike = async () => {
    if (!isLoggedIn)
      return navigate(`/login`, { state: { returnTo: `/posts/${postId}` } });
    try {
      const data = await apiService.toggleLike(postId);
      setLikeCount(data.likeCount);
      setLiked(data.likedByCurrentUser);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const canEditComment = (comment) => {
    const userId = localStorage.getItem("userId");
    return isLoggedIn && comment.userId === userId;
  };

  const canDeleteComment = (comment) => {
    const userId = localStorage.getItem("userId");
    return isLoggedIn && (comment.userId === userId || isPostOwner);
  };

  const getCommentAuthor = (comment) => {
    const user = userCache[comment.userId];
    if (!user) return "Unknown User";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.fullName || user.name || user.username || "Unknown User";
  };

  return (
    <>
      <button
        onClick={handleToggleLike}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
          liked ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"
        } transition hover:shadow-md`}
      >
        {liked ? <FaHeart className="mr-2" /> : <FaRegHeart className="mr-2" />}
        <span>
          {liked ? "Liked" : "Like"} ({likeCount})
        </span>
      </button>

      <div className="p-6 mt-12 bg-white border border-gray-200 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800">
          <FaComment className="mr-2 text-indigo-600" /> Leave a Comment
        </h3>
        <textarea
          placeholder={
            isLoggedIn
              ? "Share your thoughts..."
              : "Please log in to leave a comment"
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-32"
          disabled={!isLoggedIn}
        />
        {error && (
          <p className="p-2 mt-2 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
            {error}
          </p>
        )}
        <button
          onClick={handleAddComment}
          disabled={!isLoggedIn}
          className={`mt-4 px-6 py-2 rounded-lg font-medium flex items-center ${
            isLoggedIn
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          } transition`}
        >
          <FaPencilAlt className="mr-2" /> Post Comment
        </button>
      </div>

      <div className="mt-12">
        <h3 className="flex items-center pb-3 text-lg font-semibold text-gray-800 border-b-2 border-indigo-200">
          <FaComment className="mr-2 text-indigo-600" /> Comments (
          {comments.length})
        </h3>

        {comments.length === 0 ? (
          <div className="p-8 mt-4 text-center border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-600">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {comments.map((c) => {
              const parsedDate = parseCreatedAt(c.createdAt);
              return (
                <div
                  key={c.id}
                  className="p-5 bg-white border-l-4 border-indigo-500 rounded-lg shadow-sm"
                >
                  {editingComment === c.id ? (
                    <>
                      <textarea
                        value={c.content}
                        onChange={(e) => {
                          const updated = comments.map((comment) =>
                            comment.id === c.id
                              ? { ...comment, content: e.target.value }
                              : comment
                          );
                          setComments(updated);
                        }}
                        className="w-full p-4 mb-4 border border-gray-300 rounded-lg resize-y min-h-32"
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleUpdateComment(c.id, c.content)}
                          className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                        >
                          <FaPencilAlt className="mr-2" /> Save
                        </button>
                        <button
                          onClick={() => setEditingComment(null)}
                          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center mb-3">
                        <div className="flex items-center justify-center w-8 h-8 mr-2 text-indigo-500 bg-indigo-100 rounded-full">
                          <FaUser />
                        </div>
                        <Link
                          to={`/profile/${c.userId}`}
                          className="font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
                        >
                          {getCommentAuthor(c)}
                        </Link>
                      </div>
                      <p className="mb-3 text-gray-700">{c.content}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                          Posted on {parsedDate.toLocaleDateString()} at{" "}
                          {parsedDate.toLocaleTimeString()}
                        </span>

                        {(canEditComment(c) || canDeleteComment(c)) && (
                          <div className="flex space-x-2">
                            {canEditComment(c) && (
                              <button
                                onClick={() => setEditingComment(c.id)}
                                className="flex items-center px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                              >
                                <FaPencilAlt className="mr-1" /> Edit
                              </button>
                            )}
                            {canDeleteComment(c) && (
                              <button
                                onClick={() => confirmDeleteComment(c.id)}
                                className="flex items-center px-3 py-1 text-xs text-red-700 bg-red-100 rounded-md hover:bg-red-200"
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
              );
            })}
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-xl">
            <h3 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
              <FaTrash className="mr-2 text-red-600" /> Delete Comment
            </h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComment}
                className="flex items-center px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
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