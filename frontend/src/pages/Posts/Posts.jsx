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

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-blue-400">Explore Skill Posts</h1>
                
                <SearchFilter 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />

                {error && (
                    <div className="text-red-400 text-center mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-xl text-gray-400">No posts found matching your criteria</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Posts;