import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const ProgressForm = ({ onSubmitSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [fieldValues, setFieldValues] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
            
            {selectedTemplate && templates[selectedTemplate]?.fields?.map((field) => (
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
            ))}
            
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