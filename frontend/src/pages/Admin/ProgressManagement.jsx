import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api';
import AdminSidebar from './AdminSidebar';
import { FaArrowLeft, FaUser, FaExclamationCircle, FaCheckCircle, FaSearch, 
  FaTrash, FaCalendarAlt, FaChartLine, FaClock, FaTimes, FaHeart, FaComment, 
  FaExternalLinkAlt, FaChartBar, FaChartArea, FaUsers, FaCheck, FaStar } from 'react-icons/fa';


const ProgressManagement = () => {
  const [progressItems, setProgressItems] = useState([]);
  const [filteredProgresses, setFilteredProgresses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProgressId, setSelectedProgressId] = useState(null);
  const [selectedProgress, setSelectedProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');
  const [analyticsData, setAnalyticsData] = useState({
    totalProgress: 0,
    totalLikes: 0,
    totalComments: 0,
    averageEngagement: 0,
    progressByTemplate: {},
    progressByDay: {},
    userWithMostProgress: { username: '', count: 0 },
    mostLikedProgress: { title: '', likes: 0 },
    progressTrend: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!apiService.isUserAdmin()) {
      navigate('/');
      return;
    }

    // Fetch progress data
    fetchProgressData();
  }, [navigate]);

  // Apply search filter whenever progress or searchQuery changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProgresses(progressItems);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = progressItems.filter(progress => 

        // Search by user name
        (progress.user?.username && progress.user.username.toLowerCase().includes(query)) ||
        (getUserName(progress.user) && getUserName(progress.user).toLowerCase().includes(query)) ||

        // Search by title/template        
        (getTemplateNameSafe(progress.content) && getTemplateNameSafe(progress.content).toLowerCase().includes(query)) ||

        // Search by content/description
        (progress.content && typeof progress.content === 'string' && progress.content.toLowerCase().includes(query)) ||
        (progress.description && typeof progress.description === 'string' && progress.description.toLowerCase().includes(query))
      );
      setFilteredProgresses(filtered);
    }
  }, [progressItems, searchQuery]);

  // Helper function to get user's name from different possible fields
  const getUserName = (user) => {
    if (!user) return 'Unknown User';
    return `${user.firstName} ${user.lastName}`;
  };

  const getTemplateNameSafe = (content) => {
    if (!content) return '';
    
    if (typeof content === 'object' && content.goalName) {
      return content.goalName;
    }
    if (typeof content === 'object' && content.tutorialName) {
      return content.tutorialName;
    }
    if (typeof content === 'object' && content.skillName) {
      return content.skillName;
    }
  };

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllProgress();
      setProgressItems(data);
      setFilteredProgresses(data);
      processAnalyticsData(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch progress data');
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (progressId) => {
    // Find the selected progress to display its details in the modal
    const selectedProgress = progressItems.find(progress => progress.id === progressId);
    
    setSelectedProgressId(progressId);
    setSelectedProgress(selectedProgress || null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedProgressId(null);
    setSelectedProgress(null);
  };

  const handleDeleteProgress = async () => {
    if (!selectedProgressId) return;
    
    try {
      await apiService.admin.deleteProgressRecord(selectedProgressId);
      setSuccessMessage('Progress record deleted successfully');
      fetchProgressData();
      closeDeleteModal();
    } catch (err) {
      setError(err.message || 'Failed to delete progress record');
      console.error('Error deleting progress:', err);
      closeDeleteModal();
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Navigate to user profile
  const navigateToUserProfile = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Function to get progress's title or default
  const getProgressTitle = (progress) => {
    // First check if a regular title exists
    if (progress.title) return progress.title;
    
    // Check for content based on templateType
    if (progress.templateType && progress.content) {
      switch (progress.templateType) {
        case 'completed_tutorial':
          return `Completed: ${progress.content.tutorialName || 'Tutorial'}`;
        case 'new_skill':
          return `New Skill: ${progress.content.skillName || 'Skill'}`;
        case 'learning_goal':
          return `Goal: ${progress.content.goalName || 'Learning Goal'}`;
        default:
          break;
      }
    }
  };

  // Function to get progress's content or default
  const getProgressContent = (progress) => {
    // First check for templated content
    if (progress.templateType && progress.content) {
      switch (progress.templateType) {
        case 'completed_tutorial':
          return `✅ I completed ${progress.content.tutorialName || 'a tutorial'} today!`;
        case 'new_skill':
          return `🎯 Today I learned about ${progress.content.skillName || 'a new skill'}`;
        case 'learning_goal':
          return `📅 I aim to finish ${progress.content.goalName || 'my goal'} by ${progress.content.targetDate || 'the deadline'}`;
        default:
          break;
      }
    }
    
    // Handle content that might be objects
    if (progress.content) {
      if (typeof progress.content === 'object') {
        // Try to extract meaningful properties
        const contentObj = progress.content;
        if (contentObj.tutorialName) return `Completed: ${contentObj.tutorialName}`;
        if (contentObj.skillName) return `New skill: ${contentObj.skillName}`;
        if (contentObj.goalName) return `Goal: ${contentObj.goalName}`;
        if (contentObj.text || contentObj.description) return contentObj.text || contentObj.description;
        
        return JSON.stringify(progress.content);
      }
      return progress.content;
    }
    
    if (progress.description) {
      return typeof progress.description === 'object' ? JSON.stringify(progress.description) : progress.description;
    }
    
    return 'No description available';
  };

  // Function to get the template display name
  const getTemplateDisplay = (template, progress) => {
    // First check templateType which is most reliable
    if (progress.templateType) {
      switch (progress.templateType) {
        case 'completed_tutorial':
          return progress.content && progress.content.tutorialName ? progress.content.tutorialName : 'Tutorial';
        case 'new_skill':
          return progress.content && progress.content.skillName ? progress.content.skillName : 'New Skill';
        case 'learning_goal':
          return progress.content && progress.content.goalName ? progress.content.goalName : 'Learning Goal';
        default:
          return progress.templateType;
      }
    }
    
    if (!template) return null;
    
    // Handle object with tutorialName
    if (typeof template === 'object') {
      if (template.tutorialName) return template.tutorialName;
      if (template.skillName) return template.skillName;
      if (template.goalName) return template.goalName;
      
      // Try to extract any meaningful property
      const keys = Object.keys(template);
      for (const key of keys) {
        if (typeof template[key] === 'string' && key.toLowerCase().includes('name')) {
          return template[key];
        }
      }
      
      return JSON.stringify(template);
    }
    
    // Handle stringified JSON
    if (typeof template === 'string') {
      try {
        // Try to parse if it's a stringified JSON
        const parsed = JSON.parse(template);
        if (parsed && typeof parsed === 'object') {
          if (parsed.tutorialName) return parsed.tutorialName;
          if (parsed.skillName) return parsed.skillName;
          if (parsed.goalName) return parsed.goalName;
        }
      } catch (e) {
        // If it's not valid JSON, just return the string
        return template;
      }
    }
    
    return typeof template === 'string' ? template : JSON.stringify(template);
  };

  // Function to get media URL for a progress
  const getMediaUrl = (progress) => {
    return progress.mediaUrl;
  };

  // Helper to get like count
  const getLikeCount = (progress) => {
    if (progress.likes && Array.isArray(progress.likes)) return progress.likes.length;

    return 0;
  };

  // Helper to get comment count
  const getCommentCount = (progress) => {
    if (progress.commentCount !== undefined) return progress.commentCount;
    return 0;
  };

  // Process analytics data from progress items
  const processAnalyticsData = (progressData) => {
    // Initialize counters and trackers
    let totalLikes = 0;
    let totalComments = 0;
    const progressByTemplate = {};
    const progressByDay = {};
    const progressByUser = {};
    let mostLikedProgress = { title: '', likes: 0 };
    let progressTrend = [];

    // Last 7 days for trends
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      last7Days.push(dateString);
      progressByDay[dateString] = { count: 0, likes: 0, comments: 0 };
    }

    // Process each progress item
    progressData.forEach(progress => {
      // Count likes
      const likeCount = getLikeCount(progress);
      totalLikes += likeCount;
      
      // Count comments
      const commentCount = getCommentCount(progress);
      totalComments += commentCount;
      
      // Track by template type
      const template = progress.templateType || 'other';
      if (!progressByTemplate[template]) {
        progressByTemplate[template] = 0;
      }
      progressByTemplate[template]++;
      
      // Track most liked progress
      if (likeCount > mostLikedProgress.likes) {
        mostLikedProgress = {
          title: getProgressTitle(progress) || 'Untitled Progress',
          likes: likeCount
        };
      }
      
      // Track by user
      const userId = progress.user?.id;
      if (userId) {
        if (!progressByUser[userId]) {
          progressByUser[userId] = {
            username: progress.user.username || getUserName(progress.user),
            count: 0
          };
        }
        progressByUser[userId].count++;
      }
      
      // Track by day (for trends)
      if (progress.createdAt || progress.timestamp) {
        const progressDate = new Date(progress.createdAt || progress.timestamp);
        const dateKey = progressDate.toISOString().split('T')[0];
        
        // Only include if it's within our time range (last 7 days)
        if (progressByDay[dateKey]) {
          progressByDay[dateKey].count++;
          progressByDay[dateKey].likes += likeCount;
          progressByDay[dateKey].comments += commentCount;
        }
      }
    });
    
    // Find user with most progress
    let userWithMostProgress = { username: 'None', count: 0 };
    Object.values(progressByUser).forEach(user => {
      if (user.count > userWithMostProgress.count) {
        userWithMostProgress = user;
      }
    });
    
    // Format trend data for display
    progressTrend = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: progressByDay[date].count,
      likes: progressByDay[date].likes,
      comments: progressByDay[date].comments
    }));
    
    // Calculate average engagement
    const averageEngagement = progressData.length > 0 ? 
      ((totalLikes + totalComments) / progressData.length).toFixed(1) : 0;
    
    // Update analytics state
    setAnalyticsData({
      totalProgress: progressData.length,
      totalLikes,
      totalComments,
      averageEngagement,
      progressByTemplate,
      progressByDay,
      userWithMostProgress,
      mostLikedProgress,
      progressTrend
    });
  };

  // Simple Chart Component for progress trends using CSS
  const SimpleTrendChart = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.count));
    
    return (
      <div className="mt-4">
        <div className="flex justify-between mb-1 text-xs text-gray-500">
          {data.map((item, i) => (
            <div key={i} className="text-center">{item.date}</div>
          ))}
        </div>
        <div className="flex items-end h-40 justify-between">
          {data.map((item, i) => (
            <div key={i} className="flex flex-col items-center w-1/7">
              <div className="text-xs text-gray-700 mb-1">{item.count}</div>
              <div 
                className="w-8 bg-blue-500 rounded-t-md transition-all"
                style={{ 
                  height: maxValue > 0 ? `${(item.count / maxValue) * 100}%` : '0%',
                  minHeight: item.count > 0 ? '10px' : '0px'
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    )
  };
  
  // Simple Distribution Chart
  const SimpleDistributionChart = ({ data }) => {
    // Convert object to array
    const items = Object.entries(data).map(([key, value]) => {
      let label = key;
      
      // Format template types
      if (key === 'completed_tutorial') label = 'Tutorial';
      else if (key === 'new_skill') label = 'New Skill';
      else if (key === 'learning_goal') label = 'Goal';
      
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value
      };
    });
    
    const total = items.reduce((sum, item) => sum + item.value, 0);
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-red-500', 'bg-purple-500', 'bg-indigo-500'
    ];
    
    return (
      <div className="mt-4">
        {items.map((item, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <div className="font-medium">{item.label}</div>
              <div>{item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</div>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${colors[i % colors.length]}`} 
                style={{ width: total > 0 ? `${(item.value / total) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab="progress" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Progress Management</h1>
              <p className="text-gray-600 mt-1">Manage user progress records across the platform</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link 
                to="/admin" 
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-all"
              >
                <FaArrowLeft className="text-sm" />
                Admin Dashboard
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
            
            {successMessage && (
              <div className="flex items-start p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <FaCheckCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-green-800 font-medium">Success</h3>
                  <p className="text-green-600 text-sm">{successMessage}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Tab navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6 flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center justify-center px-5 py-3 rounded-lg transition-all ${
                activeTab === 'overview' 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaChartBar className="mr-2" />
              Overview & Analytics
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center justify-center px-5 py-3 rounded-lg transition-all ${
                activeTab === 'list' 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaUsers className="mr-2" />
              Progress List
            </button>
          </div>
          
          {/* Analytics Overview Section */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 mr-4">
                      <FaChartLine className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Progress Updates</p>
                      <h3 className="text-2xl font-bold text-gray-800">{analyticsData.totalProgress}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 mr-4">
                      <FaHeart className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Likes</p>
                      <h3 className="text-2xl font-bold text-gray-800">{analyticsData.totalLikes}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 mr-4">
                      <FaComment className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Comments</p>
                      <h3 className="text-2xl font-bold text-gray-800">{analyticsData.totalComments}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 mr-4">
                      <FaUsers className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Engagement Rate</p>
                      <h3 className="text-2xl font-bold text-gray-800">{analyticsData.averageEngagement}</h3>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress Trend Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Progress Activity Trend</h3>
                  <div className="h-72">
                    {analyticsData.progressTrend.length > 0 && (
                      <SimpleTrendChart data={analyticsData.progressTrend} />
                    )}
                  </div>
                </div>
                
                {/* Progress Template Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Progress Types Distribution</h3>
                  <div className="h-72">
                    <SimpleDistributionChart data={analyticsData.progressByTemplate} />
                  </div>
                </div>
              </div>
              
              {/* Additional Stats Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Active User */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Most Active User</h3>
                  <div className="flex items-center">
                    <div className="p-4 bg-blue-100 rounded-full mr-4 flex items-center justify-center">
                      <FaStar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold">{analyticsData.userWithMostProgress.username}</h4>
                      <p className="text-gray-600">
                        <span className="font-medium">{analyticsData.userWithMostProgress.count}</span> progress updates
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Most Liked Progress */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Most Liked Progress</h3>
                  <div className="flex items-center">
                    <div className="p-4 bg-red-100 rounded-full mr-4 flex items-center justify-center">
                      <FaHeart className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold truncate max-w-xs">{analyticsData.mostLikedProgress.title}</h4>
                      <p className="text-gray-600">
                        <span className="font-medium">{analyticsData.mostLikedProgress.likes}</span> likes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Progress List Section */}
          {activeTab === 'list' && (
            <>
              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="relative w-full max-w-md">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by user, title, or template..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Found {filteredProgresses.length} of {progressItems.length} progress records
                </div>
              </div>
              
              {/* Progress Grid */}
              {loading ? (
                <div className="p-8 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Loading progress data...</p>
                </div>
              ) : filteredProgresses.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl shadow-sm">
                  <FaChartLine className="mx-auto text-5xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Progress Records Found</h3>
                  <p className="text-gray-600">
                    {searchQuery ? 'No progress records match your search criteria.' : 'There are no progress records in the system.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProgresses.map((progress) => (
                    <div key={progress.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                      {/* Media section - only show if media exists */}
                      {getMediaUrl(progress) && (
                        <div className="w-full h-48 overflow-hidden bg-gray-100">
                          <img 
                            src={getMediaUrl(progress)} 
                            alt={getProgressTitle(progress)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate" title={getProgressTitle(progress)}>
                            {getProgressTitle(progress)}
                          </h3>
                          <button 
                            onClick={() => openDeleteModal(progress.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete progress record"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        
                        <div className="flex items-center mb-3">
                          <div 
                            className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 cursor-pointer"
                            onClick={() => navigateToUserProfile(progress.user?.id)}
                          >
                            {progress.user?.profilePicture ? (
                              <img 
                                src={progress.user.profilePicture} 
                                alt={getUserName(progress.user)}
                                className="h-8 w-8 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-blue-600 font-medium">
                                {progress.user?.username?.charAt(0) || 'U'}
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => navigateToUserProfile(progress.user?.id)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {getUserName(progress.user)}
                          </button>
                        </div>
                        
                        <div className="mb-4 h-16 overflow-y-auto bg-gray-50 p-2 rounded-md">
                          <p className="text-gray-600 text-sm">
                            {getProgressContent(progress)}
                          </p>
                        </div>
                        
                        {/* Template & Stats */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          {(progress.template || progress.templateType) && (
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                              {getTemplateDisplay(progress.template, progress)}
                            </span>
                          )}
                          
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center text-gray-500">
                              <FaHeart className="mr-1 text-red-400" />
                              <span className="text-xs font-bold">{getLikeCount(progress)}</span>
                            </div>
                            <div className="flex items-center text-gray-500">
                              <FaComment className="mr-1 text-blue-400" />
                              <span className="text-xs font-bold">{getCommentCount(progress)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            Created: {formatDate(progress.createdAt || progress.timestamp)}
                          </div>
                          {progress.updatedAt && (
                            <div className="flex items-center">
                              <FaClock className="mr-2 text-gray-400" />
                              Updated: {formatDate(progress.updatedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">Confirm Deletion</h3>
                  <button onClick={closeDeleteModal} className="text-gray-500 hover:text-gray-700">
                    <FaTimes className="text-xl" />
                  </button>
                </div>
                
                {/* Modal Content */}
                {selectedProgress && (
                  <div className="px-6 py-5">
                    {/* Progress Info */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900">{getProgressTitle(selectedProgress)}</h4>
                      <p className="text-sm text-blue-600">By {getUserName(selectedProgress.user)}</p>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      Are you sure you want to delete this progress record? This action cannot be undone.
                    </p>
                  </div>
                )}
                
                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    onClick={closeDeleteModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProgress}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <FaTrash className="mr-2" /> Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressManagement; 