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
      if (userId && data.user && data.user.id === userId) {
        setIsPostOwner(true);
      }
      if (data.likedUserIds?.includes(userId)) {
        setLiked(true);
      }
    };

    const fetchComments = async () => {
      const res = await fetch(`http://localhost:8081/api/comments/post/${id}`, {
        credentials: 'include'
      });
      const data = await res.json();
      setComments(data);
    };

    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };

    fetchPost();
    fetchComments();
    checkLoginStatus();
  }, [id]);

  const handleAddComment = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { returnTo: `/posts/${id}` } });
      return;
    }

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postId: id,
          userId: localStorage.getItem('userId'),
          content: newComment
        })
      });

      if (response.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
        navigate('/login');
        return;
      }

      setNewComment('');
      setError('');
      const updated = await fetch(`http://localhost:8081/api/comments/post/${id}`, {
        credentials: 'include'
      });
      const data = await updated.json();
      setComments(data);
    } catch (err) {
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      await fetch(`http://localhost:8081/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newContent })
      });
      const updated = await fetch(`http://localhost:8081/api/comments/post/${id}`, {
        credentials: 'include'
      });
      const data = await updated.json();
      setComments(data);
      setEditingComment(null);
    } catch (err) {
      setError('Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await fetch(`http://localhost:8081/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const updated = await fetch(`http://localhost:8081/api/comments/post/${id}`, {
        credentials: 'include'
      });
      const data = await updated.json();
      setComments(data);
    } catch (err) {
      setError('Failed to delete comment.');
    }
  };

  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { returnTo: `/posts/${id}` } });
      return;
    }

    try {
      const res = await fetch(`http://localhost:8081/api/posts/${id}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
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
    <div style={{ padding: '30px' }}>
      <Link to="/">← Back to Home</Link>
      <h1>{post?.title}</h1>
      <p><strong>Category:</strong> {post?.category}</p>
      <p>{post?.description}</p>

      <div style={{ margin: '15px 0' }}>
        <button onClick={handleToggleLike} style={{
          backgroundColor: liked ? '#ff4081' : '#e0e0e0',
          color: liked ? 'white' : 'black',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer'
        }}>
          {liked ? 'Unlike' : 'Like'} ({likeCount})
        </button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <textarea
          placeholder={isLoggedIn ? "Write a comment..." : "Log in to comment"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '6px' }}
          disabled={!isLoggedIn}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button
          onClick={handleAddComment}
          disabled={!isLoggedIn}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoggedIn ? '#2196f3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoggedIn ? 'pointer' : 'not-allowed'
          }}
        >
          Add Comment
        </button>
      </div>

      <h3 style={{ marginTop: '30px' }}>Comments</h3>
      {comments.length === 0 ? (
        <p>No comments yet</p>
      ) : (
        comments.map(c => (
          <div key={c.id} style={{ backgroundColor: '#f0f0f0', padding: '10px', marginTop: '10px', borderRadius: '4px' }}>
            {editingComment === c.id ? (
              <>
                <textarea
                  value={c.content}
                  onChange={(e) => {
                    const updated = comments.map(comment => comment.id === c.id ? { ...comment, content: e.target.value } : comment);
                    setComments(updated);
                  }}
                />
                <button onClick={() => handleUpdateComment(c.id, c.content)}>Save</button>
                <button onClick={() => setEditingComment(null)}>Cancel</button>
              </>
            ) : (
              <>
                <p>{c.content}</p>
                <small>{new Date(c.createdAt).toLocaleString()}</small>
                {canManageComment(c) && (
                  <div>
                    <button onClick={() => setEditingComment(c.id)}>Edit</button>
                    <button onClick={() => handleDeleteComment(c.id)}>Delete</button>
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
