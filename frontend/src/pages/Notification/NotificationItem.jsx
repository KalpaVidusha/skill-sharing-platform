import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FaCheck } from 'react-icons/fa';
import apiService from '../../services/api';

// Helper function to check for valid date
function isValidDate(date) {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();
  // Parse isRead properly to ensure it's treated as a boolean
  const isRead = notification.isRead === true || notification.isRead === "true";

  const handleMarkAsRead = async (e) => {
    e.stopPropagation(); // Prevent triggering the parent click event
    try {
      await apiService.markNotificationAsRead(notification.id);
      onMarkAsRead(notification.id);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleNotificationClick = async () => {
    // Mark as read when clicked
    if (!isRead) {
      try {
        await apiService.markNotificationAsRead(notification.id);
        onMarkAsRead(notification.id);
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    // Navigate based on the notification type and destination
    if (notification.postId) {
      // Check if this is a post or progress notification
      if (notification.type === 'LIKE' || notification.type === 'COMMENT') {
        // For progress notifications, we need to navigate to the user dashboard
        // If the notification's content contains "progress", it's likely about a progress update
        if (notification.content.toLowerCase().includes('progress')) {
          navigate(`/user-dashboard`);
          // After navigation, we want to switch to the progress tab
          setTimeout(() => {
            const progressTabElement = document.querySelector('[data-tab="progress"]');
            if (progressTabElement) {
              progressTabElement.click();
            }
          }, 500);
        } else {
          // For post-related notifications
          navigate(`/posts/${notification.postId}`);
        }
      } else {
        // Default case - navigate to post
        navigate(`/posts/${notification.postId}`);
      }
    }
  };

  return (
    <div 
      className={`p-4 border-b border-gray-200 transition-colors duration-200 ${
        isRead ? 'bg-white' : 'bg-blue-50'
      } cursor-pointer hover:bg-gray-50`}
      onClick={handleNotificationClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-800">
            {notification.content}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isValidDate(notification.createdAt)
              ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
              : "Invalid date"}
          </p>
        </div>
        {!isRead && (
          <button
            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-100 transition-colors duration-200 flex items-center"
            onClick={handleMarkAsRead}
          >
            <FaCheck className="mr-1" /> Mark as read
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem; 