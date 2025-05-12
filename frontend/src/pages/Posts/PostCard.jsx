import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaComment, FaHeart, FaRegHeart } from 'react-icons/fa';
import apiService from '../../services/api';

const PostCard = ({ post }) => {
  const [commentCount, setCommentCount] = useState(0);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  const hasImage = post.mediaUrls && post.mediaUrls.length > 0;
  const defaultImageUrl = 'https://via.placeholder.com/400x200?text=No+Image';
  const instructor = post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Unknown';
  
  const isVideoUrl = (url) => {
    return url && (url.includes('/video/') || url.endsWith('.mp4') || url.endsWith('.mov'));
  };

  const getOptimizedImageUrl = (url, width = 400) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    
    return `${parts[0]}/upload/c_scale,w_${width},q_auto,f_auto/${parts[1]}`;
  };

  const getMediaUrl = () => {
    if (!hasImage) return defaultImageUrl;
    
    const firstMedia = post.mediaUrls[0];
    if (isVideoUrl(firstMedia)) {
      if (firstMedia.includes('cloudinary.com')) {
        const parts = firstMedia.split('/video/');
        if (parts.length === 2) {
          return `${parts[0]}/video/upload/c_scale,w_400,q_auto,f_auto/e_preview:duration_2/${parts[1].split('/').pop()}`;
        }
      }
      return defaultImageUrl;
    }
    
    return getOptimizedImageUrl(firstMedia);
  };

  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const comments = await apiService.getCommentsByPost(post.id);
        setCommentCount(comments.length);
      } catch (err) {
        console.error('Failed to fetch comment count:', err);
      }
    };

    const fetchLikeStatus = async () => {
      try {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) return;
        
        const userId = localStorage.getItem('userId');
        if (userId) {
          setLikedByCurrentUser(post.likedUserIds?.includes(userId));
        }
      } catch (err) {
        console.error('Failed to check like status:', err);
      }
    };

    if (post?.id) {
      fetchCommentCount();
      fetchLikeStatus();
    }
  }, [post]);

  const toggleLike = async () => {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        window.location.href = `/login?redirect=/posts/${post.id}`;
        return;
      }
      
      const result = await apiService.toggleLike(post.id);
      setLikeCount(result.likeCount);
      setLikedByCurrentUser(result.likedByCurrentUser);
    } catch (err) {
      console.error('Error toggling like:', err);
      if (err.status === 401) {
        window.location.href = `/login?redirect=/posts/${post.id}`;
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
      <div className="relative h-48 bg-blue-50 overflow-hidden flex-shrink-0">
        {!mediaLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
            <div className="text-indigo-600">Loading...</div>
          </div>
        )}
        <img
          src={getMediaUrl()}
          alt={post.title}
          className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setMediaLoaded(true)}
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-indigo-900 mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{post.description}</p>
        <div className="text-sm text-indigo-700 mb-2"><strong>Instructor:</strong> {instructor}</div>

        <div className="flex items-center gap-4 mt-3">
          <button 
            onClick={toggleLike} 
            className={`flex items-center gap-1.5 ${likedByCurrentUser ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors duration-200`}
          >
            {likedByCurrentUser ? <FaHeart /> : <FaRegHeart />} <span>{likeCount}</span>
          </button>
          <div className="flex items-center gap-1.5 text-gray-500">
            <FaComment />
            <span>{commentCount}</span>
          </div>
        </div>

        <Link 
          to={`/posts/${post.id}`} 
          className="mt-4 inline-block w-full text-center py-2.5 px-4 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-md mt-auto"
        >
          View Course
        </Link>
      </div>
    </div>
  );
};

export default PostCard;