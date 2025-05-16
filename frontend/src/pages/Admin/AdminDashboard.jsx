import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api';
import AdminSidebar from './AdminSidebar';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [progress, setProgress] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!apiService.isUserAdmin()) {
      navigate('/');
      return;
    }

    // Fetch data based on active tab
    fetchData(activeTab);
  }, [navigate, activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      switch(tab) {
        case 'users':
          const userData = await apiService.admin.getAllUsers();
          setUsers(userData);
          break;
        case 'posts':
          const postsData = await apiService.getAllPosts();
          setPosts(postsData);
          break;
        case 'progress':
          const progressData = await apiService.getAllProgress();
          setProgress(progressData);
          break;
        case 'comments':
          // Get comments from all posts
          const allPosts = await apiService.getAllPosts();
          const commentsPromises = allPosts.map(post => 
            apiService.getCommentsByPost(post.id)
              .then(comments => comments.map(comment => ({
                ...comment,
                postTitle: post.title || 'Unknown Post'
              })))
              .catch(() => [])
          );
          const allCommentsArrays = await Promise.all(commentsPromises);
          const allComments = allCommentsArrays.flat();
          setComments(allComments);
          break;
        default:
          break;
      }
      setError(null);
    } catch (err) {
      setError(err.message || `Failed to fetch ${tab}`);
      console.error(`Error fetching ${tab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiService.admin.deleteUser(userId);
      setSuccessMessage('User deleted successfully');
      fetchData('users');
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      await apiService.admin.promoteUserToAdmin(userId);
      setSuccessMessage('User promoted to admin successfully');
      fetchData('users');
    } catch (err) {
      setError(err.message || 'Failed to promote user');
      console.error('Error promoting user:', err);
    }
  };

  const handleDemoteAdmin = async (userId) => {
    try {
      await apiService.admin.demoteAdminToUser(userId);
      setSuccessMessage('Admin demoted to user successfully');
      fetchData('users');
    } catch (err) {
      setError(err.message || 'Failed to demote admin');
      console.error('Error demoting admin:', err);
    }
  };

  const handleDeleteAllPosts = async () => {
    if (!window.confirm('Are you sure you want to delete ALL posts? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiService.admin.deleteAllPosts();
      setSuccessMessage('All posts deleted successfully');
      if (activeTab === 'posts') {
        fetchData('posts');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete all posts');
      console.error('Error deleting posts:', err);
    }
  };

  const handleDeleteAllProgress = async () => {
    if (!window.confirm('Are you sure you want to delete ALL progress records? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiService.admin.deleteAllProgress();
      setSuccessMessage('All progress records deleted successfully');
      if (activeTab === 'progress') {
        fetchData('progress');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete all progress records');
      console.error('Error deleting progress records:', err);
    }
  };

  const handleDeleteAllComments = async () => {
    if (!window.confirm('Are you sure you want to delete ALL comments? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiService.admin.deleteAllComments();
      setSuccessMessage('All comments deleted successfully');
      if (activeTab === 'comments') {
        fetchData('comments');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete all comments');
      console.error('Error deleting comments:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiService.admin.deletePost(postId);
      setSuccessMessage('Post deleted successfully');
      fetchData('posts');
    } catch (err) {
      setError(err.message || 'Failed to delete post');
      console.error('Error deleting post:', err);
    }
  };

  const handleDeleteProgress = async (progressId) => {
    if (!window.confirm('Are you sure you want to delete this progress record? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiService.admin.deleteProgressRecord(progressId);
      setSuccessMessage('Progress record deleted successfully');
      fetchData('progress');
    } catch (err) {
      setError(err.message || 'Failed to delete progress record');
      console.error('Error deleting progress record:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiService.admin.deleteComment(commentId);
      setSuccessMessage('Comment deleted successfully');
      fetchData('comments');
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
      console.error('Error deleting comment:', err);
    }
  };

  // Helper function to check if a user is an admin
  const isUserAdmin = (user) => {
    return user.role && user.role.includes('ROLE_ADMIN');
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <AdminSidebar activeTab={activeTab} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <Link 
              to="/userdashboard" 
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none"
            >
              Back to User Dashboard
            </Link>
          </div>
          
          {/* Display error message if there is one */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {/* Display success message if there is one */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Success: </strong>
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          
          {/* Global actions section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Global Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <h3 className="font-medium text-lg mb-2">Posts Management</h3>
                <p className="text-gray-600 mb-4">Delete all posts from the platform.</p>
                <button 
                  onClick={handleDeleteAllPosts}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded focus:outline-none"
                >
                  Delete All Posts
                </button>
              </div>
              
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <h3 className="font-medium text-lg mb-2">Progress Management</h3>
                <p className="text-gray-600 mb-4">Delete all progress records from the platform.</p>
                <button 
                  onClick={handleDeleteAllProgress}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded focus:outline-none"
                >
                  Delete All Progress
                </button>
              </div>
              
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <h3 className="font-medium text-lg mb-2">Comments Management</h3>
                <p className="text-gray-600 mb-4">Delete all comments from the platform.</p>
                <button 
                  onClick={handleDeleteAllComments}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded focus:outline-none"
                >
                  Delete All Comments
                </button>
              </div>
            </div>
          </div>
          
          {/* Navigation tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`mr-8 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`mr-8 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'posts'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab('progress')}
                  className={`mr-8 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'progress'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Progress
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`mr-8 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'comments'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Comments
                </button>
              </nav>
            </div>
          </div>
          
          {/* Content based on active tab */}
          {loading ? (
            <div className="flex justify-center my-10">
              <p className="text-gray-500">Loading data...</p>
            </div>
          ) : (
            <div>
              {/* Users tab */}
              {activeTab === 'users' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">User Management</h2>
                  <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-sm">ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Username</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Role</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className={isUserAdmin(user) ? 'bg-blue-50' : ''}>
                            <td className="py-3 px-4">{user.id}</td>
                            <td className="py-3 px-4">{user.username}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">
                              {isUserAdmin(user) ? (
                                <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-xs">
                                  Admin
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-800 py-1 px-2 rounded-full text-xs">
                                  User
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                {isUserAdmin(user) ? (
                                  <button
                                    onClick={() => handleDemoteAdmin(user.id)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded text-xs"
                                  >
                                    Demote to User
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handlePromoteUser(user.id)}
                                    className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-xs"
                                  >
                                    Promote to Admin
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Posts tab */}
              {activeTab === 'posts' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Posts Management</h2>
                  {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {posts.map((post) => (
                        <div key={post.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                          <div className="p-4">
                            <h3 className="font-medium text-lg mb-1 truncate">{post.title}</h3>
                            <p className="text-sm text-gray-500 mb-2">
                              By {post.author?.username || 'Unknown'} • {new Date(post.timestamp || post.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                            <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                            <div className="flex justify-between items-center">
                              <Link
                                to={`/posts/${post.id}`}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                              >
                                View Post
                              </Link>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-6 bg-white rounded-lg shadow">No posts found.</p>
                  )}
                </div>
              )}

              {/* Progress tab */}
              {activeTab === 'progress' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Progress Management</h2>
                  {progress.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {progress.map((progressItem) => (
                        <div key={progressItem.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                          <div className="p-4">
                            <h3 className="font-medium text-lg mb-1 truncate">{progressItem.title}</h3>
                            <p className="text-sm text-gray-500 mb-2">
                              By {progressItem.user?.username || 'Unknown'} • {new Date(progressItem.timestamp || progressItem.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                            <p className="text-gray-700 mb-4 line-clamp-3">{progressItem.content || progressItem.description}</p>
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleDeleteProgress(progressItem.id)}
                                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-6 bg-white rounded-lg shadow">No progress records found.</p>
                  )}
                </div>
              )}

              {/* Comments tab */}
              {activeTab === 'comments' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Comments Management</h2>
                  {comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg overflow-hidden bg-white shadow-sm p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                For post: {comment.postTitle || 'Unknown Post'}
                              </p>
                              <p className="mb-2 font-medium">
                                By {comment.author?.username || comment.user?.username || 'Unknown user'} • {new Date(comment.timestamp || comment.createdAt || Date.now()).toLocaleDateString()}
                              </p>
                              <p className="text-gray-700">{comment.content || comment.text}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-6 bg-white rounded-lg shadow">No comments found.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 