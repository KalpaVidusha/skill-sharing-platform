import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaExclamationCircle } from 'react-icons/fa';

// Empty topic now includes a single empty resource string
const emptyTopic = { 
  name: '', 
  resources: [''], // Initialize with one empty resource
  timeline: '',
  completed: false
};

// Create a fresh empty topic to avoid reference issues
const createEmptyTopic = () => ({
  name: '', 
  resources: [''], 
  timeline: '',
  completed: false
});

// Helper function to process resources from any format into an array
const processResources = (resources) => {
  if (!resources) return [''];
  
  if (Array.isArray(resources)) {
    return resources.length > 0 ? resources : [''];
  }
  
  if (typeof resources === 'string') {
    // If it's a string with newlines, split it
    if (resources.includes('\n')) {
      const split = resources.split('\n').filter(r => r.trim() !== '');
      return split.length > 0 ? split : [''];
    }
    // Single resource string
    return resources.trim() ? [resources] : [''];
  }
  
  return [''];
};

// URL validation function
const isValidUrl = (url) => {
  try {
    // Check if it's a valid URL format
    new URL(url);
    // Additional check for common protocols
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('ftp://');
  } catch (e) {
    return false;
  }
};

// Field validation
const validateTopicName = (name) => {
  const MAX_LENGTH = 100; // Maximum allowed length for topic name
  
  if (!name || !name.trim()) {
    return { valid: false, message: 'Topic name is required' };
  }
  
  if (name.length > MAX_LENGTH) {
    return { valid: false, message: `Topic name must be less than ${MAX_LENGTH} characters` };
  }
  
  return { valid: true, message: '' };
};

const validateResource = (resource) => {
  if (!resource || !resource.trim()) {
    return { valid: false, message: 'Resource URL is required' };
  }
  
  if (!isValidUrl(resource)) {
    return { valid: false, message: 'Please enter a valid URL (e.g., https://example.com)' };
  }
  
  return { valid: true, message: '' };
};

const validateTimeline = (timeline) => {
  if (!timeline || !timeline.trim()) {
    return { valid: false, message: 'Timeline is required' };
  }
  
  return { valid: true, message: '' };
};

