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
        className="relative p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Notifications"
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div 
          ref={dropdownRef} 
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-medium text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </ul>
            ) : (
              <div className="py-12 px-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <FaBell className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No new notifications</p>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
            <Link 
              to="/notifications" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200 inline-flex items-center"
            >
              View all notifications
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 