import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);

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
    bookmark: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
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
      marginBottom: '20px',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      fontSize: '14px',
      lineHeight: 1.5
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 'auto'
    },
    iconRow: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    actionButton: {
      padding: '6px 16px',
      fontSize: '13px',
      fontWeight: '500',
      borderRadius: '20px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    viewButton: {
      backgroundColor: isHovered ? '#0d8aee' : '#2196f3',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '30px',
      textDecoration: 'none',
      fontWeight: '500',
      textAlign: 'center',
      transition: 'background-color 0.2s ease',
      marginTop: '15px',
      border: 'none',
      cursor: 'pointer'
    }
  };

  const hasImage = post.mediaUrls?.length > 0;
  const defaultImageUrl = 'https://via.placeholder.com/400x200?text=Skill+Post';
  const tutor = post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Instructor Name';

  const getBadgeStyle = () => {
    const category = post.category?.toLowerCase() || '';
    const style = {
      display: 'inline-block',
      padding: '5px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500'
    };

    switch (category) {
      case 'programming':
        return { ...style, backgroundColor: '#e3f9e5', color: '#00875a' };
      case 'design':
        return { ...style, backgroundColor: '#ffebe6', color: '#ff5630' };
      case 'business':
        return { ...style, backgroundColor: '#ebe6ff', color: '#6554c0' };
      default:
        return { ...style, backgroundColor: '#f0f5ff', color: '#2684ff' };
    }
  };

  const handleLikeToggle = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? Math.max(prev - 1, 0) : prev + 1));
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
        <div style={styles.bookmark}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"></path>
          </svg>
        </div>
      </div>

      <div style={styles.content}>
        <h3 style={styles.title}>{post.title}</h3>
        <p style={styles.description}>{post.description}</p>

        <div style={{ marginBottom: '15px' }}>
          <span style={{ fontWeight: '500' }}>Tutor: </span>
          <span>{tutor}</span>
        </div>

        <div style={styles.iconRow}>
          <button
            onClick={handleLikeToggle}
            style={{
              ...styles.actionButton,
              backgroundColor: liked ? '#1976d2' : '#e0e0e0',
              color: liked ? 'white' : '#333'
            }}
          >
            {liked ? 'Liked' : 'Like'} ({likeCount})
          </button>

          <button
            onClick={() => navigate(`/posts/${post.id}#comments`)}
            style={{
              ...styles.actionButton,
              backgroundColor: '#f1f1f1',
              color: '#333'
            }}
          >
            Comment ({post.commentCount || 0})
          </button>
        </div>

        <Link to={`/posts/${post.id}`} style={styles.viewButton}>
          View Course
        </Link>
      </div>
    </div>
  );
};

export default PostCard;