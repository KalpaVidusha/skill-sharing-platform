// src/pages/Posts/Posts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/api';
import PostCard from './PostCard';
import SearchFilter from '../../components/SearchFilter';

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
      padding: '40px 20px',
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

  return (
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
  );
};

export default Posts;
