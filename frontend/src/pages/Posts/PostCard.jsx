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
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: isHovered
        ? '0 10px 20px rgba(0, 0, 0, 0.12)'
        : '0 4px 15px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      transform: isHovered ? 'translateY(-5px)' : 'none'
    },
    imageContainer: {
      position: 'relative',
      height: '200px',
      overflow: 'hidden'
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    content: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '10px',
      lineHeight: 1.3
    },
    description: {
      color: '#666',
      marginBottom: '15px',
      flexGrow: 1
    },
    iconRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginTop: 'auto',
      fontSize: '14px',
      fontWeight: '500',
      color: '#444'
    },
    likeButton: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: likedByCurrentUser ? '#e91e63' : '#555'
    },
    viewButton: {
      display: 'inline-block',
      padding: '8px 16px',
      backgroundColor: '#4CAF50',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '4px',
      marginTop: '10px',
      textAlign: 'center'
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

        <div style={{ marginBottom: '15px' }}>
          <span style={{ fontWeight: '500' }}>Tutor: </span>
          <span>{instructor}</span>
        </div>

        <div style={styles.iconRow}>
          <button onClick={toggleLike} style={styles.likeButton}>
            {likedByCurrentUser ? <FaHeart /> : <FaRegHeart />} {likeCount}
          </button>
          <span><FaComment /> {commentCount}</span>
        </div>

        <Link to={`/posts/${post.id}`} style={styles.viewButton}>
          View Course
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
