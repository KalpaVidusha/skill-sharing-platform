// src/pages/Posts/Posts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import PostCard from './PostCard';
import SearchFilter from '../../components/SearchFilter';
import Navbar from '../../components/Navbar';

const Posts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (selectedCategory) {
        data = await apiService.getPostsByCategory(selectedCategory);
      } else if (searchTerm) {
        data = await apiService.searchPosts(searchTerm);
      } else {
        data = await apiService.getAllPosts();
      }

      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Unable to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const categories = [...new Set(posts.map(post => post?.category).filter(Boolean))];

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-white flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">Explore Shared Skills</h1>
            <p className="text-gray-600">Discover community-shared tutorials and resources</p>
          </div>

          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  onClick={() => navigate(`/posts/${post.id}`)}
                />
              ))
            ) : (
              <div className="col-span-full text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-600">No posts found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;