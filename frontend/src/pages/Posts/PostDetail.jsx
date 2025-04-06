// src/pages/Posts/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../../services/api';

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        backButton: {
            display: 'inline-flex',
            alignItems: 'center',
            marginBottom: '30px',
            color: '#2684ff',
            textDecoration: 'none',
            fontWeight: '500',
            ':hover': {
                textDecoration: 'underline'
            }
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            padding: '30px'
        },
        mediaGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        },
        mediaItem: {
            borderRadius: '8px',
            overflow: 'hidden',
            height: '250px',
            backgroundColor: '#f8f9fa'
        },
        mediaImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        },
        title: {
            fontSize: '32px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '20px'
        },
        description: {
            color: '#444',
            lineHeight: 1.6,
            fontSize: '16px',
            whiteSpace: 'pre-wrap'
        }
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const data = await apiService.getPostById(id);
                setPost(data);
            } catch (err) {
                setError('Failed to load post details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
                <div style={{
                    border: '4px solid rgba(0, 0, 0, 0.1)',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return <div style={{ 
            color: '#e74c3c',
            textAlign: 'center',
            padding: '20px',
            fontSize: '16px',
            backgroundColor: '#fdecea',
            borderRadius: '8px'
        }}>{error}</div>;
    }

    if (!post) {
        return <div style={{ 
            color: '#e74c3c',
            textAlign: 'center',
            padding: '20px',
            fontSize: '16px',
            backgroundColor: '#fdecea',
            borderRadius: '8px'
        }}>Post not found</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <Link to="/posts" style={styles.backButton}>
                    ← Back to All Courses
                </Link>
                
                <div style={styles.card}>
                    {post.mediaUrls?.length > 0 && (
                        <div style={styles.mediaGrid}>
                            {post.mediaUrls.map((url, index) => (
                                <div key={index} style={styles.mediaItem}>
                                    <img 
                                        src={url} 
                                        alt={`Post media ${index + 1}`} 
                                        style={styles.mediaImage}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <h1 style={styles.title}>{post.title}</h1>
                    
                    <div style={{ marginBottom: '30px' }}>
                        <span style={{ 
                            backgroundColor: '#f0f5ff',
                            color: '#2684ff',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px'
                        }}>
                            {post.category}
                        </span>
                    </div>

                    <div style={styles.description}>
                        {post.description || 'No description available'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;