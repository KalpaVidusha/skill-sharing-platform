import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../../services/api';
import { formatDistanceToNow, format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parse } from 'date-fns';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaImage, FaTimesCircle } from 'react-icons/fa';
import { toast } from "react-toastify";

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
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
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
      
      // Clean up object URL when component unmounts
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
      
      // Reset file upload if changing from or to a template that doesn't support images
      if (templateType !== 'completed_tutorial' && templateType !== 'new_skill') {
        handleRemoveFile();
      }
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

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type and size
    const isValidType = file.type.startsWith('image/');
    const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
    
    if (!isValidType) {
      setError("Only image files are allowed");
      return;
    }
    
    if (!isValidSize) {
      setError("Images must be less than 5MB");
      return;
    }
    
    setError(null);
    setUploadedFile(file);
    
    // Create and set preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };
  
  // Remove file
  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  // Preview the formatted progress update
  const getPreview = () => {
    if (!selectedTemplate || !templates[selectedTemplate]) return '';
    
    const format = templates[selectedTemplate].format || '';
    let preview = format;
    
    Object.entries(fieldValues).forEach(([field, value]) => {
      const placeholder = `{${field}}`;
      preview = preview.replace(placeholder, value || 'Not specified');
    });
    
    return preview;
  };

  // Submit the progress update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      setError('Please log in to submit a progress update');
      return;
    }
    
    if (!selectedTemplate) {
      setError('Please select a template type');
      return;
    }
    
    // Validate required fields
    const template = templates[selectedTemplate];
    if (template && template.fields) {
      for (const field of template.fields) {
        if (!fieldValues[field]) {
          setError(`Please fill in all required fields: ${field} is missing`);
          return;
        }
      }
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      let mediaUrl = null;
      
      // Upload image if present
      if (uploadedFile) {
        try {
          const uploadResponse = await apiService.uploadFiles([uploadedFile]);
          if (uploadResponse && uploadResponse.urls && uploadResponse.urls.length > 0) {
            mediaUrl = uploadResponse.urls[0];
          }
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          setError('Failed to upload image. Progress update will be submitted without an image.');
        }
      }
      
      // Prepare progress data
      const progressData = {
        templateType: selectedTemplate,
        content: { ...fieldValues },
        userId: localStorage.getItem('userId'),
        username: localStorage.getItem('username'),
        mediaUrl
      };
      
      // Submit progress update
      await apiService.createProgress(progressData);
      
      // Show success state
      setSuccess(true);
      
      // Reset form
      setFieldValues({});
      if (template && template.fields) {
        const newValues = {};
        template.fields.forEach(field => {
          newValues[field] = '';
        });
        setFieldValues(newValues);
      }
      handleRemoveFile();
      
      // Reset selected date to today (for forms with date fields)
      setSelectedDate(new Date());
      
      // Show toast notification
      toast.success("Progress update shared successfully!");
      
      // Call the success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Error submitting progress update:', error);
      setError('Failed to submit progress update. Please try again.');
      toast.error("Failed to share progress update");
    } finally {
      setLoading(false);
    }
  };

  // Render a field based on type
  const renderField = (field) => {
    // Detect if this is a date field by name
    const isDateField = field.toLowerCase().includes('date');
    
    if (isDateField) {
      return (
        <div key={field} className="mb-4">
          <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
            {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="text-gray-400" />
            </div>
            <input
              type="text"
              id={field}
              value={fieldValues[field] || ''}
              readOnly
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer"
              placeholder="Select a date"
              onClick={() => setShowCalendar(!showCalendar)}
              required
            />
            
            {showCalendar && (
              <div
                ref={calendarRef}
                className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4"
                style={{ 
                  width: '240px'
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
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div key={field} className="mb-4">
        <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
          {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
        </label>
        <input
          type="text"
          id={field}
          name={field}
          value={fieldValues[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
    );
  };

  // Render the progress form
  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Share Your Learning Progress</h2>
      
      {!isLoggedIn ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please <Link to="/login" className="font-medium underline text-yellow-700 hover:text-yellow-600">sign in</Link> to share your progress.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template selection */}
          <div>
            <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
              Progress Type
            </label>
            <select
              id="template"
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select a progress type</option>
              {Object.entries(templates).map(([key, template]) => (
                <option key={key} value={key}>
                  {template.name || key}
                </option>
              ))}
            </select>
          </div>
          
          {/* Dynamic fields based on selected template */}
          {selectedTemplate && templates[selectedTemplate]?.fields?.map(renderField)}
          
          {/* Media upload option for completed tutorials and new skills */}
          {selectedTemplate && ['completed_tutorial', 'new_skill'].includes(selectedTemplate) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add a Photo (optional)
              </label>
              
              {/* Show preview of uploaded file */}
              {previewUrl && (
                <div className="mb-2 relative">
                  <img 
                    src={previewUrl}
                    alt="Preview" 
                    className="max-h-40 rounded-lg border border-gray-300 mx-auto"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800 bg-white rounded-full p-1 hover:bg-red-100"
                  >
                    <FaTimesCircle className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              {!previewUrl && (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Preview section */}
          {selectedTemplate && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
              <p className="text-gray-800">{getPreview()}</p>
              
              {/* Show selected date in human-readable format */}
              {fieldValues.targetDate && (
                <div className="mt-1 text-sm text-gray-500">
                  Target date: {fieldValues.targetDate}
                </div>
              )}
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Success message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Your progress update has been shared!
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Submit button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !isLoggedIn}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sharing...
                </>
              ) : (
                'Share Progress'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProgressForm; 