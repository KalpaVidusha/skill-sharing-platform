import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import ProgressForm from './ProgressForm';
import ProgressFeed from './ProgressFeed';

const ProgressPage = () => {
  const [refreshFeed, setRefreshFeed] = useState(false);
  const [activeTab, setActiveTab] = useState('global');
  const currentUserId = localStorage.getItem('userId');

  // Callback when form submits successfully
  const handleProgressSubmitted = () => {
    setRefreshFeed(prev => !prev); // Toggle to trigger re-fetch
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Learning Progress
          </h1>
          <div className="border-b border-gray-200 mb-6"></div>
          
          <ProgressForm onSubmitSuccess={handleProgressSubmitted} />
        </div>
        
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('global')}
                className={`${
                  activeTab === 'global'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Global Feed
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`${
                  activeTab === 'personal'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                My Updates
              </button>
            </nav>
          </div>

          {activeTab === 'global' && (
            <div className="py-4">
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Learning Updates
                </h2>
                <ProgressFeed key={`global-${refreshFeed}`} />
              </div>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="py-4">
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  My Learning Journey
                </h2>
                <ProgressFeed key={`personal-${refreshFeed}`} userId={currentUserId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage; 