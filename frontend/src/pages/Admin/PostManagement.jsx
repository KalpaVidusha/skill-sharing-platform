import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaTrashAlt, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaUserCircle, 
  FaFileAlt, 
  FaSyncAlt, 
  FaSort,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationCircle,
  FaThumbsUp,
  FaComment,
  FaUser,
  FaCalendarAlt,
  FaBell,
  FaTags,
  FaInfoCircle,
  FaArrowLeft
} from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import apiService from '../../services/api';
import AdminAuthRequiredModal from './AdminAuthRequiredModal';

// Truncate text utility function
const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Category badge component
const CategoryBadge = ({ category }) => {
  const colors = {
    "technology": "bg-blue-100 text-blue-800",
    "education": "bg-green-100 text-green-800",
    "lifestyle": "bg-purple-100 text-purple-800",
    "health": "bg-red-100 text-red-800",
    "business": "bg-yellow-100 text-yellow-800",
    "art": "bg-pink-100 text-pink-800",
    "default": "bg-gray-100 text-gray-800"
  };

  const categoryColor = colors[category?.toLowerCase()] || colors.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
      <FaTags className="mr-1 text-xs" />
      {category || "Uncategorized"}
    </span>
  );
};

// Stats indicator component
const StatIndicator = ({ icon: Icon, count, label, color }) => (
  <div className="flex items-center gap-1">
    <Icon className={`${color} text-sm`} />
    <span className="font-medium">{count}</span>
    <span className="text-xs text-gray-500">{label}</span>
  </div>
);

