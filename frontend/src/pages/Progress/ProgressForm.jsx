import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import { formatDistanceToNow, format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parse } from 'date-fns';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ProgressForm = ({ onSubmitSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [fieldValues, setFieldValues] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarRef = useRef(null);

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

  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templatesData = await apiService.getProgressTemplates();
        setTemplates(templatesData);
        
        // Set default template
        if (Object.keys(templatesData).length > 0) {
          const firstTemplate = Object.keys(templatesData)[0];
          setSelectedTemplate(firstTemplate);
          
          // Initialize field values
          const fields = templatesData[firstTemplate].fields || [];
          const initialValues = {};
          fields.forEach(field => {
            initialValues[field] = '';
          });
          setFieldValues(initialValues);
        }
      } catch (error) {
        setError('Could not fetch progress templates');
        console.error(error);
      }
    };

    fetchTemplates();
  }, []);

  // Handle template change
  const handleTemplateChange = (e) => {
    const templateType = e.target.value;
    setSelectedTemplate(templateType);
    
    // Reset field values for new template
    if (templates[templateType]) {
      const fields = templates[templateType].fields || [];
      const newValues = {};
      fields.forEach(field => {
        newValues[field] = '';
      });
      setFieldValues(newValues);
    }
  };

  // Handle date selection
  const handleDateChange = (day) => {
    setSelectedDate(day);
    const formattedDate = format(day, 'yyyy-MM-dd');
    handleInputChange('targetDate', formattedDate);
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

  // Handle input change
  const handleInputChange = (field, value) => {
    setFieldValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Preview the formatted progress update
  const getPreview = () => {
    if (!selectedTemplate || !templates[selectedTemplate]) return '';
    
    let format = templates[selectedTemplate].format;
    
    // Replace placeholders with values
    Object.keys(fieldValues).forEach(field => {
      const placeholder = `{${field}}`;
      format = format.replace(placeholder, fieldValues[field] || placeholder);
    });
    
    return format;
  };

  // Submit progress update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      setError('You must be logged in to share your progress');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Prepare data for API
      const progressData = {
        templateType: selectedTemplate,
        content: fieldValues
      };
      
      await apiService.createProgress(progressData);
      
      // Clear form
      const fields = templates[selectedTemplate].fields || [];
      const newValues = {};
      fields.forEach(field => {
        newValues[field] = '';
      });
      setFieldValues(newValues);
      
      setSuccess(true);
      
      // Notify parent component
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setError('Could not create your progress update');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Render custom input field based on field type
  const renderField = (field) => {
    // Check if this is a targetDate field in a learning_goal template
    if (field === 'targetDate' && selectedTemplate === 'learning_goal') {
      return (
        <div key={field}>
          <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="text-gray-400" />
            </div>
            <input
              id={field}
              type="text"
              value={fieldValues[field] || ''}
              readOnly
              placeholder="YYYY-MM-DD"
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
              required
              onClick={() => setShowCalendar(!showCalendar)}
            />
            
            {/* Custom Calendar */}
            {showCalendar && (
              <div
                ref={calendarRef}
                className="absolute z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2"
                style={{ width: '240px' }}
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
              </div>
            )}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Click to open the date picker
          </div>
        </div>
      );
    }
    
    // Default text input for other fields
    return (
      <div key={field}>
        <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
          {field.charAt(0).toUpperCase() + field.slice(1)}
        </label>
        <input
          id={field}
          type="text"
          value={fieldValues[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
    );
  };

  // If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-lg w-full mb-4 p-6">
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Sign in to share your progress
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Join our community to track and share your learning journey
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg w-full mb-4">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Share Your Learning Progress
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            Your learning progress has been shared successfully!
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-1">
                Progress Type
              </label>
              <select 
                id="template-select"
                value={selectedTemplate} 
                onChange={handleTemplateChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="" disabled>Select a template</option>
                {Object.keys(templates).map((key) => (
                  <option key={key} value={key}>
                    {templates[key].title}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedTemplate && templates[selectedTemplate]?.fields?.map((field) => renderField(field))}
            
            {selectedTemplate && (
              <div className="w-full p-3 bg-gray-50 rounded-md">
                <p className="font-medium mb-1">Preview:</p>
                <p>{getPreview()}</p>
              </div>
            )}
            
            <button 
              type="submit" 
              className={`px-4 py-2 rounded-md text-white font-medium ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              disabled={loading || !selectedTemplate}
            >
              {loading ? 'Posting...' : 'Post Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgressForm; 