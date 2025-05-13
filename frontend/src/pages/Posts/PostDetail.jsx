import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaPencilAlt, FaTrash, FaHeart, FaRegHeart,
  FaComment, FaTimes, FaChevronLeft, FaChevronRight,
  FaPlayCircle, FaImage, FaExpand
} from 'react-icons/fa';
import apiService from '../../services/api';
import Navbar from '../../components/Navbar';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const descriptionRef = useRef(null);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPostOwner, setIsPostOwner] = useState(false);
  const [error, setError] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionLong, setIsDescriptionLong] = useState(false);
  const [mediaGalleryOpen, setMediaGalleryOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [mediaLoading, setMediaLoading] = useState({});
  const [mediaType, setMediaType] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [postData, commentsData] = await Promise.all([
          apiService.getPostById(id),
          apiService.getCommentsByPost(id)
        ]);

        setPost(postData);
        setComments(commentsData);
        setLikeCount(postData.likeCount || 0);
        
        const userId = localStorage.getItem('userId');
        if (userId && postData.user?.id === userId) setIsPostOwner(true);
        if (postData.likedUserIds?.includes(userId)) setLiked(true);
        
        setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
        
        if (postData.mediaUrls?.length) {
          const loadingStates = {};
          postData.mediaUrls.forEach((url, index) => {
            if (!isVideo(url)) {
              const img = new Image();
              img.src = url;
              img.onload = () => handleMediaLoad(index);
              img.onerror = () => handleMediaLoad(index);
            }
            loadingStates[index] = true;
          });
          setMediaLoading(loadingStates);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    return () => {
      setMediaLoading({});
    };
  }, [id]);

  useEffect(() => {
    if (descriptionRef.current) {
      const isLong = descriptionRef.current.scrollHeight > 150;
      setIsDescriptionLong(isLong);
    }
  }, [post]);

  const handleAddComment = async () => {
    if (!isLoggedIn) return navigate(`/login`, { state: { returnTo: `/posts/${id}` } });
    if (!newComment.trim()) return setError('Comment cannot be empty');
    try {
      await apiService.addComment({ postId: id, content: newComment });
      setNewComment('');
      setError('');
      const data = await apiService.getCommentsByPost(id);
      setComments(data);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment.');
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      await apiService.updateComment(commentId, { content });
      const data = await apiService.getCommentsByPost(id);
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
      const data = await apiService.getCommentsByPost(id);
      setComments(data);
      setShowConfirm(false);
      setCommentToDelete(null);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment.');
    }
  };

  const handleToggleLike = async () => {
    if (!isLoggedIn) return navigate(`/login`, { state: { returnTo: `/posts/${id}` } });
    try {
      const data = await apiService.toggleLike(id);
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

  const navigateMedia = (direction) => {
    if (!post?.mediaUrls?.length) return;
    const mediaCount = post.mediaUrls.length;
    if (direction === 'next') {
      setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % mediaCount);
    } else {
      setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + mediaCount) % mediaCount);
    }
  };

  const getFilteredMedia = () => {
    if (!post?.mediaUrls?.length) return [];
    if (mediaType === 'all') return post.mediaUrls;
    if (mediaType === 'images') {
      return post.mediaUrls.filter(url => !url.match(/\.(mp4|webm|ogg)$/i));
    }
    if (mediaType === 'videos') {
      return post.mediaUrls.filter(url => url.match(/\.(mp4|webm|ogg)$/i));
    }
    return post.mediaUrls;
  };

  const isVideo = (url) => {
    return url && url.match(/\.(mp4|webm|ogg)$/i);
  };

  const handleMediaLoad = (index) => {
    setMediaLoading(prev => ({
      ...prev,
      [index]: false
    }));
  };

  const openGallery = (index) => {
    setCurrentMediaIndex(index);
    setMediaGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setMediaGalleryOpen(false);
    document.body.style.overflow = 'auto';
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-white flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const filteredMedia = getFilteredMedia();
  const images = post?.mediaUrls?.filter(url => !isVideo(url)) || [];
  const videos = post?.mediaUrls?.filter(url => isVideo(url)) || [];

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-white pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 hover:text-indigo-500 font-medium mb-6"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              {post?.title}
            </h1>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium">
                {post?.category}
              </span>
              {post?.tags?.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-8 border-l-4 border-indigo-500">
              <div 
                ref={descriptionRef}
                className={`text-gray-700 leading-relaxed overflow-hidden transition-all duration-300 ${
                  isDescriptionLong && !showFullDescription ? 'max-h-36' : ''
                }`}
              >
                <p>{post?.description}</p>
              </div>
              {isDescriptionLong && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
                >
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {images.length > 0 && videos.length > 0 && (
              <div className="flex mb-4 border-b">
                <button 
                  onClick={() => setMediaType('all')}
                  className={`px-4 py-2 font-medium ${
                    mediaType === 'all' 
                      ? 'text-indigo-600 border-b-2 border-indigo-600' 
                      : 'text-gray-600 hover:text-indigo-500'
                  }`}
                >
                  All Media ({post?.mediaUrls?.length || 0})
                </button>
                <button 
                  onClick={() => setMediaType('images')}
                  className={`px-4 py-2 font-medium flex items-center ${
                    mediaType === 'images' 
                      ? 'text-indigo-600 border-b-2 border-indigo-600' 
                      : 'text-gray-600 hover:text-indigo-500'
                  }`}
                >
                  <FaImage className="mr-1" /> Images ({images.length})
                </button>
                <button 
                  onClick={() => setMediaType('videos')}
                  className={`px-4 py-2 font-medium flex items-center ${
                    mediaType === 'videos' 
                      ? 'text-indigo-600 border-b-2 border-indigo-600' 
                      : 'text-gray-600 hover:text-indigo-500'
                  }`}
                >
                  <FaPlayCircle className="mr-1" /> Videos ({videos.length})
                </button>
              </div>
            )}

            {filteredMedia.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {filteredMedia.map((url) => {
                  const originalIndex = post.mediaUrls.indexOf(url);
                  const isVideoFile = isVideo(url);
                  return (
                    <div 
                      key={originalIndex}
                      className="relative rounded-lg overflow-hidden border border-gray-200 shadow-md aspect-w-16 aspect-h-9 group cursor-pointer"
                      onClick={() => openGallery(originalIndex)}
                    >
                      {mediaLoading[originalIndex] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                      
                      {isVideoFile ? (
                        <>
                          <video 
                            className="w-full h-full object-cover"
                            onLoadedData={() => handleMediaLoad(originalIndex)}
                            onError={() => handleMediaLoad(originalIndex)}
                            preload="metadata"
                          >
                            <source src={url} type={`video/${url.split('.').pop()}`} />
                          </video>
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaPlayCircle className="text-white text-4xl" />
                          </div>
                        </>
                      ) : (
                        <>
                          <img 
                            src={url} 
                            alt={`media-${originalIndex}`} 
                            className="w-full h-full object-cover"
                            onLoad={() => handleMediaLoad(originalIndex)}
                            onError={() => handleMediaLoad(originalIndex)}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaExpand className="text-white text-2xl" />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

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
                          <p className="text-gray-700 mb-3">{c.content}</p>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              Posted on {new Date(c.createdAt).toLocaleString()}
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
          </div>
        </div>

        {mediaGalleryOpen && post?.mediaUrls?.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
            <div className="p-4 flex justify-between items-center text-white">
              <h3 className="text-lg font-medium">
                {currentMediaIndex + 1} / {post.mediaUrls.length}
              </h3>
              <button 
                onClick={closeGallery}
                className="text-white hover:text-gray-300 p-2"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center px-4 relative">
              {post.mediaUrls.length > 1 && (
                <>
                  <button 
                    onClick={() => navigateMedia('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-3 rounded-full text-white hover:bg-opacity-70"
                  >
                    <FaChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => navigateMedia('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-3 rounded-full text-white hover:bg-opacity-70"
                  >
                    <FaChevronRight size={20} />
                  </button>
                </>
              )}
              
              <div className="max-w-full max-h-full">
                {isVideo(post.mediaUrls[currentMediaIndex]) ? (
                  <video 
                    controls 
                    autoPlay 
                    className="max-w-full max-h-[80vh] mx-auto"
                  >
                    <source 
                      src={post.mediaUrls[currentMediaIndex]} 
                      type={`video/${post.mediaUrls[currentMediaIndex].split('.').pop()}`} 
                    />
                  </video>
                ) : (
                  <img 
                    src={post.mediaUrls[currentMediaIndex]} 
                    alt="Gallery" 
                    className="max-w-full max-h-[80vh] object-contain mx-auto"
                  />
                )}
              </div>
            </div>
            
            {post.mediaUrls.length > 1 && (
              <div className="bg-black bg-opacity-70 p-2 overflow-x-auto">
                <div className="flex space-x-2 justify-center">
                  {post.mediaUrls.map((url, index) => (
                    <div 
                      key={index}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 cursor-pointer ${
                        currentMediaIndex === index ? 'border-indigo-500' : 'border-transparent'
                      }`}
                    >
                      {isVideo(url) ? (
                        <div className="relative w-full h-full bg-gray-800 flex items-center justify-center">
                          <FaPlayCircle className="text-white" />
                        </div>
                      ) : (
                        <img 
                          src={url} 
                          alt={`thumbnail-${index}`} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700"
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default PostDetail;