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
    if (!title.trim()) return;
    
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
    
    onSubmit && onSubmit({ title, description, topics: formattedTopics });
    
    if (!initialData) {
      // Clear all form fields after submission for a new plan
      setTitle('');
      setDescription('');
      setTopics([createEmptyTopic()]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Title</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Topics</label>
        {topics.map((topic, topicIdx) => (
          <div key={topicIdx} className="mb-4 p-4 border rounded-lg bg-gray-50">
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">Topic Name</label>
              <input
                type="text"
                placeholder="e.g., JavaScript Basics"
                className="w-full px-2 py-1 border border-gray-300 rounded"
                value={topic.name}
                onChange={e => handleTopicChange(topicIdx, 'name', e.target.value)}
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Resources (links, books, etc.)
              </label>
              {/* Always show resource inputs, guaranteed to have at least one */}
              {topic.resources.map((resource, resourceIdx) => (
                <div key={resourceIdx} className="flex items-center mb-2">
                  <input
                    type="text"
                    placeholder="https://example.com"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    value={resource}
                    onChange={e => updateResource(topicIdx, resourceIdx, e.target.value)}
                  />
                  {/* Only show remove button if there's more than one resource */}
                  {topic.resources.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeResource(topicIdx, resourceIdx)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addResource(topicIdx)}
                className="text-blue-600 text-sm flex items-center hover:text-blue-800"
              >
                <FaPlus size={12} className="mr-1" /> Add Another Resource
              </button>
            </div>
            
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">Completion Timeline</label>
              <input
                type="text"
                placeholder="e.g., 2 weeks"
                className="w-full px-2 py-1 border border-gray-300 rounded"
                value={topic.timeline}
                onChange={e => handleTopicChange(topicIdx, 'timeline', e.target.value)}
              />
            </div>
            
            {topics.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeTopic(topicIdx)} 
                className="text-red-500 text-xs flex items-center hover:text-red-700"
              >
                <FaTrash size={12} className="mr-1" /> Remove Topic
              </button>
            )}
          </div>
        ))}
        <button 
          type="button" 
          onClick={addTopic} 
          className="text-blue-600 text-sm flex items-center hover:text-blue-800"
        >
          <FaPlus size={14} className="mr-1" /> Add Topic
        </button>
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        {initialData ? 'Save Changes' : 'Save Plan'}
      </button>
    </form>
  );
};

export default LearningPlanForm; 