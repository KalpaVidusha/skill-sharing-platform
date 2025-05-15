import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import PostCard from './PostCard';
import Navbar from '../../components/Navbar';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FiEdit, FiTrash2, FiPlusCircle } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        
        const data = await apiService.getPostsByUser(userId);
        setPosts(data);
      } catch (err) {
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this post?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await apiService.deletePost(postId);
              setPosts(posts.filter(post => post.id !== postId));
            } catch (err) {
              setError('Failed to delete post');
            }
          }
        },
        { label: 'No' }
      ],
      overlayClassName: 'fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-r from-blue-50 to-white">
        {/* Sidebar with sticky positioning - now self-contained */}
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          <Sidebar defaultActiveTab="myposts" />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-indigo-900">My Posts</h1>
              <Link 
                to="/add-post"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <FiPlusCircle className="text-lg" />
                Create New Post
              </Link>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-indigo-100">
                <p className="text-gray-600 mb-4">You haven't created any posts yet.</p>
                <Link 
                  to="/add-post" 
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
                >
                  Create Your First Post
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
                  <div key={post.id} className="relative group">
                    <PostCard post={post} />
                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Link
                        to={`/edit-post/${post.id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center"
                        title="Edit Post"
                      >
                        <FiEdit className="text-lg" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center"
                        title="Delete Post"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MyPosts;