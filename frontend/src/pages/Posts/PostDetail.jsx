import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        if (response.status === 200) {
          setPost(response.data);
        } else {
          setError('Post not found');
          navigate('/404'); // Redirect to 404 page if implemented
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="error-container">
        <h2>Oops! 😢</h2>
        <p>{error || 'The requested post could not be found'}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <article className="post-content">
        <header>
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span className="category-badge">{post.category}</span>
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </header>

        <section className="media-gallery">
          {post.mediaUrls.map((url, index) => (
            <div key={index} className="media-item">
              {url.match(/\.(mp4|mov|avi)$/i) ? (
                <div className="video-container">
                  <video controls>
                    <source src={url} type={`video/${url.split('.').pop()}`} />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <img 
                  src={url} 
                  alt={`Visual content for ${post.title}`}
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </section>

        <section className="post-description">
          <h3>Description</h3>
          <p>{post.description}</p>
        </section>
      </article>

     
    </div>
  );
};

export default PostDetail;