const LearningPlanForm = ({ onSubmit, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [topics, setTopics] = useState(initialData?.topics?.length 
    ? initialData.topics.map(topic => ({
        ...topic,
        // Process resources into array format
        resources: processResources(topic.resources)
      }))
    : [createEmptyTopic()]
  );
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    title: '',
    description: '',
    topics: [] // Array of errors for each topic
  });
  const [touched, setTouched] = useState({
    title: false,
    description: false,
    topics: [] // Array of touched state for each topic
  });

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setTopics(initialData.topics?.length 
        ? initialData.topics.map(topic => ({
            ...topic,
            // Process resources into array format
            resources: processResources(topic.resources)
          }))
        : [createEmptyTopic()]
      );
      
      // Reset validation state
      setValidationErrors({
        title: '',
        description: '',
        topics: initialData.topics?.length 
          ? initialData.topics.map(() => ({ name: '', resources: [], timeline: '' }))
          : [{ name: '', resources: [''], timeline: '' }]
      });
      
      setTouched({
        title: false,
        description: false,
        topics: initialData.topics?.length 
          ? initialData.topics.map(() => ({ name: false, resources: [false], timeline: false }))
          : [{ name: false, resources: [false], timeline: false }]
      });
    }
  }, [initialData]);

  // Validate a single field and update validation state
  const validateField = (field, value) => {
    let error = '';
    
    if (field === 'title') {
      if (!value || !value.trim()) {
        error = 'Title is required';
      } else if (value.length > 100) {
        error = 'Title must be less than 100 characters';
      }
    }
    
    if (field === 'description') {
      if (!value || !value.trim()) {
        error = 'Description is required';
      } else if (value.length > 500) {
        error = 'Description must be less than 500 characters';
      }
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return !error;
  };

  // Mark a field as touched
  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field, field === 'title' ? title : description);
  };

  // Handle topic field blur
  const handleTopicBlur = (topicIdx, field, resourceIdx = null) => {
    setTouched(prev => {
      const topicsTouched = [...prev.topics];
      if (!topicsTouched[topicIdx]) {
        topicsTouched[topicIdx] = { name: false, resources: [], timeline: false };
      }
      
      if (field === 'resources' && resourceIdx !== null) {
        if (!topicsTouched[topicIdx].resources) {
          topicsTouched[topicIdx].resources = [];
        }
        topicsTouched[topicIdx].resources[resourceIdx] = true;
      } else {
        topicsTouched[topicIdx][field] = true;
      }
      
      return {
        ...prev,
        topics: topicsTouched
      };
    });
    
    validateTopicField(topicIdx, field, resourceIdx);
  };

  // Validate topic field
  const validateTopicField = (topicIdx, field, resourceIdx = null) => {
    const topic = topics[topicIdx];
    let result;
    
    setValidationErrors(prev => {
      const topicsErrors = [...prev.topics];
      if (!topicsErrors[topicIdx]) {
        topicsErrors[topicIdx] = { name: '', resources: [], timeline: '' };
      }
      
      if (field === 'name') {
        result = validateTopicName(topic.name);
        topicsErrors[topicIdx].name = result.message;
      } else if (field === 'timeline') {
        result = validateTimeline(topic.timeline);
        topicsErrors[topicIdx].timeline = result.message;
      } else if (field === 'resources' && resourceIdx !== null) {
        if (!topicsErrors[topicIdx].resources) {
          topicsErrors[topicIdx].resources = [];
        }
        result = validateResource(topic.resources[resourceIdx]);
        topicsErrors[topicIdx].resources[resourceIdx] = result.message;
      }
      
      return {
        ...prev,
        topics: topicsErrors
      };
    });
    
    return result?.valid ?? false;
  };

  const handleTopicChange = (idx, field, value) => {
    const updated = topics.map((topic, i) =>
      i === idx ? { ...topic, [field]: value } : topic
    );
    setTopics(updated);
    
    // If field was already touched, validate on change
    if (touched.topics[idx] && touched.topics[idx][field]) {
      validateTopicField(idx, field);
    }
  };

  const addTopic = () => {
    setTopics([...topics, createEmptyTopic()]);
    
    // Add validation state for new topic
    setValidationErrors(prev => ({
      ...prev,
      topics: [...prev.topics, { name: '', resources: [''], timeline: '' }]
    }));
    
    setTouched(prev => ({
      ...prev,
      topics: [...prev.topics, { name: false, resources: [false], timeline: false }]
    }));
  };
  
  const removeTopic = (idx) => {
    setTopics(topics.filter((_, i) => i !== idx));
    
    // Remove validation state for deleted topic
    setValidationErrors(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== idx)
    }));
    
    setTouched(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== idx)
    }));
  };

  // New function to add a resource to a topic
  const addResource = (topicIdx) => {
    const updated = [...topics];
    updated[topicIdx].resources = [...(updated[topicIdx].resources || []), ''];
    setTopics(updated);
    
    // Add validation state for new resource
    setValidationErrors(prev => {
      const topicsErrors = [...prev.topics];
      if (!topicsErrors[topicIdx].resources) {
        topicsErrors[topicIdx].resources = [];
      }
      topicsErrors[topicIdx].resources.push('');
      return {
        ...prev,
        topics: topicsErrors
      };
    });
    
    setTouched(prev => {
      const topicsTouched = [...prev.topics];
      if (!topicsTouched[topicIdx].resources) {
        topicsTouched[topicIdx].resources = [];
      }
      topicsTouched[topicIdx].resources.push(false);
      return {
        ...prev,
        topics: topicsTouched
      };
    });
  };

  // New function to update a specific resource
  const updateResource = (topicIdx, resourceIdx, value) => {
    const updated = [...topics];
    updated[topicIdx].resources[resourceIdx] = value;
    setTopics(updated);
    
    // If field was already touched, validate on change
    if (touched.topics[topicIdx] && 
        touched.topics[topicIdx].resources && 
        touched.topics[topicIdx].resources[resourceIdx]) {
      validateTopicField(topicIdx, 'resources', resourceIdx);
    }
  };

  // New function to remove a resource
  const removeResource = (topicIdx, resourceIdx) => {
    const updated = [...topics];
    updated[topicIdx].resources = updated[topicIdx].resources.filter((_, i) => i !== resourceIdx);
    // Make sure there's always at least one resource field
    if (updated[topicIdx].resources.length === 0) {
      updated[topicIdx].resources = [''];
    }
    setTopics(updated);
    
    // Remove validation state for deleted resource
    setValidationErrors(prev => {
      const topicsErrors = [...prev.topics];
      topicsErrors[topicIdx].resources = topicsErrors[topicIdx].resources.filter((_, i) => i !== resourceIdx);
      if (topicsErrors[topicIdx].resources.length === 0) {
        topicsErrors[topicIdx].resources = [''];
      }
      return {
        ...prev,
        topics: topicsErrors
      };
    });
    
    setTouched(prev => {
      const topicsTouched = [...prev.topics];
      topicsTouched[topicIdx].resources = topicsTouched[topicIdx].resources.filter((_, i) => i !== resourceIdx);
      if (topicsTouched[topicIdx].resources.length === 0) {
        topicsTouched[topicIdx].resources = [false];
      }
      return {
        ...prev,
        topics: topicsTouched
      };
    });
  };

  const validateForm = () => {
    // Validate title and description
    const titleValid = validateField('title', title);
    const descriptionValid = validateField('description', description);
    
    // Validate all topics
    let allTopicsValid = true;
    let updatedTopicsErrors = [...validationErrors.topics];
    let updatedTopicsTouched = [...touched.topics];
    
    // Ensure at least one topic exists
    if (topics.length === 0) {
      return false;
    }
    
    // Validate each topic
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      
      // Initialize errors for this topic if needed
      if (!updatedTopicsErrors[i]) {
        updatedTopicsErrors[i] = { name: '', resources: [], timeline: '' };
      }
      
      // Initialize touched for this topic if needed
      if (!updatedTopicsTouched[i]) {
        updatedTopicsTouched[i] = { name: true, resources: [], timeline: true };
      }
      
      // Validate topic name
      const nameResult = validateTopicName(topic.name);
      updatedTopicsErrors[i].name = nameResult.message;
      updatedTopicsTouched[i].name = true;
      if (!nameResult.valid) allTopicsValid = false;
      
      // Validate timeline
      const timelineResult = validateTimeline(topic.timeline);
      updatedTopicsErrors[i].timeline = timelineResult.message;
      updatedTopicsTouched[i].timeline = true;
      if (!timelineResult.valid) allTopicsValid = false;
      
      // Validate all resources
      let hasValidResource = false;
      for (let j = 0; j < topic.resources.length; j++) {
        const resource = topic.resources[j];
        
        // Initialize errors for this resource if needed
        if (!updatedTopicsErrors[i].resources) {
          updatedTopicsErrors[i].resources = [];
        }
        
        // Initialize touched for this resource if needed
        if (!updatedTopicsTouched[i].resources) {
          updatedTopicsTouched[i].resources = [];
        }
        
        const resourceResult = validateResource(resource);
        updatedTopicsErrors[i].resources[j] = resourceResult.message;
        updatedTopicsTouched[i].resources[j] = true;
        
        if (resourceResult.valid) {
          hasValidResource = true;
        }
      }
      
      // If no valid resources, mark as invalid
      if (!hasValidResource) {
        allTopicsValid = false;
      }
    }
    
    // Update validation state
    setValidationErrors(prev => ({
      ...prev,
      topics: updatedTopicsErrors
    }));
    
    // Mark all fields as touched
    setTouched({
      title: true,
      description: true,
      topics: updatedTopicsTouched
    });
    
    return titleValid && descriptionValid && allTopicsValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isValid = validateForm();
    if (!isValid) {
      return;
    }
    
    // Additional check for URL validity before submission
    let hasInvalidUrls = false;
    
    // Double check all resources are valid URLs
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      for (let j = 0; j < topic.resources.length; j++) {
        const resource = topic.resources[j];
        if (resource && resource.trim() && !isValidUrl(resource)) {
          // Mark the specific field as touched and invalid
          setTouched(prev => {
            const newTouched = {...prev};
            if (!newTouched.topics[i]) {
              newTouched.topics[i] = { name: true, resources: [], timeline: true };
            }
            if (!newTouched.topics[i].resources) {
              newTouched.topics[i].resources = [];
            }
            newTouched.topics[i].resources[j] = true;
            return newTouched;
          });
          
          setValidationErrors(prev => {
            const newErrors = {...prev};
            if (!newErrors.topics[i]) {
              newErrors.topics[i] = { name: '', resources: [], timeline: '' };
            }
            if (!newErrors.topics[i].resources) {
              newErrors.topics[i].resources = [];
            }
            newErrors.topics[i].resources[j] = 'Please enter a valid URL (e.g., https://example.com)';
            return newErrors;
          });
          
          hasInvalidUrls = true;
        }
      }
    }
    
    if (hasInvalidUrls) {
      return; // Prevent submission if there are invalid URLs
    }
    
    setSubmitting(true);
    
    // Create a copy of topics to modify for submission
    const formattedTopics = topics.map(topic => {
      const formattedTopic = { ...topic };
      
      // Filter out empty resources
      const nonEmptyResources = topic.resources.filter(r => r.trim() !== '');
      
      // Backend expects resources as a string, not an array
      // If we have multiple resources, join them with a delimiter that can be parsed later
      if (nonEmptyResources.length === 0) {
        formattedTopic.resources = '';
      } else if (nonEmptyResources.length === 1) {
        formattedTopic.resources = nonEmptyResources[0];
      } else {
        // Join multiple resources with a newline character as delimiter
        // We'll use this delimiter to split the string when displaying
        formattedTopic.resources = nonEmptyResources.join('\n');
      }
      
      return formattedTopic;
    });
    
    // Call onSubmit with the formatted data
    if (onSubmit) {
      try {
        onSubmit({ title, description, topics: formattedTopics });
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("Failed to save plan. Please try again.");
        setSubmitting(false);
        return;
      }
    }
    
    // Set a timeout to show loading state for at least 1 second
    setTimeout(() => {
      // Only clear form if creating a new plan, not editing
      if (!initialData) {
        setTitle('');
        setDescription('');
        setTopics([createEmptyTopic()]);
        
        // Reset validation state
        setValidationErrors({
          title: '',
          description: '',
          topics: [{ name: '', resources: [''], timeline: '' }]
        });
        
        setTouched({
          title: false,
          description: false,
          topics: [{ name: false, resources: [false], timeline: false }]
        });
      }
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="px-6"> {/* Added padding container */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        {/* Form Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Edit Learning Plan' : 'Create Learning Plan'}
          </h2>
          <p className="text-gray-500 mt-1">
            {initialData ? 'Update your existing plan' : 'Build your personalized learning journey'}
          </p>
        </div>
  
        {/* Plan Title */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Plan Title
          </label>
          <input
            type="text"
            className={`w-full px-4 py-3 border ${validationErrors.title && touched.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              if (touched.title) validateField('title', e.target.value);
            }}
            onBlur={() => handleBlur('title')}
            placeholder="e.g., Full Stack Web Development"
            required
          />
          {validationErrors.title && touched.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FaExclamationCircle className="mr-1" size={12} /> {validationErrors.title}
            </p>
          )}
        </div>
  
        {/* Description */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            className={`w-full px-4 py-3 border ${validationErrors.description && touched.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-[100px]`}
            value={description}
            onChange={e => {
              setDescription(e.target.value);
              if (touched.description) validateField('description', e.target.value);
            }}
            onBlur={() => handleBlur('description')}
            placeholder="Briefly describe your learning goals..."
            required
          />
          {validationErrors.description && touched.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FaExclamationCircle className="mr-1" size={12} /> {validationErrors.description}
            </p>
          )}
        </div>
  
        {/* Topics Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Topics
            <span className="text-xs text-gray-500 ml-2">At least one topic is required</span>
          </label>
          
          {topics.map((topic, topicIdx) => (
            <div key={topicIdx} className={`p-5 border ${validationErrors.topics[topicIdx]?.name && touched.topics[topicIdx]?.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'} rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200`}>
              {/* Topic Header */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-700">Topic {topicIdx + 1}</h3>
                {topics.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeTopic(topicIdx)}
                    className="text-red-500 hover:text-red-700 flex items-center text-sm"
                  >
                    <FaTrash className="mr-1" size={12} /> Remove
                  </button>
                )}
              </div>
  
              {/* Topic Name */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Topic Name
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border ${validationErrors.topics[topicIdx]?.name && touched.topics[topicIdx]?.name ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all`}
                  value={topic.name}
                  onChange={e => handleTopicChange(topicIdx, 'name', e.target.value)}
                  onBlur={() => handleTopicBlur(topicIdx, 'name')}
                  placeholder="Enter topic name"
                  required
                />
                {validationErrors.topics[topicIdx]?.name && touched.topics[topicIdx]?.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaExclamationCircle className="mr-1" size={12} /> {validationErrors.topics[topicIdx].name}
                  </p>
                )}
              </div>
  
              {/* Resources */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Resources
                </label>
                <div className="space-y-2">
                  {topic.resources.map((resource, resourceIdx) => (
                    <div key={resourceIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        className={`flex-1 px-3 py-2 border ${validationErrors.topics[topicIdx]?.resources?.[resourceIdx] && touched.topics[topicIdx]?.resources?.[resourceIdx] ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-300 transition-all`}
                        value={resource}
                        onChange={e => updateResource(topicIdx, resourceIdx, e.target.value)}
                        onBlur={() => handleTopicBlur(topicIdx, 'resources', resourceIdx)}
                        placeholder="https://example.com"
                        required
                      />
                      {topic.resources.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeResource(topicIdx, resourceIdx)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                          aria-label="Remove resource"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {topic.resources.map((resource, resourceIdx) => (
                  validationErrors.topics[topicIdx]?.resources?.[resourceIdx] && 
                  touched.topics[topicIdx]?.resources?.[resourceIdx] && (
                    <p key={resourceIdx} className="mt-1 text-sm text-red-600 flex items-center">
                      <FaExclamationCircle className="mr-1" size={12} /> {validationErrors.topics[topicIdx].resources[resourceIdx]}
                    </p>
                  )
                ))}
                <button
                  type="button"
                  onClick={() => addResource(topicIdx)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <FaPlus className="mr-1" size={12} /> Add Resource
                </button>
              </div>
  
              {/* Timeline */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Completion Timeline
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border ${validationErrors.topics[topicIdx]?.timeline && touched.topics[topicIdx]?.timeline ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-300 transition-all`}
                  value={topic.timeline}
                  onChange={e => handleTopicChange(topicIdx, 'timeline', e.target.value)}
                  onBlur={() => handleTopicBlur(topicIdx, 'timeline')}
                  placeholder="e.g., 2 weeks"
                  required
                />
                {validationErrors.topics[topicIdx]?.timeline && touched.topics[topicIdx]?.timeline && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaExclamationCircle className="mr-1" size={12} /> {validationErrors.topics[topicIdx].timeline}
                  </p>
                )}
              </div>
            </div>
          ))}
  
          {/* Add Topic Button */}
          <button 
            type="button" 
            onClick={addTopic}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-blue-600 transition-all duration-200 flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Add New Topic
          </button>
        </div>
  
        {/* Submit Button */}
        <div className="pt-2 pb-6"> {/* Added bottom padding */}
          <button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {initialData ? 'Saving Changes...' : 'Creating Plan...'}
              </span>
            ) : (
              initialData ? 'Save Changes' : 'Create Learning Plan'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LearningPlanForm; 