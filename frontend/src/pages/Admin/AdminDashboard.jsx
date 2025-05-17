import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api';
import AdminSidebar from './AdminSidebar';
import { 
  FaUsers, 
  FaChartLine, 
  FaCommentAlt, 
  FaHeart, 
  FaFileAlt, 
  FaGraduationCap,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt
} from 'react-icons/fa';

// Lazy load chart components to avoid React 19 initialization issues
const ChartComponent = lazy(() => import('./ChartComponent'));

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [progress, setProgress] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalProgress: 0,
    totalComments: 0,
    totalLikes: 0,
    newUsersToday: 0,
    postsThisWeek: 0,
    engagementRate: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!apiService.isUserAdmin()) {
      navigate('/');
      return;
    }

    // Fetch all data for the dashboard
    fetchDashboardData();
  }, [navigate, timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all required data
      const userData = await apiService.admin.getAllUsers();
      const postsData = await apiService.getAllPosts();
      const progressData = await apiService.getAllProgress();
      
      // Fetch comments from all posts
      const commentsPromises = postsData.map(post => 
        apiService.getCommentsByPost(post.id)
          .catch(() => [])
      );
      const allCommentsArrays = await Promise.all(commentsPromises);
      const allComments = allCommentsArrays.flat();
      
      // Calculate total likes
      const totalLikes = postsData.reduce((total, post) => total + (post.likeCount || 0), 0);
      
      // Update state with fetched data
      setUsers(userData);
      setPosts(postsData);
      setProgress(progressData);
      setComments(allComments);
      
      // Calculate dashboard statistics
      calculateStats(userData, postsData, progressData, allComments, totalLikes);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (users, posts, progress, comments, likes) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    
    // Calculate new users today
    const newUsersToday = users.filter(user => {
      const createdAt = new Date(user.createdAt || user.registeredAt);
      return createdAt >= today;
    }).length;
    
    // Calculate posts this week
    const postsThisWeek = posts.filter(post => {
      const createdAt = new Date(post.createdAt || post.timestamp);
      return createdAt >= oneWeekAgo;
    }).length;
    
    // Calculate engagement rate
    const engagementRate = posts.length > 0 ? 
      ((comments.length + likes) / posts.length).toFixed(1) : 0;
    
    setStats({
      totalUsers: users.length,
      totalPosts: posts.length,
      totalProgress: progress.length,
      totalComments: comments.length,
      totalLikes: likes,
      newUsersToday,
      postsThisWeek,
      engagementRate
    });
  };

  // Generate date labels for charts
  const getLabels = () => {
    const labels = [];
    const now = new Date();
    
    switch(timeRange) {
      case 'week':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        break;
      case 'month':
        for (let i = 0; i < 4; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - (i * 7));
          labels.push(`Week ${i+1}`);
        }
        break;
      case 'year':
        for (let i = 0; i < 12; i++) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        labels.reverse();
        break;
      default:
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
    }
    
    return labels;
  };

  // Generate sample data for charts
  // In a real app, this would come from your analytics API
  const generateSampleData = (min, max, count) => {
    return Array.from({ length: count }, () => 
      Math.floor(Math.random() * (max - min + 1)) + min
    );
  };

  // Chart data preparation
  const chartData = {
    userActivity: {
      labels: getLabels(),
      datasets: [
        {
          label: 'New Users',
          data: generateSampleData(3, 10, getLabels().length),
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Active Users',
          data: generateSampleData(20, 40, getLabels().length),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    contentCreation: {
      labels: getLabels(),
      datasets: [
        {
          label: 'Posts',
          data: generateSampleData(4, 12, getLabels().length),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Progress Updates',
          data: generateSampleData(10, 20, getLabels().length),
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    engagement: {
      labels: getLabels(),
      datasets: [
        {
          label: 'Comments',
          data: generateSampleData(5, 15, getLabels().length),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
        },
        {
          label: 'Likes',
          data: generateSampleData(15, 30, getLabels().length),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
        }
      ]
    },
    contentCategories: {
      labels: ['Programming', 'Design', 'Photography', 'Writing', 'Music', 'Other'],
      datasets: [
        {
          data: generateSampleData(10, 30, 6),
          backgroundColor: [
            'rgba(79, 70, 229, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(107, 114, 128, 0.8)'
          ],
          borderWidth: 0,
        }
      ]
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar - Fixed position */}
      <div className="fixed left-0 top-0 h-screen bg-white z-10 shadow-md">
        <AdminSidebar activeTab={activeTab} />
      </div>
      
      {/* Main Content - Add left margin to make space for fixed sidebar */}
      <div className="flex-1 overflow-auto ml-72">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
              <p className="text-gray-500 mt-1">Monitor platform performance and user engagement</p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="bg-white rounded-lg shadow p-2 flex items-center">
                <FaCalendarAlt className="text-gray-400 mr-2" />
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border-0 focus:ring-0 text-sm font-medium"
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              
              <Link 
                to="/userdashboard" 
                className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 py-2 px-4 rounded-lg shadow-sm text-sm font-medium"
              >
                Back to User Dashboard
              </Link>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Users Card */}
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-indigo-100 mr-4">
                      <FaUsers className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Users</p>
                      <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.newUsersToday} new today
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Posts Card */}
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 mr-4">
                      <FaFileAlt className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Posts</p>
                      <h3 className="text-2xl font-bold text-gray-800">{stats.totalPosts}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.postsThisWeek} this week
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Engagement Card */}
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 mr-4">
                      <FaHeart className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Engagement</p>
                      <h3 className="text-2xl font-bold text-gray-800">{stats.engagementRate}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Interactions per post
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Progress Card */}
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 mr-4">
                      <FaGraduationCap className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Progress Updates</p>
                      <h3 className="text-2xl font-bold text-gray-800">{stats.totalProgress}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Learning milestones
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* User Activity Chart */}
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-lg font-semibold mb-4">User Activity</h2>
                  <div className="h-80">
                    <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading chart...</div>}>
                      <ChartComponent 
                        type="line" 
                        data={chartData.userActivity}
                      />
                    </Suspense>
                  </div>
                </div>
                
                {/* Content Creation Chart */}
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-lg font-semibold mb-4">Content Creation</h2>
                  <div className="h-80">
                    <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading chart...</div>}>
                      <ChartComponent 
                        type="line" 
                        data={chartData.contentCreation}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>
              
              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Engagement Chart */}
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-lg font-semibold mb-4">Engagement Metrics</h2>
                  <div className="h-80">
                    <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading chart...</div>}>
                      <ChartComponent 
                        type="bar" 
                        data={chartData.engagement}
                      />
                    </Suspense>
                  </div>
                </div>
                
                {/* Categories Chart */}
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-lg font-semibold mb-4">Content Categories</h2>
                  <div className="h-80 flex justify-center items-center">
                    <div className="w-4/5 h-full">
                      <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading chart...</div>}>
                        <ChartComponent 
                          type="doughnut" 
                          data={chartData.contentCategories}
                        />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Users */}
                <div className="bg-white p-6 rounded-xl shadow col-span-1">
                  <h2 className="text-lg font-semibold mb-4">Top Users</h2>
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user, index) => (
                      <div key={user.id || index} className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-indigo-600 font-medium">{user.username?.charAt(0).toUpperCase() || '?'}</span>
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">{user.username || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500">{user.email || 'No email available'}</p>
                        </div>
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                          {(user.postCount || 0) + (user.progressCount || 0)} contributions
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Popular Posts */}
                <div className="bg-white p-6 rounded-xl shadow col-span-1">
                  <h2 className="text-lg font-semibold mb-4">Popular Posts</h2>
                  <div className="space-y-4">
                    {posts.slice(0, 5).map((post, index) => (
                      <div key={post.id || index} className="border-l-4 border-indigo-500 pl-4 py-1">
                        <p className="font-medium truncate">{post.title || 'Untitled Post'}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <FaHeart className="mr-1 text-red-500" />
                          <span className="mr-3">{post.likeCount || 0}</span>
                          <FaCommentAlt className="mr-1 text-blue-500" />
                          <span>{post.commentCount || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-xl shadow col-span-1">
                  <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4 py-1">
                      <p className="text-sm font-medium">New user registered</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4 py-1">
                      <p className="text-sm font-medium">New post created</p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-4 py-1">
                      <p className="text-sm font-medium">Progress update shared</p>
                      <p className="text-xs text-gray-500">32 minutes ago</p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4 py-1">
                      <p className="text-sm font-medium">New comment added</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4 py-1">
                      <p className="text-sm font-medium">User liked a post</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;