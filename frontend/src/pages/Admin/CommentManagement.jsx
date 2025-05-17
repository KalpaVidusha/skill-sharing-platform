import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaTrashAlt, 
  FaSearch, 
  FaFilter, 
  FaUserCircle, 
  FaCommentDots, 
  FaSyncAlt, 
  FaSort,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationCircle,
  FaExternalLinkAlt,
  FaRegCommentAlt,
  FaArrowLeft,
  FaUser
} from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import apiService from '../../services/api';
import AdminAuthRequiredModal from './AdminAuthRequiredModal';

const CommentManagement = () => {
  const navigate = useNavigate();
  
  // State for comments
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; // Using constant instead of state since it's not being modified
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'flagged', 'progress', 'post'
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [viewingComment, setViewingComment] = useState(null);
  
  // Tab state for post vs progress
  const [activeTab, setActiveTab] = useState('post'); // 'post' or 'progress'
  
  // Authentication check - replace with direct API call
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Debug flag - set to false to disable debug messages and mock data
  const DEBUG = false;
  
  // Log helper function
  const debugLog = (...args) => {
    if (DEBUG) {
      console.log("[CommentManagement]", ...args);
    }
  };

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = () => {
      const adminStatus = apiService.isUserAdmin();
      setIsAdmin(adminStatus);
      
      if (!adminStatus) {
        setShowAuthModal(true);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Log component mount and fetch comments
  useEffect(() => {
    debugLog("🔄 Component mounted");
    
    if (isAdmin) {
      debugLog(`👑 User is admin, fetching ${activeTab} comments`);
      fetchComments();
    } else {
      debugLog("⛔ User is not admin, comments won't be fetched");
    }
    
    // Cleanup when component unmounts
    return () => {
      debugLog("🛑 Component unmounted");
    };
  }, [isAdmin, activeTab]); // Add activeTab as dependency

  // Format progress title based on template type
  const formatProgressTitle = (progress) => {
    if (!progress) return "Unknown Progress";
    
    // If progress already has a title, use it
    if (progress.title) return progress.title;
    
    // Format based on template type if available
    if (progress.templateType) {
      switch (progress.templateType) {
        case 'completed_tutorial':
          return `✅ Completed: ${progress.content?.tutorialName || 'Tutorial'}`;
        case 'new_skill':
          return `🎯 Learned: ${progress.content?.skillName || 'New Skill'}`;
        case 'learning_goal':
          return `📅 Goal: ${progress.content?.goalName || 'Learning Goal'}`;
        default:
          return `${progress.templateType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`;
      }
    }
    
    // Fallback to a simple format with the ID
    return `Progress Update`;
  };

  // Helper function to fetch all progress comments
  const fetchAllProgressComments = async () => {
    try {
      debugLog("📊 Attempting to fetch all progress updates");
      
      // First try to get all progress items
      const allProgress = await apiService.getAllProgress();
      debugLog(`Found ${allProgress?.length || 0} progress updates to check for comments`);
      
      if (!allProgress || allProgress.length === 0) {
        debugLog("❌ No progress updates found");
        return [];
      }
      
      // Create an array to hold all progress comments
      let allProgressComments = [];
      
      // Process each progress item sequentially
      for (const progress of allProgress) {
        try {
          debugLog(`Fetching comments for progress ID: ${progress.id}`);
          
          // Make direct API call with JWT token (handled by interceptor)
          const progressComments = await apiService.getProgressComments(progress.id);
          
          // Log raw response for debugging
          debugLog(`Raw response for progress ${progress.id}:`, progressComments);
          
          if (!progressComments || progressComments.length === 0) {
            debugLog(`No comments found for progress ${progress.id}`);
            continue;
          }
          
          debugLog(`Found ${progressComments.length} comments for progress ${progress.id}`);
          
          // Format progress title once
          const progressTitle = formatProgressTitle(progress);
          
          // Process each comment
          for (const comment of progressComments) {
            try {
              debugLog(`Processing comment: ${comment.id}`, comment);
              
              // Get user data using userId
              let userData = null;
              try {
                userData = await apiService.getUserById(comment.userId);
                debugLog(`User data for ${comment.userId}:`, userData);
              } catch (userErr) {
                debugLog(`Could not fetch user data for ${comment.userId}:`, userErr);
              }
              
              // Create enhanced comment
              const enhancedComment = {
                ...comment,
                type: 'progress',
                contentType: 'Progress Update',
                progressId: progress.id,
                parentTitle: progressTitle,
                user: {
                  id: comment.userId,
                  username: userData?.username || comment.userName || "unknown",
                  firstName: userData?.firstName || (comment.userName ? comment.userName.split(' ')[0] : ""),
                  lastName: userData?.lastName || (comment.userName ? comment.userName.split(' ').slice(1).join(' ') : ""),
                  profilePicture: userData?.profilePicture || null
                }
              };
              
              allProgressComments.push(enhancedComment);
              
              // If this comment has replies, fetch and process them
              if (comment.id) {
                try {
                  const replies = await apiService.getCommentReplies(comment.id);
                  debugLog(`Found ${replies?.length || 0} replies for comment ${comment.id}`);
                  
                  if (replies && replies.length > 0) {
                    // Process each reply
                    for (const reply of replies) {
                      try {
                        let replyUserData = null;
                        try {
                          replyUserData = await apiService.getUserById(reply.userId);
                        } catch (replyUserErr) {
                          debugLog(`Could not fetch user data for reply ${reply.id}:`, replyUserErr);
                        }
                        
                        // Create enhanced reply comment
                        const enhancedReply = {
                          ...reply,
                          type: 'progress',
                          contentType: 'Progress Update',
                          progressId: progress.id,
                          parentTitle: progressTitle,
                          parentCommentId: comment.id, // Mark as a reply
                          isReply: true, // Flag to identify as reply
                          user: {
                            id: reply.userId,
                            username: replyUserData?.username || reply.userName || "unknown",
                            firstName: replyUserData?.firstName || (reply.userName ? reply.userName.split(' ')[0] : ""),
                            lastName: replyUserData?.lastName || (reply.userName ? reply.userName.split(' ').slice(1).join(' ') : ""),
                            profilePicture: replyUserData?.profilePicture || null
                          }
                        };
                        
                        allProgressComments.push(enhancedReply);
                      } catch (replyErr) {
                        debugLog(`Error processing reply ${reply.id}:`, replyErr);
                      }
                    }
                  }
                } catch (repliesErr) {
                  debugLog(`Error fetching replies for comment ${comment.id}:`, repliesErr);
                }
              }
            } catch (commentErr) {
              debugLog(`Error processing comment ${comment.id}:`, commentErr);
            }
          }
        } catch (progressErr) {
          debugLog(`Error fetching comments for progress ${progress.id}:`, progressErr);
        }
      }
      
      debugLog(`Total progress comments found: ${allProgressComments.length}`);
      
      return allProgressComments;
    } catch (err) {
      debugLog("❌ Error in fetchAllProgressComments:", err);
      console.error("Failed to fetch progress comments:", err);
      return [];
    }
  };
  
  // Helper function to fetch all post comments
  const fetchAllPostComments = async () => {
    try {
      debugLog("📄 Attempting to fetch all post comments");
      
      // First try to get all posts
      const allPosts = await apiService.getAllPosts();
      debugLog(`Found ${allPosts?.length || 0} posts to check for comments`);
      
      if (!allPosts || allPosts.length === 0) {
        debugLog("No posts found");
        return [];
      }
      
      // Collect comments from each post
      const postCommentPromises = allPosts.map(async (post) => {
        try {
          const comments = await apiService.getCommentsByPost(post.id);
          
          // For each comment, fetch the user data
          const commentPromises = (comments || []).map(async (comment) => {
            try {
              // Get user data using userId
              const userData = await apiService.getUserById(comment.userId);
              
              // Create user object using fetched data or defaults
              const userObject = userData ? {
                id: userData.id,
                username: userData.username || "unknown",
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                profilePicture: userData.profilePicture || null
              } : {
                id: comment.userId,
                username: "unknown",
                firstName: "",
                lastName: ""
              };
              
              // Return enhanced comment with user data
              return {
                ...comment,
                type: 'post',
                contentType: 'Post',
                postId: post.id,
                parentTitle: post.title || `Post #${post.id}`,
                user: userObject
              };
            } catch (userErr) {
              debugLog(`Error fetching user data for post comment ${comment.id}:`, userErr);
              // Return comment with default user data if user fetch fails
              return {
                ...comment,
                type: 'post',
                contentType: 'Post',
                postId: post.id,
                parentTitle: post.title || `Post #${post.id}`,
                user: {
                  id: comment.userId,
                  username: "unknown",
                  firstName: "",
                  lastName: ""
                }
              };
            }
          });
          
          // Wait for all user data fetches to complete
          return await Promise.all(commentPromises);
        } catch (err) {
          debugLog(`Error fetching comments for post ${post.id}:`, err);
          return [];
        }
      });
      
      const postCommentsArrays = await Promise.all(postCommentPromises);
      
      // Flatten the array of arrays into a single array of comments
      const allPostComments = postCommentsArrays.flat();
      
      debugLog(`Retrieved ${allPostComments.length} total post comments`);
      return allPostComments;
    } catch (err) {
      debugLog("Error in fetchAllPostComments:", err);
      console.error("Failed to fetch post comments:", err);
      return [];
    }
  };

  // Fetch comments with tab support
  const fetchComments = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError(null);
    
    try {
      debugLog(`🚀 Starting to fetch ${activeTab} comments...`);
      
      let commentsToDisplay = [];
      
      // Fetch comments based on active tab
      if (activeTab === 'post') {
        // Fetch post comments only
        const postComments = await fetchAllPostComments();
        debugLog(`📝 Retrieved ${postComments.length} post comments`);
        commentsToDisplay = postComments;
      } else if (activeTab === 'progress') {
        // Fetch progress comments only
        const progressComments = await fetchAllProgressComments();
        debugLog(`📈 Retrieved ${progressComments.length} progress comments`);
        commentsToDisplay = progressComments;
      }
      
      // Only use mock data if BOTH conditions are true:
      // 1. We have no comments to display
      // 2. Debug mode is enabled (so we can test with mock data)
      if (commentsToDisplay.length === 0 && DEBUG) {
        debugLog(`⚠️ No ${activeTab} comments found and DEBUG mode is enabled, creating mock data for testing`);
        
        // Create mock comments for testing based on the active tab
        const mockComments = activeTab === 'post' ? [
          {
            id: "mockpost1",
            content: "This is a mock comment for testing the admin panel. It represents a comment on a post.",
            userId: "user1", // This simulates the actual DB structure with just userId
            postId: "mockpost1",
            createdAt: new Date().toISOString(),
            type: "post",
            contentType: "Post",
            parentTitle: "Mock Post Title",
            // Simulated user data that would normally be fetched from the API using userId
            user: { 
              id: "user1", 
              username: "testuser", 
              firstName: "Test", 
              lastName: "User",
              profilePicture: null
            }
          },
          {
            id: "mockpost2",
            content: "Here's a second mock post comment with different user information.",
            userId: "user3", // This simulates the actual DB structure with just userId
            postId: "mockpost2",
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            type: "post",
            contentType: "Post",
            parentTitle: "Another Mock Post",
            // Simulated user data that would normally be fetched from the API using userId
            user: { 
              id: "user3", 
              username: "adminuser", 
              firstName: "Admin", 
              lastName: "User",
              profilePicture: null
            }
          }
        ] : [];
        
        // Set comments to empty array if on progress tab to prevent showing mock data
        if (activeTab === 'progress') {
          commentsToDisplay = [];
          debugLog(`No mock data will be shown for progress comments as requested`);
        } else {
          // Sort mock comments
          const sortedComments = sortComments(mockComments, sortOrder);
          
          // Apply filters
          const filteredComments = filterComments(sortedComments);
          
          // Update total pages
          setTotalPages(Math.ceil(filteredComments.length / pageSize));
          
          // Set comments state
          setComments(filteredComments);
          setLoading(false);
          
          // Display a warning toast that these are mock comments
          toast.warning("Displaying mock comments for testing. No real comments found.");
          return;
        }
      } else if (commentsToDisplay.length === 0) {
        // If no comments and not in debug mode, just show empty state
        debugLog(`ℹ️ No ${activeTab} comments found, showing empty state`);
        setComments([]);
        setTotalPages(1);
        setLoading(false);
        return;
      }
      
      debugLog(`✅ Found ${commentsToDisplay.length} ${activeTab} comments`);
      
      // Sort comments
      const sortedComments = sortComments(commentsToDisplay, sortOrder);
      
      // Apply filters if any
      const filteredComments = filterComments(sortedComments);
      
      // Update total pages
      setTotalPages(Math.ceil(filteredComments.length / pageSize));
      
      // Set comments state
      setComments(filteredComments);
    } catch (err) {
      debugLog("❌ Error fetching comments:", err);
      setError(`Failed to fetch ${activeTab} comments. Please check the browser console for more details.`);
    } finally {
      setLoading(false);
    }
  };
  
  // Sort comments helper
  const sortComments = (commentsArray, order) => {
    return [...commentsArray].sort((a, b) => {
      const dateA = new Date(a.createdAt || Date.now()).getTime();
      const dateB = new Date(b.createdAt || Date.now()).getTime();
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };
  
  // Filter comments helper
  const filterComments = (commentsArray) => {
    // First apply search term filter
    let filtered = commentsArray;
    
    if (searchTerm) {
      filtered = filtered.filter(comment => 
        (comment.content?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        ((getUsernameFromComment(comment) || '').toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Then apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(comment => comment.type === filterType);
    }
    
    return filtered;
  };
  
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
  const openDeleteModal = (comment) => {
    setSelectedComment(comment);
    setShowDeleteModal(true);
  };
  
  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedComment(null);
  };
  
  // Handle delete comment
  const handleDeleteComment = async () => {
    if (!selectedComment) return;
    
    try {
      debugLog(`🗑️ Attempting to delete ${selectedComment.type} comment with ID: ${selectedComment.id}`);
      
      if (selectedComment.type === 'progress') {
        // Check if it's a reply or a main comment
        if (selectedComment.isReply || selectedComment.parentCommentId) {
          // Delete reply
          await apiService.deleteProgressComment(selectedComment.id);
        } else {
          // Delete main comment
          await apiService.deleteProgressComment(selectedComment.id);
        }
        debugLog(`✅ Successfully deleted progress comment ${selectedComment.id}`);
      } else {
        // Use admin API endpoint for post comments
        await apiService.admin.deleteComment(selectedComment.id);
        debugLog(`✅ Successfully deleted post comment ${selectedComment.id}`);
      }
      
      // Update local state
      setComments(comments.filter(c => c.id !== selectedComment.id));
      
      // Show success message
      toast.success('Comment deleted successfully');
      
      // Close modal
      closeDeleteModal();
    } catch (err) {
      debugLog("❌ Error deleting comment:", err);
      
      // More descriptive error message based on error code
      if (err.status === 403) {
        toast.error('Permission denied: Admin authorization required to delete this comment');
      } else if (err.status === 404) {
        toast.error('Comment not found - it may have been already deleted');
        // Close modal and refresh since comment doesn't exist
        closeDeleteModal();
        fetchComments();
      } else {
        toast.error(`Failed to delete comment: ${err.message || 'Unknown error'}`);
      }
    }
  };

  // View comment details
  const viewCommentDetails = (comment) => {
    setViewingComment(comment);
    setShowCommentModal(true);
  };

  // Close comment modal
  const closeCommentModal = () => {
    setShowCommentModal(false);
    setViewingComment(null);
  };

  // Handle navigation to user profile
  const navigateToUserProfile = (userId) => {
    if (userId) {
      navigate(`/profile/${userId}`);
    } else {
      toast.warning('User profile not available');
    }
  };

  // Handle navigation to content
  const navigateToContent = (comment) => {
    if (comment.type === 'progress') {
      // Navigate to progress item
      navigate(`/progress?highlight=${comment.progressId || comment.id}`);
    } else {
      // Navigate to post
      navigate(`/posts/${comment.postId || comment.id}`);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('en-US', options);
  };
  
  // Get paginated comments
  const getPaginatedComments = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return comments.slice(startIndex, endIndex);
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
  
  // Helper function to get userId from different comment structures
  const getUserIdFromComment = (comment) => {
    if (!comment) return null;
    
    // Try different paths to find the user ID
    if (comment.user && comment.user.id) {
      return comment.user.id;
    }
    
    // Direct userId property (common in progress comments)
    if (comment.userId) {
      return comment.userId;
    }
    
    // Alternative property names
    if (comment.user_id) {
      return comment.user_id;
    }
    
    debugLog("⚠️ Could not find userId for comment:", comment);
    return null;
  };
  
  // Helper function to get username from different comment structures
  const getUsernameFromComment = (comment) => {
    if (!comment) return "unknown";
    
    // Try user object first
    if (comment.user) {
      if (comment.user.username) return comment.user.username;
      if (comment.user.name) return comment.user.name;
      if (comment.user.email) return comment.user.email;
      if (comment.user.firstName) {
        return comment.user.firstName + (comment.user.lastName ? ` ${comment.user.lastName}` : '');
      }
    }
    
    // Try progress comment properties (userName is common in progress comments)
    if (comment.userName) return comment.userName;
    
    // Try other direct properties
    if (comment.username) return comment.username;
    if (comment.user_name) return comment.user_name;
    if (comment.email) return comment.email;
    
    debugLog("⚠️ Could not find username for comment:", comment);
    return "unknown";
  };
  
  // Get display name for user - handle all possible data structures
  const getDisplayName = (user) => {
    // If no user object is provided
    if (!user) return "Unknown User";
    
    // Try formal name combinations
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    } 
    
    // Try alternate name formats
    if (user.name) {
      return user.name;
    }
    
    // Try userName (for progress comments)
    if (user.userName) {
      return user.userName;
    }
    
    // Try display_name (variations)
    if (user.displayName) {
      return user.displayName;
    }
    if (user.display_name) {
      return user.display_name;
    }
    
    // Fallback to username or email
    return user.username || user.email || "Unknown User";
  };
  
  // Get username or identifier - handle all possible data structures
  const getUsername = (user) => {
    if (!user) return "unknown";
    
    // Try common username fields
    if (user.username) return user.username;
    if (user.userName) return user.userName;
    if (user.user_name) return user.user_name;
    
    // Try email as fallback
    if (user.email) return user.email;
    
    // Last resort
    return "unknown";
  };
  
  // Get comment source info (post or progress)
  const getCommentSource = (comment) => {
    if (comment.type === 'progress') {
      if (comment.isReply || comment.parentCommentId) {
        return {
          label: 'Reply',
          icon: <FaRegCommentAlt className="text-indigo-500" />,
          color: 'indigo'
        };
      }
      return {
        label: 'Progress Update',
        icon: <FaRegCommentAlt className="text-purple-500" />,
        color: 'purple'
      };
    } else {
      return {
        label: 'Post',
        icon: <FaRegCommentAlt className="text-green-500" />,
        color: 'green'
      };
    }
  };

  // Truncate text utility
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setCurrentPage(1); // Reset to first page when changing tabs
      setComments([]); // Clear current comments
    }
  };

  if (showAuthModal) {
    return <AdminAuthRequiredModal />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab="comments" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Comment Management</h1>
              <p className="text-gray-600 mt-1">Manage user comments across the platform</p>
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
          
          {/* Original content below - keeping the existing functionality */}
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Comment Overview</h1>
                <p className="text-gray-600">
                  Manage user comments across the platform. Review, filter, and remove inappropriate content.
                </p>
              </div>
              <div className="hidden sm:block">
                <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  {comments.length} Comments
                </span>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                <li className="mr-2">
                  <button
                    className={`inline-block p-4 rounded-t-lg ${
                      activeTab === 'post'
                        ? 'text-blue-600 border-b-2 border-blue-600 active'
                        : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'
                    }`}
                    onClick={() => handleTabChange('post')}
                  >
                    Post Comments
                  </button>
                </li>
                <li className="mr-2">
                  <button
                    className={`inline-block p-4 rounded-t-lg ${
                      activeTab === 'progress'
                        ? 'text-blue-600 border-b-2 border-blue-600 active'
                        : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent'
                    }`}
                    onClick={() => handleTabChange('progress')}
                  >
                    Progress Comments
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Filters and search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search comments or usernames..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFilter className="text-gray-400" />
                  </div>
                  <select
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterType}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All Comments</option>
                    <option value="progress">Progress Updates</option>
                    <option value="post">Posts</option>
                  </select>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSort className="text-gray-400" />
                  </div>
                  <select
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sortOrder}
                    onChange={handleSortChange}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
                
                <button
                  onClick={fetchComments}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                >
                  <FaSyncAlt className="mr-2" /> Refresh
                </button>
              </div>
            </div>
            
            {/* Comments table */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-md">
                <div className="flex flex-col sm:flex-row items-center">
                  <FaExclamationCircle className="h-8 w-8 mr-2 text-red-500 mb-2 sm:mb-0" />
                  <div>
                    <h3 className="text-lg font-medium">Error Loading Comments</h3>
                    <p className="text-sm mt-1">{error}</p>
                    <button 
                      onClick={fetchComments}
                      className="mt-3 px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-md">
                <FaCommentDots className="mx-auto text-gray-300 text-6xl mb-4" />
                <p className="text-gray-500 text-lg font-medium">No {activeTab} comments found</p>
                <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
                  {searchTerm 
                    ? "Try adjusting your search criteria"
                    : `There are no ${activeTab} comments in the system yet`}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comment
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedComments().map(comment => (
                        <tr key={`${comment.type}-${comment.id}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div 
                              className="flex items-center cursor-pointer" 
                              onClick={() => navigateToUserProfile(getUserIdFromComment(comment))}
                              title="View user profile"
                            >
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                {comment.user?.profilePicture ? (
                                  <img src={comment.user.profilePicture} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                  <FaUserCircle className="h-6 w-6 text-blue-500" />
                                )}
                              </div>
                              <div className="ml-4 hover:text-blue-600">
                                <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                                  {getDisplayName(comment.user)}
                                  {comment.type === 'progress' && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                      Progress
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  @{getUsername(comment.user)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => viewCommentDetails(comment)} 
                              className="text-left hover:text-blue-700"
                              title="View complete comment"
                            >
                              <p className="text-sm text-gray-800 max-w-md truncate hover:underline">
                                {comment.content}
                              </p>
                              {comment.parentTitle && (
                                <p className="text-xs text-gray-500 mt-1">
                                  on: <span className="italic">{comment.parentTitle}</span>
                                </p>
                              )}
                              {comment.parentCommentId && (
                                <p className="text-xs text-purple-600 mt-1">
                                  <span className="bg-purple-50 px-1.5 py-0.5 rounded">Reply to another comment</span>
                                </p>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center px-2.5 py-0.5 rounded-full bg-${getCommentSource(comment).color}-100 text-${getCommentSource(comment).color}-800 text-xs max-w-max`}>
                              {getCommentSource(comment).icon}
                              <span className="ml-1.5">
                                {getCommentSource(comment).label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <button 
                                onClick={() => navigateToContent(comment)}
                                className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                title="View in context"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => openDeleteModal(comment)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete comment"
                              >
                                <FaTrashAlt className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-500">
                      Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, comments.length)} of {comments.length} comments
                    </div>
                    <nav className="flex items-center">
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-l-md border ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        <FaChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                        // For many pages, show current page and some neighbors
                        let pageNum = i + 1;
                        if (totalPages > 5) {
                          if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3 py-1 border-t border-b ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-indigo-600 hover:bg-indigo-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-r-md border ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-indigo-600 hover:bg-indigo-50'
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
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaExclamationCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Comment
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this comment? This action cannot be undone.
                      </p>
                      {selectedComment && (
                        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="text-sm text-gray-800">{selectedComment.content}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            By: {getDisplayName(selectedComment.user)} 
                            <span className="mx-1">|</span> 
                            {formatDate(selectedComment.createdAt)}
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
                  onClick={handleDeleteComment}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Detail Modal */}
      {showCommentModal && viewingComment && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeCommentModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-scaleIn">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={closeCommentModal}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                      <div className={`mr-2 p-1 rounded-full bg-${getCommentSource(viewingComment).color}-100`}>
                        {getCommentSource(viewingComment).icon}
                      </div>
                      {viewingComment.type === 'progress' ? 'Progress Comment' : 'Post Comment'} Details
                    </h3>

                    {viewingComment.parentTitle && (
                      <div className="mb-4 text-sm">
                        <span className="font-medium text-gray-500">On:</span> 
                        <span className="ml-2 text-indigo-600">{viewingComment.parentTitle}</span>
                      </div>
                    )}

                    {viewingComment.parentCommentId && (
                      <div className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100">
                        <span className="font-medium text-purple-700">Reply Comment:</span> 
                        <span className="ml-2 text-gray-700">This is a reply to another comment (ID: {viewingComment.parentCommentId})</span>
                      </div>
                    )}

                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          {viewingComment.user?.profilePicture ? (
                            <img 
                              src={viewingComment.user.profilePicture} 
                              alt="Profile" 
                              className="h-12 w-12 rounded-full object-cover" 
                            />
                          ) : (
                            <FaUserCircle className="h-8 w-8 text-blue-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <button 
                            onClick={() => {
                              navigateToUserProfile(getUserIdFromComment(viewingComment));
                              closeCommentModal();
                            }}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center"
                          >
                            {getDisplayName(viewingComment.user)}
                            {viewingComment.type === 'progress' && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Progress
                              </span>
                            )}
                          </button>
                          <div className="text-xs text-gray-500">
                            @{getUsername(viewingComment.user)}
                          </div>
                        </div>
                        <div className="ml-auto text-xs text-gray-500">
                          {formatDate(viewingComment.createdAt)}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-800 whitespace-pre-wrap">{viewingComment.content}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          navigateToContent(viewingComment);
                          closeCommentModal();
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <FaExternalLinkAlt className="mr-2 h-4 w-4" />
                        View in Context
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          openDeleteModal(viewingComment);
                          closeCommentModal();
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaTrashAlt className="mr-2 h-4 w-4" />
                        Delete Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentManagement; 