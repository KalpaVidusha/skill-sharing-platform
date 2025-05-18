import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaComment, FaHeart, FaRegHeart } from 'react-icons/fa';
import apiService from '../../services/api';

const PostCard = ({ post }) => {
  const [commentCount, setCommentCount] = useState(0);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const cardRef = useRef(null);

  const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
  const defaultImageUrl = 'https://via.placeholder.com/400x200?text=No+Image';
  const instructor = post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Unknown';
  const instructorId = post.user?.id;
  
  const isVideoUrl = (url) => {
    return url && (url.includes('/video/') || url.endsWith('.mp4') || url.endsWith('.mov') || 
           url.endsWith('.webm') || url.endsWith('.ogg'));
  };

  const getOptimizedImageUrl = (url, width = 400) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    
    return `${parts[0]}/upload/c_scale,w_${width},q_auto,f_auto/${parts[1]}`;
  };

  // Function to find the first non-video media
  const findFirstImageUrl = () => {
    if (!hasMedia) return null;
    
    const imageUrl = post.mediaUrls.find(url => !isVideoUrl(url));
    return imageUrl ? getOptimizedImageUrl(imageUrl) : null;
  };

  // Function to find the first video media
  const findFirstVideoUrl = () => {
    if (!hasMedia) return null;
    
    return post.mediaUrls.find(url => isVideoUrl(url)) || null;
  };

  // Function to get a quick video thumbnail from Cloudinary (if possible)
  const getVideoThumbnail = () => {
    const firstVideoUrl = findFirstVideoUrl();
    
    if (firstVideoUrl && firstVideoUrl.includes('cloudinary.com')) {
      // For Cloudinary videos, use their built-in thumbnail generation
      const parts = firstVideoUrl.split('/video/');
      if (parts.length === 2) {
        return `${parts[0]}/video/upload/c_scale,w_400,q_auto,f_auto/e_preview:duration_2/${parts[1].split('/').pop()}`;
      }
    }
    
    // For non-Cloudinary videos, return a generic video thumbnail
    return 'https://via.placeholder.com/400x200?text=Video+Content';
  };

  // Get the most appropriate media for display with immediate loading
  const getMediaUrl = () => {
    if (!hasMedia) return defaultImageUrl;
    
    // First priority: Use an image if available
    const firstImageUrl = findFirstImageUrl();
    if (firstImageUrl) return firstImageUrl;
    
    // Second priority: Use quick video thumbnail
    return getVideoThumbnail();
  };

  useEffect(() => {
    // Mark media as loaded after a short delay
    // This ensures we show something quickly instead of waiting for processing
    const timer = setTimeout(() => {
      setMediaLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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

  useEffect(() => {
    // Set up intersection observer for video autoplay
    if (!videoRef.current || !hasOnlyVideos()) {
      return; // Early return if we don't have a video element
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          // Only proceed if the video reference is still valid
          if (!videoRef.current) return;
          
          if (entry.isIntersecting) {
            // Video is visible in viewport, autoplay it
            videoRef.current.play()
              .then(() => {
                setIsPlaying(true);
              })
              .catch(error => {
                console.error("Error autoplaying video:", error);
                setIsPlaying(false);
              });
          } else {
            // Video is not visible, pause it
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 } // 50% of the video visible in viewport to trigger
    );

    observer.observe(videoRef.current);
    
    // Clean up function
    return () => {
      // Make sure we check if the observer and element still exist
      if (observer) {
        observer.disconnect();
      }
    };
  }, [mediaLoaded]);

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

  // Check if the post contains only video(s)
  const hasOnlyVideos = () => {
    if (!hasMedia) return false;
    return post.mediaUrls.every(url => isVideoUrl(url));
  };

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col"
    >
      <div className="relative h-48 bg-blue-50 overflow-hidden flex-shrink-0">
        {!mediaLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
            <div className="text-indigo-600">Loading...</div>
          </div>
        )}
        
        {/* Show video if the post has videos */}
        {hasOnlyVideos() ? (
          <div className="w-full h-full relative">
            <video 
              ref={videoRef}
              src={findFirstVideoUrl()}
              className="w-full h-full object-cover"
              poster={getVideoThumbnail()}
              preload="metadata"
              muted
              playsInline
              loop
              onLoadedMetadata={() => setMediaLoaded(true)}
              onError={() => setMediaLoaded(true)}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <img
            src={getMediaUrl()}
            alt={post.title}
            className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setMediaLoaded(true)}
            onError={() => setMediaLoaded(true)}
          />
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-indigo-900 mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{post.description}</p>
        <div className="text-sm text-indigo-700 mb-2">
          <strong>Instructor:</strong>{' '}
          {instructorId ? (
            <Link 
              to={`/profile/${instructorId}`}
              className="hover:text-indigo-900 hover:underline"
            >
              {instructor}
            </Link>
          ) : (
            instructor
          )}
        </div>

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