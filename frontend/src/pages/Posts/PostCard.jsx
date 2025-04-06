// src/pages/Posts/PostCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  const styles = {
    card: `
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    `,
    cardHover: `
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
    `,
    imageContainer: `
      position: relative;
      height: 200px;
      overflow: hidden;
    `,
    image: `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `,
    bookmark: `
      position: absolute;
      top: 15px;
      right: 15px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    `,
    content: `
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    `,
    title: `
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
      line-height: 1.3;
    `,
    description: `
      color: #666;
      margin-bottom: 20px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      font-size: 14px;
      line-height: 1.5;
    `,
    footer: `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    `,
    label: `
      background-color: #f0f5ff;
      color: #2684ff;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    `,
    viewButton: `
      background-color: #2196f3;
      color: white;
      padding: 10px 20px;
      border-radius: 30px;
      text-decoration: none;
      font-weight: 500;
      text-align: center;
      transition: background-color 0.2s ease;
      display: block;
     // width: 100%;
      margin-top: 15px;
      border: none;
      cursor: pointer;
    `,
    viewButtonHover: `
      background-color: #0d8aee;
    `,
    levelInfo: `
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      font-size: 12px;
      color: #666;
    `,
    levelLabel: `
      font-weight: 500;
    `,
    levelValue: `
      color: #888;
    `
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const hasImage = post.mediaUrls?.length > 0;
  const defaultImageUrl = 'https://via.placeholder.com/400x200?text=Skill+Post';
  
  // Generate random instructor name and level if not provided
  const instructor = post.instructor || 'Instructor Name';
  const level = post.level || (Math.random() > 0.5 ? 'Beginner' : 'Associate');
  
  // Determine card border color based on a property or generate one
  const getBadgeStyle = () => {
    let backgroundColor = '#f0f5ff';
    let textColor = '#2684ff';
    
    switch(post.category?.toLowerCase()) {
      case 'programming':
        backgroundColor = '#e3f9e5';
        textColor = '#00875a';
        break;
      case 'design':
        backgroundColor = '#ffebe6';
        textColor = '#ff5630';
        break;
      case 'business':
        backgroundColor = '#ebe6ff';
        textColor = '#6554c0';
        break;
      default:
        // Keep default colors
    }
    
    return {
      background: backgroundColor,
      color: textColor
    };
  };

  return (
    <div 
      style={{ cssText: `${styles.card} ${isHovered ? styles.cardHover : ''}` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ cssText: styles.imageContainer }}>
        <img 
          src={hasImage ? post.mediaUrls[0] : defaultImageUrl} 
          alt={post.title}
          style={{ cssText: styles.image }}
        />
        <div style={{ cssText: styles.bookmark }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"></path>
          </svg>
        </div>
      </div>
      
      <div style={{ cssText: styles.content }}>
        <h3 style={{ cssText: styles.title }}>{post.title}</h3>
        <p style={{ cssText: styles.description }}>{post.description}</p>
        
        <div style={{ cssText: styles.levelInfo }}>
          <div>
            <span style={{ cssText: styles.levelLabel }}>Tutor: </span>
            <span>{instructor}</span>
          </div>
          <div>
            <span style={{ cssText: styles.levelLabel }}>Level: </span>
            <span>{level}</span>
          </div>
        </div>
        
        <div style={{ cssText: styles.footer }}>
          <span style={{ cssText: styles.label, ...getBadgeStyle() }}>
            {post.category || 'Miscellaneous'}
          </span>
        </div>
        
        <Link 
          to={`/posts/${post.id}`}
          style={{ cssText: `${styles.viewButton} ${isHovered ? styles.viewButtonHover : ''}` }}
        >
          View Course
        </Link>
      </div>
    </div>
  );
};

export default PostCard;