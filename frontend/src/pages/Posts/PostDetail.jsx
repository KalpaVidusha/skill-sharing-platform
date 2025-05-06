import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import Navbar from '../../components/Navbar';

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [postData, commentsData] = await Promise.all([
          apiService.getPostById(id),
          apiService.getCommentsByPost(id)
        ]);
        
        setPost(postData);
        setComments(commentsData);
        setLikeCount(postData.likeCount || 0);
        
        const userId = localStorage.getItem('userId');
        if (userId && postData.user?.id === userId) setIsPostOwner(true);
        if (postData.likedUserIds?.includes(userId)) setLiked(true);
        
        setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddComment = async () => {
    if (!isLoggedIn) return navigate('/login', { state: { returnTo: `/posts/${id}` } });
    if (!newComment.trim()) return setError('Comment cannot be empty');
    try {
      await apiService.addComment({ postId: id, content: newComment });
      setNewComment('');
      setError('');
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
      const data = await apiService.getCommentsByPost(id);
      setComments(data);
      setEditingComment(null);
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment.');
    }
  };

  const confirmDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setCommentToDelete(null);
    setShowConfirm(false);
  };

  const handleDeleteComment = async () => {
    try {
      await apiService.deleteComment(commentToDelete);
      const data = await apiService.getCommentsByPost(id);
      setComments(data);
      setShowConfirm(false);
      setCommentToDelete(null);
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

  const canEditComment = (comment) => {
    const userId = localStorage.getItem('userId');
    return isLoggedIn && comment.userId === userId;
  };

  const canDeleteComment = (comment) => {
    const userId = localStorage.getItem('userId');
    return isLoggedIn && (comment.userId === userId || isPostOwner);
  };

  if (isLoading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #e6f7ff 0%, #bbdefb 50%, #90caf9 100%)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Background animated circles */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          top: '10%',
          left: '10%',
          animation: 'float-slow 8s infinite ease-in-out'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(144, 202, 249, 0.3)',
          bottom: '20%',
          right: '15%',
          animation: 'float-slow 6s infinite ease-in-out'
        }}></div>
        
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1565c0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 2,
          textShadow: '0 2px 10px rgba(255, 255, 255, 0.8)'
        }}>
          <div className="spinner" style={{
            width: '60px',
            height: '60px',
            border: '6px solid #e3f2fd',
            borderTop: '6px solid #1565c0',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px',
            boxShadow: '0 0 30px rgba(144, 202, 249, 0.5)'
          }}></div>
          <div style={{ animation: 'pulse 1.5s infinite' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      padding: '20px 0',
      position: 'relative'
    }}>
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInRight {
            0% { opacity: 0; transform: translateX(50px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInLeft {
            0% { opacity: 0; transform: translateX(-50px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          @keyframes float-slow {
            0% { transform: translate(0, 0); }
            50% { transform: translate(15px, -15px); }
            100% { transform: translate(0, 0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { opacity: 0.6; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1.02); }
            100% { opacity: 0.6; transform: scale(0.98); }
          }
          @keyframes glow {
            0% { box-shadow: 0 0 5px rgba(33, 150, 243, 0.5); }
            50% { box-shadow: 0 0 20px rgba(33, 150, 243, 0.8); }
            100% { box-shadow: 0 0 5px rgba(33, 150, 243, 0.5); }
          }
          @keyframes wave {
            0% { transform: rotate(0deg); }
            33% { transform: rotate(10deg); }
            66% { transform: rotate(-10deg); }
            100% { transform: rotate(0deg); }
          }
          .comment-enter {
            animation: fadeIn 0.5s ease-out;
          }
          .like-animation {
            animation: float 0.8s ease-in-out;
          }
          .title-animate {
            animation: slideInLeft 0.7s ease-out;
          }
          .body-animate {
            animation: fadeIn 0.8s ease-out;
          }
          .comment-section {
            animation: slideInRight 0.9s ease-out;
          }
          .button-hover:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(33, 150, 243, 0.4);
          }
          .image-hover:hover {
            transform: scale(1.03);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }
          .tag-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
          }
        `}
      </style>

      {/* Floating background elements */}
      <div style={{
        position: 'fixed',
        top: '5%',
        left: '5%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%)',
        animation: 'float-slow 15s infinite ease-in-out',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'fixed',
        bottom: '10%',
        right: '5%',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(144, 202, 249, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
        animation: 'float-slow 12s infinite ease-in-out',
        zIndex: 0
      }}></div>

      <Navbar />
      
      <div style={{
        padding: '40px',
        maxWidth: '900px',
        margin: '40px auto',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '16px',
        boxShadow: '0 15px 35px rgba(30, 136, 229, 0.2)',
        animation: 'fadeIn 0.7s ease-out',
        border: '1px solid rgba(144, 202, 249, 0.6)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(144, 202, 249, 0.4) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 0,
          animation: 'float-slow 10s infinite ease-in-out'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          left: '-60px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(187, 222, 251, 0.5) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 0,
          animation: 'float-slow 8s infinite ease-in-out'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{
            textDecoration: 'none',
            color: '#1565c0',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            marginBottom: '20px',
            transition: 'all 0.3s ease',
            padding: '10px 18px',
            borderRadius: '30px',
            background: 'rgba(187, 222, 251, 0.4)',
            border: '1px solid rgba(144, 202, 249, 0.3)',
            animation: 'slideInLeft 0.5s ease-out',
            boxShadow: '0 4px 10px rgba(33, 150, 243, 0.1)'
          }} className="button-hover">
            <span style={{ marginRight: '8px', animation: 'wave 1.5s infinite' }}>👈</span> Back to Home
          </Link>

          <h1 style={{
            color: '#1565c0',
            margin: '25px 0 15px',
            fontSize: '2.4rem',
            fontWeight: '700',
            borderBottom: '3px solid #90caf9',
            paddingBottom: '12px',
            textShadow: '0 2px 4px rgba(33, 150, 243, 0.1)'
          }} className="title-animate">{post?.title}</h1>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '25px',
            flexWrap: 'wrap',
            animation: 'slideInLeft 0.8s ease-out'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              color: '#1565c0',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.95rem',
              fontWeight: '500',
              boxShadow: '0 3px 8px rgba(33, 150, 243, 0.15)',
              border: '1px solid rgba(144, 202, 249, 0.3)',
              transition: 'all 0.3s ease'
            }} className="tag-hover">{post?.category}</span>
            
            {post?.tags?.map((tag, index) => (
              <span key={index} style={{
                background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
                color: '#0d47a1',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                boxShadow: '0 3px 8px rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(144, 202, 249, 0.3)',
                transition: 'all 0.3s ease',
                animation: `fadeIn ${0.5 + index * 0.1}s ease-out`
              }} className="tag-hover">#{tag}</span>
            ))}
          </div>

          <div style={{
            backgroundColor: '#f8fbff',
            padding: '30px',
            borderRadius: '14px',
            marginBottom: '35px',
            borderLeft: '5px solid #42a5f5',
            boxShadow: '0 8px 20px rgba(33, 150, 243, 0.08)',
            animation: 'fadeIn 1s ease-out',
            border: '1px solid rgba(144, 202, 249, 0.5)'
          }} className="body-animate">
            <p style={{
              margin: 0,
              lineHeight: '1.8',
              color: '#37474f',
              fontSize: '1.15rem'
            }}>{post?.description}</p>
          </div>

          {post?.mediaUrls?.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '25px',
              margin: '35px 0',
              animation: 'fadeIn 1.2s ease-out'
            }}>
              {post.mediaUrls.map((url, index) => (
                <div key={index} style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  transition: 'all 0.4s ease',
                  border: '3px solid white',
                  animation: `fadeIn ${1 + index * 0.2}s ease-out`
                }} className="image-hover">
                  {url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video controls style={{ width: '100%', display: 'block' }}>
                      <source src={url} type={`video/${url.split('.').pop()}`} />
                    </video>
                  ) : (
                    <img 
                      src={url} 
                      alt={`media-${index}`} 
                      style={{ 
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        transition: 'transform 0.4s ease'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={handleToggleLike} 
            className={liked ? 'like-animation button-hover' : 'button-hover'}
            style={{
              backgroundColor: liked ? '#1e88e5' : '#e3f2fd',
              color: liked ? 'white' : '#1565c0',
              padding: '14px 28px',
              border: 'none',
              borderRadius: '30px',
              fontWeight: 'bold',
              cursor: 'pointer',
              margin: '25px 0 35px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1.1rem',
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.25)',
              animation: 'pulse 2s infinite ease-in-out'
            }}
          >
            {liked ? (
              <>
                <span style={{ fontSize: '1.3rem', animation: 'pulse 1s infinite' }}>💙</span> Liked ({likeCount})
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.3rem' }}>🤍</span> Like ({likeCount})
              </>
            )}
          </button>

          {/* Comment Input */}
          <div style={{
            marginTop: '45px',
            background: 'linear-gradient(to bottom, #ffffff, #f5f9ff)',
            padding: '30px',
            borderRadius: '16px',
            border: '1px solid #bbdefb',
            boxShadow: '0 8px 25px rgba(144, 202, 249, 0.15)',
            animation: 'slideInRight 1s ease-out'
          }} className="comment-section">
            <h3 style={{ 
              marginBottom: '18px', 
              color: '#1565c0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '1.5rem'
            }}>
              <span style={{ fontSize: '1.5rem', animation: 'float 3s infinite ease-in-out' }}>💬</span> 
              Leave a Comment
            </h3>
            <textarea
              placeholder={isLoggedIn ? "Share your thoughts..." : "Please log in to leave a comment"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{
                width: '100%',
                height: '120px',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid #bbdefb',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1.05rem',
                resize: 'vertical',
                minHeight: '120px',
                transition: 'all 0.3s ease',
                boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.05)'
              }}
              disabled={!isLoggedIn}
              className={isLoggedIn ? "textarea-focus" : ""}
            />
            {error && <p style={{ 
              color: '#d32f2f',
              marginTop: '12px',
              padding: '10px 15px',
              background: '#ffebee',
              borderRadius: '8px',
              display: 'inline-block',
              border: '1px solid #ffcdd2',
              animation: 'fadeIn 0.3s ease-out'
            }}>{error}</p>}
            <button
              onClick={handleAddComment}
              disabled={!isLoggedIn}
              style={{
                marginTop: '18px',
                backgroundColor: isLoggedIn ? '#1e88e5' : '#e0e0e0',
                color: isLoggedIn ? 'white' : '#9e9e9e',
                padding: '14px 28px',
                border: 'none',
                borderRadius: '30px',
                cursor: isLoggedIn ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                fontSize: '1.05rem',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: isLoggedIn ? '0 4px 15px rgba(33, 150, 243, 0.25)' : 'none'
              }}
              className={isLoggedIn ? "button-hover" : ""}
            >
              <span style={{ fontSize: '1.2rem', animation: isLoggedIn ? 'float 2s infinite' : 'none' }}>✏️</span> Post Comment
            </button>
          </div>

          {/* Comments Display */}
          <h3 style={{ 
            marginTop: '60px', 
            color: '#1565c0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingBottom: '12px',
            borderBottom: '3px solid #90caf9',
            fontSize: '1.5rem',
            animation: 'slideInLeft 1.2s ease-out'
          }}>
            <span style={{ fontSize: '1.5rem', animation: 'float 3s infinite ease-in-out' }}>🗨️</span> 
            Comments ({comments.length})
          </h3>
          
          {comments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px 25px',
              background: 'linear-gradient(to bottom, #f8fbff, #f0f8ff)',
              borderRadius: '14px',
              marginTop: '25px',
              border: '1px dashed #bbdefb',
              animation: 'fadeIn 1.3s ease-out',
              boxShadow: '0 5px 15px rgba(33, 150, 243, 0.05)'
            }}>
              <p style={{ 
                color: '#5c6bc0',
                fontSize: '1.2rem',
                margin: 0,
                animation: 'pulse 2s infinite ease-in-out'
              }}>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div style={{ marginTop: '25px' }}>
              {comments.map((c, index) => (
                <div 
                  key={c.id} 
                  className="comment-enter"
                  style={{ 
                    background: 'linear-gradient(to right, #ffffff, #f5f9ff)',
                    padding: '25px',
                    borderRadius: '14px',
                    marginBottom: '20px',
                    borderLeft: '5px solid #42a5f5',
                    boxShadow: '0 8px 20px rgba(33, 150, 243, 0.08)',
                    transition: 'all 0.4s ease',
                    animation: `fadeIn ${1.2 + index * 0.15}s ease-out`,
                    border: '1px solid rgba(144, 202, 249, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(33, 150, 243, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(33, 150, 243, 0.08)';
                  }}
                >
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
                        style={{ 
                          width: '100%', 
                          padding: '18px',
                          borderRadius: '10px',
                          border: '1px solid #bbdefb',
                          fontSize: '1.05rem',
                          minHeight: '120px',
                          marginBottom: '18px',
                          background: 'white',
                          boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.05)'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                          onClick={() => handleUpdateComment(c.id, c.content)}
                          style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                            transition: 'all 0.3s ease'
                          }}
                          className="button-hover"
                        >
                          <span>💾</span> Save
                        </button>
                        <button 
                          onClick={() => setEditingComment(null)}
                          style={{
                            padding: '10px 20px',
                            background: '#e3f2fd',
                            color: '#1565c0',
                            border: 'none',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.1)',
                            transition: 'all 0.3s ease'
                          }}
                          className="button-hover"
                        >
                          <span>❌</span> Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ 
                        marginBottom: '12px',
                        fontSize: '1.1rem',
                        lineHeight: '1.7',
                        color: '#37474f'
                      }}>{c.content}</p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '18px'
                      }}>
                        <small style={{
                          color: '#78909c',
                          fontSize: '0.9rem',
                          background: 'rgba(187, 222, 251, 0.3)',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          boxShadow: '0 2px 5px rgba(33, 150, 243, 0.1)'
                        }}>Posted on {new Date(c.createdAt).toLocaleString()}</small>
                        
                        {(canEditComment(c) || canDeleteComment(c)) && (
                          <div style={{ display: 'flex', gap: '12px' }}>
                            {canEditComment(c) && (
                              <button 
                                onClick={() => setEditingComment(c.id)}
                                style={{
                                  background: 'rgba(187, 222, 251, 0.3)',
                                  border: '1px solid rgba(144, 202, 249, 0.3)',
                                  color: '#1565c0',
                                  cursor: 'pointer',
                                  fontSize: '0.95rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '6px 14px',
                                  borderRadius: '20px',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 8px rgba(33, 150, 243, 0.1)'
                                }}
                                className="button-hover"
                              >
                                <span style={{ animation: 'pulse 2s infinite' }}>✏️</span> Edit
                              </button>
                            )}
                            {canDeleteComment(c) && (
                              <button 
                                onClick={() => confirmDeleteComment(c.id)}
                                style={{
                                  background: 'rgba(255, 235, 238, 0.5)',
                                  border: '1px solid rgba(229, 115, 115, 0.3)',
                                  color: '#d32f2f',
                                  cursor: 'pointer',
                                  fontSize: '0.95rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '6px 14px',
                                  borderRadius: '20px',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 8px rgba(211, 47, 47, 0.1)'
                                }}
                                className="button-hover"
                              >
                                <span style={{ animation: 'pulse 2s infinite' }}>🗑️</span> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '35px',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '480px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(33, 150, 243, 0.2)',
            border: '1px solid #bbdefb',
            animation: 'fadeIn 0.4s ease-out, glow 2s infinite',
            background: 'linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%)'
          }}>
            <h3 style={{
              marginTop: 0,
              color: '#1565c0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '1.5rem'
            }}>
              <span style={{ color: '#d32f2f', fontSize: '1.7rem', animation: 'pulse 1.5s infinite' }}>⚠️</span>
              Delete Comment
            </h3>
            <p style={{ 
              fontSize: '1.1rem',
              lineHeight: '1.7',
              color: '#37474f'
            }}>Are you sure you want to delete this comment? This action cannot be undone.</p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '15px',
              marginTop: '30px'
            }}>
              <button 
                onClick={cancelDelete}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  color: '#1565c0',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
                  fontSize: '1rem'
                }}
                className="button-hover"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteComment} 
                style={{ 
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #ef5350 0%, #d32f2f 100%)',
                  color: 'white', 
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                  fontSize: '1rem'
                }}
                className="button-hover"
              >
                <span style={{ animation: 'pulse 1.5s infinite' }}>🗑️</span> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating action buttons */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        zIndex: 90
      }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'rgba(33, 150, 243, 0.8)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
            fontSize: '1.2rem',
            transition: 'all 0.3s ease',
            animation: 'fadeIn 0.5s ease-out, float 3s infinite ease-in-out'
          }}
          className="button-hover"
        >
          ↑
        </button>
      </div>

      {/* Background particles */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            style={{
              position: 'absolute',
              width: `${10 + Math.random() * 20}px`,
              height: `${10 + Math.random() * 20}px`,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float-slow ${10 + Math.random() * 15}s infinite ease-in-out`
            }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <div 
            key={i + 10}
            style={{
              position: 'absolute',
              width: `${15 + Math.random() * 25}px`,
              height: `${15 + Math.random() * 25}px`,
              borderRadius: '50%',
              backgroundColor: 'rgba(144, 202, 249, 0.2)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float-slow ${12 + Math.random() * 18}s infinite ease-in-out`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PostDetail;