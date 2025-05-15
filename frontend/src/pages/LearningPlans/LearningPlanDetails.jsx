import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import LearningPlanForm from './LearningPlanForm';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

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
  const userId = localStorage.getItem('userId');

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
      navigate('/userdashboard/learning-plans');
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

  if (loading) return (
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-r from-blue-50 to-white">
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          <Sidebar defaultActiveTab="learning_plans" userId={userId} />
        </div>
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </main>
      </div>
    </div>
  );
  
  if (error) return (
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-r from-blue-50 to-white">
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          <Sidebar defaultActiveTab="learning_plans" userId={userId} />
        </div>
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="p-8 text-red-500">{error}</div>
        </main>
      </div>
    </div>
  );
  
  if (!plan) return (
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-r from-blue-50 to-white">
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          <Sidebar defaultActiveTab="learning_plans" userId={userId} />
        </div>
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="p-8 text-gray-500">Plan not found.</div>
        </main>
      </div>
    </div>
  );

  const completed = plan.topics.filter(t => t.completed).length;
  const total = plan.topics.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-r from-blue-50 to-white">
        {/* Sidebar */}
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          <Sidebar defaultActiveTab="learning_plans" userId={userId} />
        </div>
        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
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
                        
                        {/* Resources - Modified to handle both string and array formats */}
                        {topic.resources && (
                          <div className="mt-2">
                            <div className="flex items-center text-sm text-gray-700 mb-1">
                              <svg className="flex-shrink-0 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              <span className="font-medium">Resources:</span>
                            </div>
                            
                            {/* Process resources based on type */}
                            {(() => {
                              // Handle different formats of resources
                              if (typeof topic.resources === 'string') {
                                // If it contains newlines, it might be multiple resources
                                if (topic.resources.includes('\n')) {
                                  // Split by newline and render multiple links
                                  const resourcesArray = topic.resources.split('\n').filter(r => r.trim() !== '');
                                  
                                  return (
                                    <div className="ml-6 space-y-1">
                                      {resourcesArray.map((resource, idx) => (
                                        <div key={idx} className="flex items-start">
                                          <span className="text-gray-400 mr-1 mt-1">•</span>
                                          <a 
                                            href={resource.startsWith('http') ? resource : `https://${resource}`}
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                                          >
                                            {resource.replace(/^https?:\/\//, '')}
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                } else if (topic.resources.trim() !== '') {
                                  // Single resource as string
                                  return (
                                    <div className="ml-6 mb-1">
                                      <a 
                                        href={topic.resources.startsWith('http') ? topic.resources : `https://${topic.resources}`}
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                                      >
                                        {topic.resources.replace(/^https?:\/\//, '')}
                                      </a>
                                    </div>
                                  );
                                }
                              } else if (Array.isArray(topic.resources) && topic.resources.length > 0) {
                                // Handle array of resources (for future compatibility)
                                return (
                                  <div className="ml-6 space-y-1">
                                    {topic.resources.map((resource, resourceIdx) => (
                                      resource && (
                                        <div key={resourceIdx} className="flex items-start">
                                          <span className="text-gray-400 mr-1 mt-1">•</span>
                                          <a 
                                            href={resource.startsWith('http') ? resource : `https://${resource}`}
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                                          >
                                            {resource.replace(/^https?:\/\//, '')}
                                          </a>
                                        </div>
                                      )
                                    ))}
                                  </div>
                                );
                              }
                              
                              // Default case - no resources
                              return <div className="ml-6 text-sm text-gray-500 italic">No resources provided</div>;
                            })()}
                          </div>
                        )}
                        
                        {topic.timeline && (
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{topic.timeline}</span>
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
        </main>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
          onClick={() => setShowEdit(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative flex flex-col"
            style={{maxHeight: '90vh'}}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={() => setShowEdit(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-700">Edit Learning Plan</h2>
            <div className="overflow-y-auto flex-grow">
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
        </div>
      )}
    </div>
  );
};

export default LearningPlanDetails; 