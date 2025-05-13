import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaImage, FaPlayCircle, FaExpand,
  FaChevronLeft, FaChevronRight, FaTimes
} from 'react-icons/fa';
import apiService from '../../services/api';
import Navbar from '../../components/Navbar';
import PostLikeComment from './PostLikeComment';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const descriptionRef = useRef(null);

  const [post, setPost] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPostOwner, setIsPostOwner] = useState(false);
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
        const postData = await apiService.getPostById(id);
        setPost(postData);
        
        const userId = localStorage.getItem('userId');
        if (userId && postData.user?.id === userId) setIsPostOwner(true);
        
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

            {/* Integration with PostLikeComment component */}
            <PostLikeComment 
              postId={id}
              isLoggedIn={isLoggedIn}
              isPostOwner={isPostOwner}
              initialLikeCount={post?.likeCount || 0}
              initialLiked={post?.likedUserIds?.includes(localStorage.getItem('userId')) || false}
            />
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