const PostManagement = () => {
  // State for posts
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'popular', 'recent'
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Authentication check
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = () => {
      const adminStatus = apiService.isUserAdmin();
      setIsAdmin(adminStatus);
      
      if (!adminStatus) {
        setShowAuthModal(true);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Fetch posts with proper error handling
  const fetchPosts = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all posts
      const response = await apiService.getAllPosts();
      
      // Fetch comments for each post to get comment counts
      const postsWithComments = await Promise.all(
        response.map(async (post) => {
          try {
            const comments = await apiService.getCommentsByPost(post.id);
            return {
              ...post,
              commentCount: comments?.length || 0
            };
          } catch (err) {
            console.error(`Error fetching comments for post ${post.id}:`, err);
            return {
              ...post,
              commentCount: 0
            };
          }
        })
      );
      
      // Sort posts
      const sortedPosts = sortPosts(postsWithComments, sortOrder);
      
      // Apply filters if any
      const filteredPosts = filterPosts(sortedPosts);
      
      // Update total pages
      setTotalPages(Math.ceil(filteredPosts.length / pageSize));
      
      // Set posts state
      setPosts(filteredPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Sort posts helper
  const sortPosts = (postsArray, order) => {
    return [...postsArray].sort((a, b) => {
      if (order === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (order === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (order === 'mostLiked') {
        return (b.likeCount || 0) - (a.likeCount || 0);
      } else if (order === 'mostCommented') {
        return (b.commentCount || 0) - (a.commentCount || 0);
      }
      return 0;
    });
  };
  
  // Filter posts helper
  const filterPosts = (postsArray) => {
    // First apply search term filter
    let filtered = postsArray;
    
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Then apply type filter
    if (filterType === 'popular') {
      filtered = filtered.filter(post => (post.likeCount || 0) > 5);
    } else if (filterType === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(post => new Date(post.createdAt) > oneWeekAgo);
    }
    
    return filtered;
  };
  
  useEffect(() => {
    if (isAdmin) {
      fetchPosts();
    }
  }, [isAdmin, sortOrder, filterType, searchTerm]);
  
  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1); // Reset to first page on new filter
  };
  
  // Handle sort order change
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1); // Reset to first page on new sort
  };
  
  // Open delete modal
  const openDeleteModal = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };
  
  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedPost(null);
  };
  
  // Handle delete post
  const handleDeletePost = async () => {
    if (!selectedPost) return;
    
    try {
      console.log(`Attempting to delete post with ID: ${selectedPost.id}`);
      await apiService.admin.deletePost(selectedPost.id);
      
      // Update local state
      setPosts(posts.filter(p => p.id !== selectedPost.id));
      
      // Show success message
      toast.success('Post deleted successfully');
      
      // Close modal
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting post:', err);
      
      // More descriptive error message based on error code
      if (err.status === 403) {
        toast.error('Permission denied: Admin authorization required to delete this post');
      } else if (err.status === 404) {
        toast.error('Post not found - it may have been already deleted');
        // Close modal and refresh since post doesn't exist
        closeDeleteModal();
        fetchPosts();
      } else {
        toast.error(`Failed to delete post: ${err.message || 'Unknown error'}`);
      }
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? '1 year ago' : `${interval} years ago`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? '1 month ago' : `${interval} months ago`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? '1 day ago' : `${interval} days ago`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
    }
    
    return seconds <= 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
  };
  
  // Get paginated posts
  const getPaginatedPosts = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return posts.slice(startIndex, endIndex);
  };
  
  // Pagination controls
  const goToPage = (page) => {
    setCurrentPage(page);
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Get display name for user
  const getDisplayName = (user) => {
    if (!user) return "Unknown User";
    
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

  if (showAuthModal) {
    return <AdminAuthRequiredModal />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab="posts" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Post Management</h1>
              <p className="text-gray-600 mt-1">Manage and moderate user posts across the platform</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link 
                to="/admin" 
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-all"
              >
                <FaArrowLeft className="text-sm" />
                Admin Dashboard
              </Link>
              <Link 
                to="/userdashboard" 
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-sm transition-all"
              >
                <FaUser className="text-sm" />
                User Dashboard
              </Link>
            </div>
          </div>
          
          {/* Alert Messages */}
          <div className="space-y-3 mb-6">
            {error && (
              <div className="flex items-start p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <FaExclamationCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Post Overview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Post Overview</h1>
                <p className="text-gray-600 mt-1">
                  Manage and moderate user-generated content across the platform
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaFileAlt className="text-blue-500 mr-1" />
                    <span className="font-medium">{posts.length}</span>
                    <span className="ml-1">total posts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
            
          {/* Filters and search */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by title, content or username..."
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                  <select
                    className="pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none w-full md:w-auto"
                    value={filterType}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All Posts</option>
                    <option value="popular">Popular Posts</option>
                    <option value="recent">Recent Posts</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FaFilter className="text-gray-400" />
                  </div>
                </div>
                
                <div className="relative w-full md:w-auto">
                  <select
                    className="pl-4 pr-9 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none w-full md:w-auto"
                    value={sortOrder}
                    onChange={handleSortChange}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="mostLiked">Most Liked</option>
                    <option value="mostCommented">Most Commented</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FaSort className="text-gray-400" />
                  </div>
                </div>
                
                <button
                  onClick={fetchPosts}
                  className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 w-full md:w-auto justify-center"
                >
                  <FaSyncAlt className="mr-2" /> Refresh
                </button>
              </div>
            </div>
          </div>
            
          {/* Content */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500 text-sm">Loading posts...</p>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12">
              <div className="text-center">
                <FaFileAlt className="mx-auto text-gray-300 text-5xl mb-3" />
                <h3 className="text-gray-800 text-lg font-medium mb-2">No posts found</h3>
                <p className="text-gray-500 text-sm mb-4">Try adjusting your search filters or check back later</p>
                <button
                  onClick={fetchPosts}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaSyncAlt className="mr-1.5 -ml-0.5" /> Refresh
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {getPaginatedPosts().map(post => (
                  <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-150 hover:shadow-md">
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {post.user?.profilePicture ? (
                              <img src={post.user.profilePicture} alt="Profile" className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-gray-200">
                                <FaUserCircle className="h-6 w-6 text-blue-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-base font-medium text-gray-900 line-clamp-1">
                              {post.title || "Untitled Post"}
                            </h3>
                            <div className="mt-1 flex items-center text-sm">
                              <Link 
                                to={`/profile/${post.user?.id}`} 
                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                              >
                                <FaUser className="mr-1 text-xs" />
                                {getDisplayName(post.user)}
                              </Link>
                              <span className="mx-1.5 text-gray-500">•</span>
                              <span className="text-gray-500 flex items-center">
                                <FaCalendarAlt className="mr-1 text-xs" />
                                {formatTimeAgo(post.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <CategoryBadge category={post.category} />
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-700">
                        <p className="line-clamp-2">{truncateText(post.description, 120)}</p>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex space-x-4">
                          <StatIndicator 
                            icon={FaThumbsUp} 
                            count={post.likeCount || 0} 
                            label="likes"
                            color="text-blue-500"
                          />
                          <StatIndicator 
                            icon={FaComment} 
                            count={post.commentCount || 0} 
                            label="comments"
                            color="text-green-500"
                          />
                        </div>
                        
                        <div className="flex space-x-1">
                          <Link 
                            to={`/posts/${post.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-150"
                            title="View post"
                          >
                            <FaEye className="h-4 w-4" />
                          </Link>
                          <button 
                            onClick={() => openDeleteModal(post)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-150"
                            title="Delete post"
                          >
                            <FaTrashAlt className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm py-4 px-6 flex justify-center">
                  <nav className="flex items-center">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-l-lg border ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <FaChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <div className="flex">
                      {[...Array(totalPages)].map((_, i) => {
                        // Show limited page numbers with ellipsis for better UX
                        if (
                          totalPages <= 7 ||
                          i === 0 ||
                          i === totalPages - 1 ||
                          (i >= currentPage - 2 && i <= currentPage + 2)
                        ) {
                          return (
                            <button
                              key={i}
                              onClick={() => goToPage(i + 1)}
                              className={`w-10 h-10 border-t border-b ${
                                currentPage === i + 1
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              {i + 1}
                            </button>
                          );
                        } else if (
                          (i === 1 && currentPage > 4) ||
                          (i === totalPages - 2 && currentPage < totalPages - 3)
                        ) {
                          return (
                            <button
                              key={i}
                              className="w-10 h-10 border-t border-b bg-white text-gray-600 flex items-center justify-center cursor-default"
                            >
                              ...
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-r-lg border ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <FaChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeDeleteModal}>
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaExclamationCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Post
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this post? All associated comments will also be deleted. This action cannot be undone.
                      </p>
                      {selectedPost && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{selectedPost.title}</p>
                            <CategoryBadge category={selectedPost.category} />
                          </div>
                          <p className="text-sm text-gray-700 mt-2">{truncateText(selectedPost.description, 150)}</p>
                          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center">
                              <FaUser className="mr-1" />
                              <span>{getDisplayName(selectedPost.user)}</span>
                            </div>
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-1" />
                              <span>{formatDate(selectedPost.createdAt)}</span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                            <StatIndicator 
                              icon={FaThumbsUp} 
                              count={selectedPost.likeCount || 0} 
                              label="likes"
                              color="text-blue-500"
                            />
                            <StatIndicator 
                              icon={FaComment} 
                              count={selectedPost.commentCount || 0} 
                              label="comments"
                              color="text-green-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeletePost}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default PostManagement; 