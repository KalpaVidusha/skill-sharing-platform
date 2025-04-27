import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import NotificationItem from './NotificationItem';
import apiService from '../../services/api';
import Navbar from '../../components/Navbar';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use useCallback to memoize the fetch function
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      // Add timestamp to prevent caching
      const data = await apiService.getNotifications();
      console.log('Fetched notifications:', data); // Debug log
      
      // Ensure isRead is properly parsed as a boolean
      const processedData = data.map(notification => ({
        ...notification,
        isRead: notification.isRead === true || notification.isRead === "true"
      }));
      
      console.log('Processed notifications:', processedData); // Debug log
      setNotifications(processedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Add visibility change listener to refresh data when user returns to the page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also set up a polling interval to keep data fresh
    const interval = setInterval(fetchNotifications, 10000); // Refresh every 10 seconds

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      // After marking as read, update the local state immediately
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Refresh to get the latest data but don't do it immediately to avoid race condition
      setTimeout(() => {
        fetchNotifications();
      }, 300);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Refresh to get the latest data but don't do it immediately to avoid race condition
      setTimeout(() => {
        fetchNotifications();
      }, 300);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Notifications</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1.5">
              <div className="flex items-center">
                <span className="h-2 w-2 bg-blue-600 rounded-full mr-2"></span>
                <span>{notifications.filter(n => !n.isRead).length} unread</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center">
                <span className="h-2 w-2 bg-gray-300 rounded-full mr-2"></span>
                <span>{notifications.filter(n => n.isRead).length} read</span>
              </div>
            </div>
          </div>
          
          {notifications.some(n => !n.isRead) && (
            <button 
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 
                        transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2 text-sm font-medium"
              onClick={handleMarkAllAsRead}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Mark all as read
            </button>
          )}
        </div>
  
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading notifications</p>
            <p className="text-gray-400 text-sm mt-1">This won't take long</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Unable to load notifications</h3>
                  <div className="mt-1 text-sm text-red-700">
                    {error}
                  </div>
                  <div className="mt-3">
                    <button 
                      onClick={() => window.location.reload()} 
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="mt-2 text-xl font-medium text-gray-900">No notifications yet</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto mb-6">
              We'll notify you when there's something new or when someone interacts with your content.
            </p>
            <Link
              to="/posts" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Browse posts
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-700">Recent notifications</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </ul>
              {notifications.length > 5 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Showing {notifications.length} notifications</span>
                  <button
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1"
                    onClick={handleMarkAllAsRead}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage; 