import React, { useState, useEffect } from 'react';

const emptyTopic = { name: '', resources: '', timeline: '' };

const LearningPlanForm = ({ onSubmit, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [topics, setTopics] = useState(initialData?.topics?.length ? initialData.topics : [{ ...emptyTopic }]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setTopics(initialData.topics?.length ? initialData.topics : [{ ...emptyTopic }]);
    }
  }, [initialData]);

  const handleTopicChange = (idx, field, value) => {
    const updated = topics.map((topic, i) =>
      i === idx ? { ...topic, [field]: value } : topic
    );
    setTopics(updated);
  };

  const addTopic = () => setTopics([...topics, { ...emptyTopic }]);
  const removeTopic = (idx) => setTopics(topics.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit && onSubmit({ title, description, topics });
    if (!initialData) {
      setTitle('');
      setDescription('');
      setTopics([{ ...emptyTopic }]);
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
        {topics.map((topic, idx) => (
          <div key={idx} className="mb-4 p-4 border rounded-lg bg-gray-50">
            <div className="mb-2">
              <input
                type="text"
                placeholder="Topic Name"
                className="w-full px-2 py-1 border border-gray-300 rounded"
                value={topic.name}
                onChange={e => handleTopicChange(idx, 'name', e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <input
                type="text"
                placeholder="Resources (links, books, etc.)"
                className="w-full px-2 py-1 border border-gray-300 rounded"
                value={topic.resources}
                onChange={e => handleTopicChange(idx, 'resources', e.target.value)}
              />
            </div>
            <div className="mb-2">
              <input
                type="text"
                placeholder="Completion Timeline (e.g., 2 weeks)"
                className="w-full px-2 py-1 border border-gray-300 rounded"
                value={topic.timeline}
                onChange={e => handleTopicChange(idx, 'timeline', e.target.value)}
              />
            </div>
            {topics.length > 1 && (
              <button type="button" onClick={() => removeTopic(idx)} className="text-red-500 text-xs">Remove Topic</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addTopic} className="text-blue-600 text-sm mt-2">+ Add Topic</button>
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">{initialData ? 'Save Changes' : 'Save Plan'}</button>
    </form>
  );
};

export default LearningPlanForm; 