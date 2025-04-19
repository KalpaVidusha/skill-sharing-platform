import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaComment, FaHeart, FaRegHeart } from 'react-icons/fa';

const PostCard = ({ post }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(false);

  const hasImage = post.mediaUrls && post.mediaUrls.length > 0;
  const defaultImageUrl = 'https://via.placeholder.com/400x200?text=No+Image';
  const instructor = post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Unknown';

  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/comments/post/${post.id}`, {
          credentials: 'include'
        });
        const data = await res.json();
        setCommentCount(data.length);
      } catch (err) {
        console.error('Failed to fetch comment count:', err);
      }
    };

    const fetchLikeStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/users/current`, {
          credentials: 'include'
        });
        if (res.ok) {
          const user = await res.json();
          setLikedByCurrentUser(post.likedUserIds?.includes(user.id));
        }
      } catch (err) {
        console.error('Failed to check like status:', err);
      }
    };

    if (post?.id) {
      fetchCommentCount();
      fetchLikeStatus();
    }
  }, [post]);

  const toggleLike = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/posts/${post.id}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        const result = await res.json();
        setLikeCount(result.likeCount);
        setLikedByCurrentUser(result.likedByCurrentUser);
      } else if (res.status === 401) {
        window.location.href = `/login?redirect=/posts/${post.id}`;
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const styles = {
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: isHovered
        ? '0 12px 24px rgba(0, 102, 204, 0.15)'
        : '0 6px 18px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      transform: isHovered ? 'translateY(-8px)' : 'none',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #e0eaff'
    },
    imageContainer: {
      height: '200px',
      overflow: 'hidden'
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s ease',
      transform: isHovered ? 'scale(1.03)' : 'scale(1)'
    },
    content: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1
    },
    title: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#1e3a8a',
      marginBottom: '10px'
    },
    description: {
      fontSize: '14px',
      color: '#555',
      flexGrow: 1,
      marginBottom: '10px'
    },
    tutor: {
      marginBottom: '8px',
      color: '#0369a1',
      fontSize: '13px'
    },
    iconRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginTop: '10px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#3b82f6'
    },
    likeButton: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: likedByCurrentUser ? '#ef4444' : '#64748b',
      transition: 'color 0.2s ease',
      fontSize: '14px'
    },
    commentContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      color: '#64748b'
    },
    viewButton: {
      display: 'inline-block',
      padding: '10px 20px',
      backgroundColor: '#3b82f6',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '8px',
      marginTop: '15px',
      textAlign: 'center',
      fontWeight: '500',
      transition: 'background-color 0.3s ease',
      boxShadow: '0 4px 10px rgba(0, 102, 204, 0.15)'
    }
  };

  return (
    <div
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.imageContainer}>
        <img
          src={hasImage ? post.mediaUrls[0] : defaultImageUrl}
          alt={post.title}
          style={styles.image}
        />
      </div>

      <div style={styles.content}>
        <h3 style={styles.title}>{post.title}</h3>
        <p style={styles.description}>{post.description}</p>
        <div style={styles.tutor}><strong>Instructor:</strong> {instructor}</div>

        <div style={styles.iconRow}>
          <button onClick={toggleLike} style={styles.likeButton}>
            {likedByCurrentUser ? <FaHeart /> : <FaRegHeart />} {likeCount}
          </button>
          <div style={styles.commentContainer}>
            <FaComment style={{display: 'inline', marginRight: '4px', verticalAlign: 'middle'}} />
            <span style={{display: 'inline', verticalAlign: 'middle'}}>{commentCount}</span>
          </div>
        </div>

        <Link to={`/posts/${post.id}`} style={styles.viewButton}>
          View Course
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
