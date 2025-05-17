import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProgressForm from './ProgressForm';
import ProgressFeed from './ProgressFeed';
import { FaSyncAlt, FaTimesCircle, FaShareAlt } from 'react-icons/fa';

const ProgressAll = () => {
  const [refreshFeed, setRefreshFeed] = useState(false);
  const [activeTab, setActiveTab] = useState('global');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Separate sort orders for each tab
  const [globalSortOrder, setGlobalSortOrder] = useState('newest');
  const [personalSortOrder, setPersonalSortOrder] = useState('newest');
  
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loginStatus && !!token);
    };

    checkAuth();
    
    // Listen for auth changes
    window.addEventListener('authStateChanged', checkAuth);
    
    return () => {
      window.removeEventListener('authStateChanged', checkAuth);
    };
  }, []);

  // Callback when form submits successfully
  const handleProgressSubmitted = () => {
    setRefreshFeed(prev => !prev); // Toggle to trigger re-fetch
    setShowForm(false); // Hide the form after successful submission
  };

  // Handle tab change - resets the view
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset sort order to "newest" when switching tabs
    if (tab === 'global') {
      setGlobalSortOrder('newest');
    } else if (tab === 'personal') {
      setPersonalSortOrder('newest');
    }
    // Trigger a refresh
    setRefreshFeed(prev => !prev);
  };

  // Function to handle sort order change for global feed
  const handleGlobalSortOrderChange = (order) => {
    setGlobalSortOrder(order);
    setRefreshFeed(prev => !prev);
  };
  
  // Function to handle sort order change for personal feed
  const handlePersonalSortOrderChange = (order) => {
    setPersonalSortOrder(order);
    setRefreshFeed(prev => !prev);
  };

  // Function to toggle the form visibility
  const toggleForm = () => {
    setShowForm(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Add Your Learning Progress
            </h1>
            {!showForm ? (
              <button
                onClick={toggleForm}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <FaShareAlt className="mr-2" /> Share
              </button>
            ) : (
              <button 
                onClick={toggleForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimesCircle size={20} />
              </button>
            )}
          </div>
          
          <div 
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showForm ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-b border-gray-200 my-4"></div>
            <div className="transform transition-transform duration-500 ease-in-out">
              <ProgressForm onSubmitSuccess={handleProgressSubmitted} />
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => handleTabChange('global')}
                className={`${
                  activeTab === 'global'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Global Feed
              </button>
              {isLoggedIn && (
                <button
                  onClick={() => handleTabChange('personal')}
                  className={`${
                    activeTab === 'personal'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  My Updates
                </button>
              )}
            </nav>
          </div>

          {activeTab === 'global' && (
            <div className="py-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Recent Learning Updates
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Sort by:</span>
                      <select 
                        value={globalSortOrder}
                        onChange={(e) => handleGlobalSortOrderChange(e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setRefreshFeed(prev => !prev)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <FaSyncAlt className="mr-1" /> Refresh
                    </button>
                  </div>
                </div>
                <ProgressFeed key={`global-${refreshFeed}-${globalSortOrder}`} sortOrder={globalSortOrder} hideFilters={true} />
              </div>
            </div>
          )}

          {activeTab === 'personal' && isLoggedIn && (
            <div className="py-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    My Learning Journey
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Sort by:</span>
                      <select 
                        value={personalSortOrder}
                        onChange={(e) => handlePersonalSortOrderChange(e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setRefreshFeed(prev => !prev)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <FaSyncAlt className="mr-1" /> Refresh
                    </button>
                  </div>
                </div>
                <ProgressFeed key={`personal-${refreshFeed}-${personalSortOrder}`} userId={currentUserId} sortOrder={personalSortOrder} hideFilters={true} />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProgressAll; 