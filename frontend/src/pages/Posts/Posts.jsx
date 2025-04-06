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
    
    const styles = {
        container: `
            min-height: 100vh;
            background-color: #f5f7fa;
            padding: 40px 20px;
            font-family: 'Roboto', sans-serif;
        `,
        content: `
            max-width: 1200px;
            margin: 0 auto;
        `,
        header: `
            margin-bottom: 30px;
            color: #333;
            font-size: 32px;
            font-weight: 600;
        `,
        grid: `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 25px;
        `,
        sortSection: `
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
        `,
        sortLabel: `
            display: flex;
            align-items: center;
            margin-right: 10px;
            font-size: 14px;
            color: #666;
        `,
        sortSelect: `
            padding: 8px 15px;
            border-radius: 5px;
            border: 1px solid #ddd;
            background-color: white;
            cursor: pointer;
            font-size: 14px;
            color: #333;
        `,
        errorMessage: `
            color: #e74c3c;
            text-align: center;
            padding: 20px;
            font-size: 16px;
            background-color: #fdecea;
            border-radius: 8px;
            margin-bottom: 20px;
        `,
        loader: `
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 50px 0;
        `,
        spinner: `
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 4px solid #3498db;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        `,
        emptyState: `
            text-align: center;
            padding: 50px 0;
            color: #888;
            font-size: 18px;
            grid-column: 1 / -1;
        `
    };

    return (
        <div style={{ cssText: styles.container }}>
            <div style={{ cssText: styles.content }}>
                <h1 style={{ cssText: styles.header }}>Explore Skill Posts</h1>
                
                <SearchFilter 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />

                <div style={{ cssText: styles.sortSection }}>
                    <span style={{ cssText: styles.sortLabel }}>Sort by:</span>
                    <select style={{ cssText: styles.sortSelect }}>
                        <option>Most popular</option>
                        <option>Newest</option>
                        <option>Oldest</option>
                    </select>
                </div>

                {error && (
                    <div style={{ cssText: styles.errorMessage }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ cssText: styles.loader }}>
                        <div style={{ cssText: styles.spinner }}></div>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                ) : (
                    <div style={{ cssText: styles.grid }}>
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div style={{ cssText: styles.emptyState }}>
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