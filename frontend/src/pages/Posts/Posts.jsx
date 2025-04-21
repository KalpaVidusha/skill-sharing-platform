// src/pages/Posts/Posts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/api';
import PostCard from './PostCard';
import SearchFilter from '../../components/SearchFilter';
import Navbar from '../../components/Navbar';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(to right, #e3f2fd, #f8fbff)',
      padding: '80px 20px 40px',
      fontFamily: "'Poppins', sans-serif",
      animation: 'fadeSlideIn 0.8s ease-in-out'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '30px',
      color: '#1565c0',
      fontSize: '34px',
      fontWeight: '700',
      textAlign: 'center',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: '24px',
      marginTop: '24px'
    },
    errorMessage: {
      backgroundColor: '#ffebee',
      color: '#c62828',
      textAlign: 'center',
      padding: '16px',
      borderRadius: '8px',
      fontWeight: '500',
      marginBottom: '20px'
    },
    loader: {
      display: 'flex',
      justifyContent: 'center',
      padding: '50px 0'
    },
    spinner: {
      border: '4px solid #bbdefb',
      borderTop: '4px solid #2196f3',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite'
    },
    emptyState: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      fontSize: '18px',
      color: '#777',
      padding: '60px 0'
    }
  };

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
      setError('⚠️ Unable to load posts. Please try again later.');
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
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="relative">
          {/* Animated sphere logo */}
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-800 rounded-full shadow-lg animate-pulse">
            <div className="absolute inset-4 bg-white/30 rounded-full"></div>
          </div>
          
          {/* SkillSphere text with animation */}
          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent">
              SkillSphere
            </h1>
            <p className="mt-2 text-blue-700/80 animate-pulse">Crafting your learning universe...</p>
          </div>
        </div>
        
        {/* Animated loading dots */}
        <div className="flex space-x-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
        
        {/* Subtle footer */}
        <p className="absolute bottom-6 text-sm text-blue-900/50">
          Loading posts page...
        </p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <style>{`
          @keyframes fadeSlideIn {
            0% {
              opacity: 0;
              transform: translateY(40px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        <div style={styles.content}>
          <h1 style={styles.header}>Explore Shared Skills</h1>

          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          {error && <div style={styles.errorMessage}>{error}</div>}

          {loading ? (
            <div style={styles.loader}>
              <div style={styles.spinner}></div>
            </div>
          ) : (
            <div style={styles.grid}>
              {posts.length > 0 ? (
                posts.map(post => <PostCard key={post.id} post={post} />)
              ) : (
                <div style={styles.emptyState}>
                  No posts found based on your filters.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Posts;
