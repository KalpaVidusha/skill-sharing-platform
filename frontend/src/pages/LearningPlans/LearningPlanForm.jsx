import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

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
    }
  }, [initialData]);

  const handleTopicChange = (idx, field, value) => {
    const updated = topics.map((topic, i) =>
      i === idx ? { ...topic, [field]: value } : topic
    );
    setTopics(updated);
  };

  const addTopic = () => setTopics([...topics, createEmptyTopic()]);
  const removeTopic = (idx) => setTopics(topics.filter((_, i) => i !== idx));

  // New function to add a resource to a topic
  const addResource = (topicIdx) => {
    const updated = [...topics];
    updated[topicIdx].resources = [...(updated[topicIdx].resources || []), ''];
    setTopics(updated);
  };

  // New function to update a specific resource
  const updateResource = (topicIdx, resourceIdx, value) => {
    const updated = [...topics];
    updated[topicIdx].resources[resourceIdx] = value;
    setTopics(updated);
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields are filled
    if (!title.trim()) {
      alert("Please provide a plan title");
      return;
    }
    
    if (!description.trim()) {
      alert("Please provide a plan description");
      return;
    }
    
    // Validate all topics have required fields
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      if (!topic.name.trim()) {
        alert(`Please provide a name for topic #${i+1}`);
        return;
      }
      
      // Check at least one resource has content
      const hasResource = topic.resources.some(r => r.trim() !== '');
      if (!hasResource) {
        alert(`Please provide at least one resource for topic "${topic.name}"`);
        return;
      }
      
      if (!topic.timeline.trim()) {
        alert(`Please provide a timeline for topic "${topic.name}"`);
        return;
      }
    }
    
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
    
    setSubmitting(true);
    
    // Call onSubmit with the formatted data
    if (onSubmit) {
      try {
        onSubmit({ title, description, topics: formattedTopics });
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("Failed to save plan. Please try again.");
      }
    }
    
    // Set a timeout to show loading state for at least 1 second
    setTimeout(() => {
      // Only clear form if creating a new plan, not editing
      if (!initialData) {
        setTitle('');
        setDescription('');
        setTopics([createEmptyTopic()]);
      }
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="px-6"> {/* Added padding container */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
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
          <label className="block text-sm font-medium text-gray-700">Plan Title</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Full Stack Web Development"
            required
          />
        </div>
  
        {/* Description */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-[100px]"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Briefly describe your learning goals..."
            required
          />
        </div>
  
        {/* Topics Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Topics</label>
          
          {topics.map((topic, topicIdx) => (
            <div key={topicIdx} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
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
                <label className="block text-xs font-medium text-gray-500 mb-2">Topic Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                  value={topic.name}
                  onChange={e => handleTopicChange(topicIdx, 'name', e.target.value)}
                  placeholder="Enter topic name"
                  required
                />
              </div>
  
              {/* Resources */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-2">Resources</label>
                <div className="space-y-2">
                  {topic.resources.map((resource, resourceIdx) => (
                    <div key={resourceIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 transition-all"
                        value={resource}
                        onChange={e => updateResource(topicIdx, resourceIdx, e.target.value)}
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
                <label className="block text-xs font-medium text-gray-500 mb-2">Completion Timeline</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 transition-all"
                  value={topic.timeline}
                  onChange={e => handleTopicChange(topicIdx, 'timeline', e.target.value)}
                  placeholder="e.g., 2 weeks"
                  required
                />
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