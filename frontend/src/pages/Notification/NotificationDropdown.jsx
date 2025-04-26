import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import NotificationItem from './NotificationItem';
import apiService from '../../services/api';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Use useCallback to memoize the fetch function
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiService.getUnreadNotifications();
      console.log('Fetched dropdown notifications:', data); // Debug log
      setNotifications(data);
      setUnreadCount(data.length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Add an effect to refresh when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    // Add click outside event listener
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      // Call the API to mark as read
      await apiService.markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => 
          notification.id !== notificationId
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      // Refresh to ensure we have the latest data
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications([]);
      setUnreadCount(0);
      // Refresh to ensure we have the latest data
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <div className="relative">
      <button 
        className="relative p-2 text-gray-700 hover:text-indigo-700 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No new notifications
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 text-center">
            <Link 
              to="/notifications" 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 