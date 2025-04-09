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
            backgroundColor: '#f5f7fa',
            padding: '40px 20px',
            fontFamily: "'Roboto', sans-serif"
        },
        content: {
            maxWidth: '1200px',
            margin: '0 auto'
        },
        header: {
            marginBottom: '30px',
            color: '#333',
            fontSize: '32px',
            fontWeight: '600',
            textAlign: 'center'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '25px'
        },
        errorMessage: {
            color: '#e74c3c',
            textAlign: 'center',
            padding: '20px',
            fontSize: '16px',
            backgroundColor: '#fdecea',
            borderRadius: '8px',
            marginBottom: '20px'
        },
        loader: {
            display: 'flex',
            justifyContent: 'center',
            padding: '50px 0'
        },
        spinner: {
            border: '4px solid rgba(0, 0, 0, 0.1)',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
        },
        emptyState: {
            textAlign: 'center',
            padding: '50px 0',
            color: '#888',
            fontSize: '18px',
            gridColumn: '1 / -1'
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
            setError('Failed to load posts. Please try again later.');
            console.error('Error fetching posts:', err);
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
            <div style={styles.content}>
                <h1 style={styles.header}>Explore Skill Posts</h1>
                
                <SearchFilter 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />

                {error && (
                    <div style={styles.errorMessage}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={styles.loader}>
                        <div style={styles.spinner}></div>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div style={styles.emptyState}>
                                No posts found matching your criteria
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Posts;