import React from 'react';
import { Link } from 'react-router-dom';

const PostList = ({ posts }) => {
  return (
    <div className="post-grid">
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <div className="media-preview">
            {post.mediaUrls.slice(0, 3).map((url, index) => (
              <div key={index} className="media-item">
                {url.match(/\.(mp4|mov|avi)$/) ? (
                  <video controls>
                    <source src={url} type="video/mp4" />
                  </video>
                ) : (
                  <img src={url} alt={`Post media ${index + 1}`} />
                )}
              </div>
            ))}
          </div>
          <div className="post-content">
            <h3><Link to={`/post/${post.id}`}>{post.title}</Link></h3>
            <span className="post-category">{post.category}</span>
            <p className="post-description">{post.description}</p>
            <div className="post-meta">
              <Link to={`/profile/${post.userId}`}>View Profile</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;