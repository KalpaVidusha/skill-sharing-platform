import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPostOwner, setIsPostOwner] = useState(false);
  const [error, setError] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const data = await apiService.getPostById(id);
      setPost(data);
      setLikeCount(data.likeCount || 0);
      const userId = localStorage.getItem('userId');
      if (userId && data.user?.id === userId) setIsPostOwner(true);
      if (data.likedUserIds?.includes(userId)) setLiked(true);
    };

    const fetchComments = async () => {
      try {
        const data = await apiService.getCommentsByPost(id);
        setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };

    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    fetchPost();
    fetchComments();
  }, [id]);

  const handleAddComment = async () => {
    if (!isLoggedIn) return navigate('/login', { state: { returnTo: `/posts/${id}` } });
    if (!newComment.trim()) return setError('Comment cannot be empty');
    try {
      await apiService.addComment({
        postId: id,
        content: newComment
      });
      setNewComment('');
      setError('');
      // Refresh comments after adding
      const data = await apiService.getCommentsByPost(id);
      setComments(data);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment.');
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      await apiService.updateComment(commentId, { content });
      // Refresh comments after updating
      const data = await apiService.getCommentsByPost(id);
      setComments(data);
      setEditingComment(null);
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await apiService.deleteComment(commentId);
      // Refresh comments after deleting
      const data = await apiService.getCommentsByPost(id);
      setComments(data);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment.');
    }
  };

  const handleToggleLike = async () => {
    if (!isLoggedIn) return navigate('/login', { state: { returnTo: `/posts/${id}` } });
    try {
      const data = await apiService.toggleLike(id);
      setLikeCount(data.likeCount);
      setLiked(data.likedByCurrentUser);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const canManageComment = (comment) => {
    const userId = localStorage.getItem('userId');
    return isLoggedIn && (comment.userId === userId || isPostOwner);
  };

  return (
    <div style={{ padding: '30px', background: '#eaf4ff', fontFamily: 'Arial, sans-serif', animation: 'fadeIn 0.5s ease' }}>
      <style>
        {`@keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }`}
      </style>

      <Link to="/" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}>← Back to Home</Link>

      <h1 style={{ color: '#0d47a1', marginBottom: '10px' }}>{post?.title}</h1>
      <p style={{ fontSize: '14px', color: '#1565c0' }}><b>Category:</b> {post?.category}</p>
      <p style={{ backgroundColor: '#f0f7ff', padding: '12px', borderRadius: '6px' }}>{post?.description}</p>

      {post?.mediaUrls?.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', margin: '20px 0' }}>
          {post.mediaUrls.map((url, index) => (
            <div key={index} style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {url.match(/\.(mp4|webm|ogg)(\?.*)?$/i) ? (
                <video controls style={{ width: '100%', display: 'block' }}>
                  <source src={url} type={`video/${url.split('.').pop().split('?')[0]}`} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img src={url} alt={`Media ${index}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={handleToggleLike} style={{
        backgroundColor: liked ? '#42a5f5' : '#bbdefb',
        color: liked ? '#fff' : '#0d47a1',
        padding: '8px 20px',
        border: 'none',
        borderRadius: '30px',
        fontWeight: 'bold',
        marginTop: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}>
        {liked ? '💙 Unlike' : '🤍 Like'} ({likeCount})
      </button>

      <div style={{ marginTop: '30px' }}>
        <textarea
          placeholder={isLoggedIn ? "Write a comment..." : "Log in to comment"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{ width: '100%', height: '90px', padding: '12px', borderRadius: '10px', border: '1px solid #90caf9', background: '#f1f9ff' }}
          disabled={!isLoggedIn}
        />
        {error && <p style={{ color: '#e53935' }}>{error}</p>}
        <button
          onClick={handleAddComment}
          disabled={!isLoggedIn}
          style={{ marginTop: '10px', padding: '10px 24px', backgroundColor: isLoggedIn ? '#1976d2' : '#ccc', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: isLoggedIn ? 'pointer' : 'not-allowed' }}
        >
          Add Comment
        </button>
      </div>

      <h3 style={{ marginTop: '30px', color: '#0d47a1' }}>Comments</h3>
      {comments.length === 0 ? (
        <p>No comments yet</p>
      ) : (
        comments.map(c => (
          <div key={c.id} style={{ background: '#e3f2fd', padding: '16px', marginTop: '10px', borderRadius: '8px' }}>
            {editingComment === c.id ? (
              <>
                <textarea
                  value={c.content}
                  onChange={(e) => {
                    const updated = comments.map(comment =>
                      comment.id === c.id ? { ...comment, content: e.target.value } : comment
                    );
                    setComments(updated);
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button onClick={() => handleUpdateComment(c.id, c.content)} style={{ marginTop: '8px', marginRight: '10px' }}>💾 Save</button>
                <button onClick={() => setEditingComment(null)}>❌ Cancel</button>
              </>
            ) : (
              <>
                <p>{c.content}</p>
                <small>{new Date(c.createdAt).toLocaleString()}</small>
                {canManageComment(c) && (
                  <div style={{ marginTop: '10px' }}>
                    <button onClick={() => setEditingComment(c.id)} style={{ marginRight: '10px' }}>✏️ Edit</button>
                    <button onClick={() => handleDeleteComment(c.id)}>🗑️ Delete</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PostDetail;
