import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../../services/api';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const currentUserId = localStorage.getItem('userId');

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
      fontWeight: '500'
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
      whiteSpace: 'pre-wrap',
      marginBottom: '30px'
    },
    commentBox: {
      backgroundColor: '#f0f2f5',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '10px',
      position: 'relative'
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/comments/post/${id}`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Error loading comments', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId) return;
    try {
      await fetch(`http://localhost:8081/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: id,
          userId: currentUserId,
          content: newComment
        })
      });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleUpdateComment = async () => {
    try {
      await fetch(`http://localhost:8081/api/comments/${editCommentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      });
      setEditCommentId(null);
      setEditContent('');
      fetchComments();
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await fetch(`http://localhost:8081/api/comments/${commentId}`, {
        method: 'DELETE'
      });
      fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await apiService.getPostById(id);
        setPost(data);
      } catch (err) {
        console.error('Failed to load post details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    fetchComments();
  }, [id]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <Link to="/posts" style={styles.backButton}>← Back to All Courses</Link>

        <div style={styles.card}>
          {post?.mediaUrls?.length > 0 && (
            <div style={styles.mediaGrid}>
              {post.mediaUrls.map((url, index) => (
                <div key={index} style={styles.mediaItem}>
                  {url.endsWith('.mp4') ? (
                    <video controls style={styles.mediaImage}>
                      <source src={url} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={url} alt={`Post media ${index + 1}`} style={styles.mediaImage} />
                  )}
                </div>
              ))}
            </div>
          )}

          <h1 style={styles.title}>{post?.title || 'Untitled'}</h1>

          <span style={{
            backgroundColor: '#f0f5ff',
            color: '#2684ff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px'
          }}>
            {post?.category || 'Uncategorized'}
          </span>

          <div style={styles.description}>{post?.description || 'No description available'}</div>

          {/* Add Comment Section for Logged-in Users */}
          {currentUserId && (
            <>
              <textarea
                placeholder="Write your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  borderRadius: '6px',
                  padding: '10px',
                  marginBottom: '10px',
                  border: '1px solid #ccc'
                }}
              />
              <button
                onClick={handleAddComment}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#2684ff',
                  color: 'white',
                  borderRadius: '30px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Add a Comment
              </button>
            </>
          )}

          {/* Comment List */}
          <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '20px 0 10px' }}>Comments</h3>
          {comments.length === 0 ? (
            <p style={{ color: '#888' }}>No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} style={styles.commentBox}>
                {editCommentId === comment.id ? (
                  <>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px' }}
                    />
                    <button
                      onClick={handleUpdateComment}
                      style={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        marginTop: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <p>{comment.content}</p>
                    <span style={{ fontSize: '12px', color: '#888' }}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </>
                )}

                {currentUserId && comment.userId === currentUserId && (
                  <div style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <FaEye
                      title="View"
                      style={{ cursor: 'pointer', color: '#2196f3' }}
                      onClick={() => alert(comment.content)}
                    />
                    <FaEdit
                      title="Edit"
                      style={{ cursor: 'pointer', color: '#4caf50' }}
                      onClick={() => {
                        setEditCommentId(comment.id);
                        setEditContent(comment.content);
                      }}
                    />
                    <FaTrash
                      title="Delete"
                      style={{ cursor: 'pointer', color: '#f44336' }}
                      onClick={() => handleDeleteComment(comment.id)}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
