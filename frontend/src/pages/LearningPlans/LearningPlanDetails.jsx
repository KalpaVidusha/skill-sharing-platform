import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import LearningPlanForm from './LearningPlanForm';

const ProgressBar = ({ percent }) => (
  <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
    <div
      className="bg-blue-600 h-4 rounded-full transition-all duration-500"
      style={{ width: `${percent}%` }}
    ></div>
  </div>
);

const LearningPlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiService.getLearningPlanById(id)
      .then(res => setPlan(res.data || res))
      .catch(() => setError('Failed to load plan'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleTask = (idx) => {
    if (!plan) return;
    setUpdating(true);
    const updatedTopics = plan.topics.map((topic, i) =>
      i === idx ? { ...topic, completed: !topic.completed } : topic
    );
    const updatedPlan = { ...plan, topics: updatedTopics };
    apiService.updateLearningPlan(plan.id, updatedPlan)
      .then(res => setPlan(res.data || res))
      .catch(() => setError('Failed to update task'))
      .finally(() => setUpdating(false));
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await apiService.deleteLearningPlan(plan.id);
      navigate('/learning-plans');
    } catch {
      setError('Failed to delete plan');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (updated) => {
    setUpdating(true);
    apiService.updateLearningPlan(plan.id, { ...plan, ...updated })
      .then(res => {
        setPlan(res.data || res);
        setShowEdit(false);
      })
      .catch(() => setError('Failed to update plan'))
      .finally(() => setUpdating(false));
  };

  if (loading) return <div className="p-8 text-blue-600">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!plan) return <div className="p-8 text-gray-500">Plan not found.</div>;

  const completed = plan.topics.filter(t => t.completed).length;
  const total = plan.topics.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header with back button and title */}
          <div className="px-8 pt-6 pb-4 border-b border-gray-100 relative">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-6 top-6 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <div className="text-center px-10">
              <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
              <p className="mt-2 text-gray-600">{plan.description}</p>
            </div>
            <div className="absolute right-6 top-6 flex gap-2">
              <button
                onClick={() => setShowEdit(true)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm shadow"
                disabled={updating}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm shadow"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
  
          {/* Progress section */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-500">
                {completed} of {total} tasks completed
              </span>
              <span className="text-sm font-semibold text-blue-600">{percent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
  
          {/* Tasks list */}
          <div className="divide-y divide-gray-100">
            {plan.topics.map((topic, idx) => (
              <div
                key={idx}
                className={`px-6 py-4 transition-all duration-200 hover:bg-gray-50 ${
                  topic.completed ? 'bg-green-50/50' : ''
                }`}
              >
                <div className="flex items-start">
                  <button
                    onClick={() => handleToggleTask(idx)}
                    disabled={updating}
                    className={`mt-1 flex-shrink-0 h-5 w-5 rounded border flex items-center justify-center transition-all ${
                      topic.completed
                        ? 'bg-green-100 border-green-400 text-green-600'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {topic.completed && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <div className="ml-4 flex-1 min-w-0">
                    <h3
                      className={`text-base font-medium leading-6 ${
                        topic.completed ? 'text-green-700 line-through' : 'text-gray-900'
                      }`}
                    >
                      {topic.name}
                    </h3>
                    {topic.resources && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <a href={topic.resources} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline truncate">
                          {topic.resources.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    {topic.timeline && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {topic.timeline}
                      </div>
                    )}
                  </div>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    topic.completed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {topic.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
  
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 text-right">
            <span className="text-sm text-gray-500">Last updated: {new Date(plan.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowEdit(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-700">Edit Learning Plan</h2>
            <LearningPlanForm
              onSubmit={handleEdit}
              initialData={{
                title: plan.title,
                description: plan.description,
                topics: plan.topics
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPlanDetails; 