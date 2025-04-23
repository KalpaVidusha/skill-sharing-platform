import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const ProgressFeed = ({ userId, limit }) => {
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const currentUserId = localStorage.getItem('userId');

  // Fetch progress updates
  const fetchProgress = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllProgress(userId);
      
      // If limit is provided, only show that many updates
      const limitedData = limit ? data.slice(0, limit) : data;
      setProgressUpdates(limitedData);
    } catch (error) {
      setError('Could not load progress updates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, limit]);

  // Format template content into readable text
  const formatProgressContent = (progress) => {
    if (!progress?.templateType || !progress?.content) return '';
    
    let text = '';
    
    switch (progress.templateType) {
      case 'completed_tutorial':
        text = `✅ I completed ${progress.content.tutorialName || 'a tutorial'} today!`;
        break;
      case 'new_skill':
        text = `🎯 Today I learned about ${progress.content.skillName || 'a new skill'}`;
        break;
      case 'learning_goal':
        text = `📅 I aim to finish ${progress.content.goalName || 'my goal'} by ${progress.content.targetDate || 'the deadline'}`;
        break;
      default:
        // Try to create a generic representation of the content
        if (progress.content && typeof progress.content === 'object') {
          text = Object.entries(progress.content)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        } else {
          text = 'Progress update';
        }
    }
    
    return text;
  };

  // Handle progress deletion
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteProgress(deleteId);
      setProgressUpdates(progressUpdates.filter(p => p.id !== deleteId));
      setShowConfirm(false);
    } catch (error) {
      setError('Could not delete progress update');
      console.error(error);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setShowConfirm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (progressUpdates.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
        No progress updates yet.
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {progressUpdates.map((progress) => (
          <div key={progress.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium mr-2">
                  {progress.user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <Link 
                    to={`/profile/${progress.user?.id}`}
                    className="font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {progress.user?.username || 'User'}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {progress.createdAt ? formatDistanceToNow(new Date(progress.createdAt), { addSuffix: true }) : 'Recently'}
                  </p>
                </div>
              </div>
              
              {/* Show delete button only for current user's posts */}
              {currentUserId === progress.user?.id && (
                <button
                  onClick={() => confirmDelete(progress.id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="px-4 py-3">
              <p className="text-gray-800">{formatProgressContent(progress)}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Delete confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={cancelDelete}></div>

            {/* This element is to trick the browser into centering the modal contents */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal content */}
            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Progress Update</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this progress update? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressFeed; 