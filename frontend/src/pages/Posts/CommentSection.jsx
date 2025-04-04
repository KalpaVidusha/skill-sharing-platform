import React, { useState } from 'react';
import api from '../services/api';

const CommentSection = ({ postId, comments }) => {
  const [newComment, setNewComment] = useState('');
  const [allComments, setAllComments] = useState(comments);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content: newComment,
        userId: localStorage.getItem('userId')
      });
      setAllComments([...allComments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <div className="comment-section">
      <h3>Comments ({allComments.length})</h3>
      
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          required
        />
        <button type="submit">Post Comment</button>
      </form>

      <div className="comment-list">
        {allComments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <span className="author">{comment.user.username}</span>
              <span className="date">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="comment-content">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;