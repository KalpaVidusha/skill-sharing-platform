// src/pages/Posts/PostCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors shadow-lg">
      {post.mediaUrls?.length > 0 && (
        <img 
          src={post.mediaUrls[0]} 
          alt={post.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      <h3 className="text-xl font-bold mb-2 text-blue-300">{post.title}</h3>
      <p className="text-gray-400 mb-4 line-clamp-3">{post.description}</p>
      <div className="flex items-center justify-between">
        <span className="inline-block bg-gray-600 text-blue-200 px-3 py-1 rounded-full text-sm">
          {post.category}
        </span>
        <Link 
          to={`/posts/${post.id}`}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default PostCard;