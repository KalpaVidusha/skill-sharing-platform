import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import apiService from '../../services/api';
import { formatDistanceToNow, format, parse, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { FaEdit, FaTrash, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaSyncAlt, FaSort } from 'react-icons/fa';

const ProgressFeed = ({ userId, limit, sortOrder: externalSortOrder, hideFilters }) => {
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingProgress, setEditingProgress] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const currentUserId = localStorage.getItem('userId');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  
  // Sorting state - use external value if provided
  const [sortOrder, setSortOrder] = useState(externalSortOrder || 'newest');

  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarRef = useRef(null);
  const [calendarPosition, setCalendarPosition] = useState({ left: 0, top: 0 });

  // Update internal sort order when external changes
  useEffect(() => {
    if (externalSortOrder) {
      setSortOrder(externalSortOrder);
    }
  }, [externalSortOrder]);

  useEffect(() => {
    // Close calendar when clicking outside
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Update calendar position when it's shown
    if (showCalendar) {
      const targetDateElement = document.getElementById('targetDate');
      if (targetDateElement) {
        const rect = targetDateElement.getBoundingClientRect();
        setCalendarPosition({
          left: rect.left,
          top: rect.bottom + 5
        });
      }
    }
  }, [showCalendar]);

  // Fetch progress updates
  const fetchProgress = async () => {
    try {
      setLoading(true);
      
      // Check for authentication if this is a user-specific feed
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const token = localStorage.getItem('token');
      
      if (userId && (!isLoggedIn || !token)) {
        // User is requesting their own feed but is not logged in
        setError('Please login to view your personal progress updates');
        setLoading(false);
        return;
      }
      
      try {
        const data = await apiService.getAllProgress(userId);
        // Sort the data based on current sort order
        const sortedData = sortProgressByDate(data, sortOrder);
        // If limit is provided, only show that many updates
        const limitedData = limit ? sortedData.slice(0, limit) : sortedData;
        setProgressUpdates(limitedData);
        
        // Reset to page 1 when data changes significantly
        setCurrentPage(1);
      } catch (error) {
        console.error('Error fetching progress:', error);
        // Only show "Could not load progress updates" for user feeds
        // For global feeds with a 401 error, show a more specific message
        if (userId) {
          setError('Could not load progress updates');
        } else if (error.status === 401) {
          setError('Login to see progress updates');
        } else {
          setError('Could not load progress updates');
        }
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to sort progress by date
  const sortProgressByDate = (progress, order) => {
    return [...progress].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };
  
  // Function to handle sort order change
  const handleSortOrderChange = (order) => {
    setSortOrder(order);
    setProgressUpdates(sortProgressByDate(progressUpdates, order));
    setCurrentPage(1); // Reset to first page when sort order changes
  };

  useEffect(() => {
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, limit, sortOrder]);

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

  // Generate preview of edited content
  const getEditPreview = () => {
    if (!editingProgress) return '';
    
    let previewText = '';
    
    switch (editingProgress.templateType) {
      case 'completed_tutorial':
        previewText = `✅ I completed ${editFormData.tutorialName || 'a tutorial'} today!`;
        break;
      case 'new_skill':
        previewText = `🎯 Today I learned about ${editFormData.skillName || 'a new skill'}`;
        break;
      case 'learning_goal':
        previewText = `📅 I aim to finish ${editFormData.goalName || 'my goal'} by ${editFormData.targetDate || 'the deadline'}`;
        break;
      default:
        // Try to create a generic representation of the content
        if (editFormData && typeof editFormData === 'object') {
          previewText = Object.entries(editFormData)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        } else {
          previewText = 'Progress update';
        }
    }
    
    return previewText;
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

  // Handle edit functions
  const startEdit = (progress) => {
    setEditingProgress(progress);
    
    // Initialize form data based on the progress type
    if (progress.templateType === 'completed_tutorial') {
      setEditFormData({
        tutorialName: progress.content.tutorialName || ''
      });
    } else if (progress.templateType === 'new_skill') {
      setEditFormData({
        skillName: progress.content.skillName || ''
      });
    } else if (progress.templateType === 'learning_goal') {
      setEditFormData({
        goalName: progress.content.goalName || '',
        targetDate: progress.content.targetDate || ''
      });
    } else if (progress.content && typeof progress.content === 'object') {
      setEditFormData({...progress.content});
    }
  };

  const cancelEdit = () => {
    setEditingProgress(null);
    setEditFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!editingProgress) return;
      
      // Create updated progress with new content
      const updatedProgress = {
        ...editingProgress,
        content: editFormData
      };
      
      await apiService.updateProgress(editingProgress.id, updatedProgress);
      
      // Update the progress in the local state
      setProgressUpdates(prevUpdates => {
        return prevUpdates.map(p => {
          if (p.id === editingProgress.id) {
            return {
              ...p,
              content: editFormData
            };
          }
          return p;
        });
      });
      
      // Clear edit state
      setEditingProgress(null);
      setEditFormData({});
    } catch (error) {
      setError('Could not update progress');
      console.error(error);
    }
  };

  // Handle date selection
  const handleDateChange = (day) => {
    setSelectedDate(day);
    const formattedDate = format(day, 'yyyy-MM-dd');
    setEditFormData(prev => ({
      ...prev,
      targetDate: formattedDate
    }));
    setShowCalendar(false);
  };

  // Handle month navigation
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Generate calendar days
  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'eeee';
    const days = [];

    let day = startDate;
    const weekDays = [];

    // Create week day headers
    for (let i = 0; i < 7; i++) {
      weekDays.push(
        <div key={i} className="px-1 py-1 text-center font-medium text-xs text-gray-500">
          {format(day, 'EEEEEE')}
        </div>
      );
      day = addDays(day, 1);
    }

    days.push(
      <div key="header" className="grid grid-cols-7 mb-1">
        {weekDays}
      </div>
    );

    // Reset to start date
    day = startDate;
    const rows = [];

    // Create calendar rows and days
    while (day <= endDate) {
      let formattedDate = format(day, 'd');
      const cloneDay = day;
      const isToday = isSameDay(day, new Date());
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isCurrentMonth = isSameMonth(day, monthStart);

      rows.push(
        <div
          key={day.toString()}
          className={`
            px-1 py-1 text-center text-sm rounded cursor-pointer
            ${isToday ? 'border border-blue-400' : ''}
            ${isSelected ? 'bg-indigo-600 text-white' : ''}
            ${!isCurrentMonth ? 'text-gray-300' : isToday ? 'text-blue-600' : 'text-gray-700'}
            hover:bg-indigo-100
          `}
          onClick={() => handleDateChange(cloneDay)}
        >
          {formattedDate}
        </div>
      );

      day = addDays(day, 1);
    }

    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < rows.length; i += 7) {
      weeks.push(
        <div key={i} className="grid grid-cols-7 mb-1">
          {rows.slice(i, i + 7)}
        </div>
      );
    }

    return (
      <div className="calendar">
        {days}
        {weeks}
      </div>
    );
  };

  // Render edit form separately
  const renderEditForm = () => {
    if (!editingProgress) return null;
    
    return (
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={cancelEdit}></div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          {/* Modal content */}
          <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Edit Progress Update
              </h3>
              
              <form onSubmit={handleEditSubmit}>
                {editingProgress.templateType === 'completed_tutorial' && (
                  <div className="mb-4">
                    <label htmlFor="tutorialName" className="block text-sm font-medium text-gray-700 mb-1">
                      Tutorial Name
                    </label>
                    <input
                      type="text"
                      id="tutorialName"
                      name="tutorialName"
                      value={editFormData.tutorialName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                )}
                
                {editingProgress.templateType === 'new_skill' && (
                  <div className="mb-4">
                    <label htmlFor="skillName" className="block text-sm font-medium text-gray-700 mb-1">
                      Skill Name
                    </label>
                    <input
                      type="text"
                      id="skillName"
                      name="skillName"
                      value={editFormData.skillName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                )}
                
                {editingProgress.templateType === 'learning_goal' && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="goalName" className="block text-sm font-medium text-gray-700 mb-1">
                        Goal Name
                      </label>
                      <input
                        type="text"
                        id="goalName"
                        name="goalName"
                        value={editFormData.goalName || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Target Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <FaCalendarAlt className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="targetDate"
                          name="targetDate"
                          value={editFormData.targetDate || ''}
                          readOnly
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                          placeholder="YYYY-MM-DD"
                          required
                          onClick={() => setShowCalendar(!showCalendar)}
                        />
                        
                        {/* Render the calendar using a portal */}
                        {showCalendar && createPortal(
                          <div
                            ref={calendarRef}
                            className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2"
                            style={{ 
                              width: '240px',
                              maxHeight: '300px',
                              left: `${calendarPosition.left}px`,
                              top: `${calendarPosition.top}px`
                            }}
                          >
                            {/* Calendar header */}
                            <div className="flex justify-between items-center mb-2">
                              <button 
                                type="button" 
                                onClick={prevMonth}
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                <FaChevronLeft />
                              </button>
                              <div className="font-semibold text-center">
                                {format(currentMonth, 'MMMM yyyy')}
                              </div>
                              <button 
                                type="button" 
                                onClick={nextMonth}
                                className="p-1 rounded hover:bg-gray-100"
                              >
                                <FaChevronRight />
                              </button>
                            </div>
                            
                            {/* Calendar days */}
                            {renderCalendarDays()}
                          </div>,
                          document.body
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">Click to open the date picker</div>
                    </div>
                  </>
                )}
                
                {!['completed_tutorial', 'new_skill', 'learning_goal'].includes(editingProgress.templateType) && 
                  Object.keys(editFormData).map(key => (
                    <div key={key} className="mb-4">
                      <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        id={key}
                        name={key}
                        value={editFormData[key] || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  ))
                }
                
                {/* Preview Section */}
                <div className="mt-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                  <p className="text-gray-800">{getEditPreview()}</p>
                  
                  {/* Special display for target date in learning goals */}
                  {editingProgress.templateType === 'learning_goal' && editFormData.targetDate && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-1" />
                      <span>Target date: {editFormData.targetDate}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get current progress items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProgressItems = !limit ? progressUpdates.slice(indexOfFirstItem, indexOfLastItem) : progressUpdates;
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < Math.ceil(progressUpdates.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
      {/* Sorting Controls - Only show if not using limit param and hideFilters is not true */}
      {!limit && !hideFilters && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Sort by:</span>
              <select 
                value={sortOrder}
                onChange={(e) => handleSortOrderChange(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <button
              onClick={fetchProgress}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <FaSyncAlt className="mr-1" /> Refresh
            </button>
          </div>
          {!limit && progressUpdates.length > 0 && (
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, progressUpdates.length)} of {progressUpdates.length}
            </div>
          )}
        </div>
      )}
      
      {/* Display counter when hideFilters is true (parent component controls filters) */}
      {!limit && hideFilters && progressUpdates.length > 0 && (
        <div className="flex justify-end mb-4">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, progressUpdates.length)} of {progressUpdates.length}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {currentProgressItems.map((progress) => (
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
              
              {/* Show edit/delete buttons only for current user's posts */}
              {currentUserId === progress.user?.id && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(progress)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                  >
                    <FaEdit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => confirmDelete(progress.id)}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                  >
                    <FaTrash className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="px-4 py-3">
              <p className="text-gray-800">{formatProgressContent(progress)}</p>
              
              {/* Display target date separately for learning goals */}
              {progress.templateType === 'learning_goal' && progress.content.targetDate && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <FaCalendarAlt className="mr-1" />
                  <span>Target date: {progress.content.targetDate}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination Controls - Only show if not using limit param and if needed */}
      {!limit && progressUpdates.length > itemsPerPage && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center justify-center">
            <button 
              onClick={prevPage} 
              disabled={currentPage === 1}
              className={`mx-1 px-3 py-1 rounded flex items-center ${
                currentPage === 1 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <FaChevronLeft className="mr-1" /> Previous
            </button>
            
            {/* Page number buttons */}
            {[...Array(Math.ceil(progressUpdates.length / itemsPerPage)).keys()].map(number => (
              <button
                key={number + 1}
                onClick={() => paginate(number + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === number + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {number + 1}
              </button>
            ))}
            
            <button 
              onClick={nextPage} 
              disabled={currentPage === Math.ceil(progressUpdates.length / itemsPerPage)}
              className={`mx-1 px-3 py-1 rounded flex items-center ${
                currentPage === Math.ceil(progressUpdates.length / itemsPerPage)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Next <FaChevronRight className="ml-1" />
            </button>
          </nav>
        </div>
      )}
      
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
      
      {/* Edit modal */}
      {editingProgress && renderEditForm()}
    </div>
  );
};

export default ProgressFeed;