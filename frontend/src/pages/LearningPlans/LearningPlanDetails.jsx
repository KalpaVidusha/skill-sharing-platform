import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import LearningPlanForm from './LearningPlanForm';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { FaLink } from 'react-icons/fa';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
      .catch((err) => {
        // Handle permission error
        if (err.response && err.response.status === 403) {
          setError("You don't have permission to update this learning plan");
        } else {
          setError('Failed to update task');
        }
      })
      .finally(() => setUpdating(false));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiService.deleteLearningPlan(plan.id);
      navigate('/userdashboard/learning-plans');
    } catch (err) {
      // Handle permission error
      if (err.response && err.response.status === 403) {
        setError("You don't have permission to delete this learning plan");
      } else {
        setError('Failed to delete plan');
      }
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async (updated) => {
    setUpdating(true);
    try {
      const response = await apiService.updateLearningPlan(plan.id, { ...plan, ...updated });
      setPlan(response.data || response);
      setShowEdit(false);
      return response;
    } catch (err) {
      // Handle permission error
      if (err.response && err.response.status === 403) {
        setError("You don't have permission to edit this learning plan");
      } else {
        setError('Failed to update plan');
      }
      setShowEdit(false);
      throw err;
    } finally {
      setUpdating(false);
    }
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
      <div className="flex min-h-screen pt-20 font-sans bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        {/* Sidebar */}
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          <Sidebar defaultActiveTab="learning_plans" userId={userId} />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Glassmorphism Card Container */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/70 overflow-hidden">
              {/* Header with glass effect */}
              <div className="px-10 pt-8 pb-6 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-white/30 relative">
                <button
                  onClick={() => navigate(-1)}
                  className="absolute left-8 top-8 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors group"
                >
                  <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="font-medium">Back to Plans</span>
                </button>
                
                <div className="text-center px-12">
                  <h1 className="text-3xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    {plan.title}
                  </h1>
                  <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                    {plan.description}
                  </p>
                </div>
                
                <div className="absolute right-8 top-8 flex gap-2">
                  {userId === plan.user.id && (
                    <>
                      <button
                        onClick={() => setShowEdit(true)}
                        className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-70"
                        disabled={updating}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-3 py-1.5 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-70"
                        disabled={deleting}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress section with animated bar */}
              <div className="px-10 py-8 border-b border-white/30 bg-gradient-to-r from-white/70 to-blue-50/50">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">
                      {completed} of {total} topics completed
                    </span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{percent}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>

              {/* Topics list with elegant cards */}
              <div className="divide-y divide-white/30">
                {plan.topics.map((topic, idx) => (
                  <div
                    key={idx}
                    className={`px-8 py-6 transition-all duration-300 hover:bg-white/50 ${
                      topic.completed ? 'bg-green-50/30' : 'bg-white/30'
                    }`}
                  >
                    <div className="flex items-start gap-5">
                      {/* Checkbox with animation */}
                      <button
                        onClick={() => handleToggleTask(idx)}
                        disabled={updating}
                        className={`mt-1 flex-shrink-0 h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          topic.completed
                            ? 'bg-green-100 border-green-400 text-green-600 shadow-inner'
                            : 'border-gray-300 hover:border-blue-400 bg-white'
                        }`}
                      >
                        {topic.completed && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3
                            className={`text-xl font-semibold leading-7 ${
                              topic.completed 
                                ? 'text-green-700 line-through decoration-2 decoration-green-700/70' 
                                : 'text-gray-800'
                            }`}
                          >
                            {topic.name}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            topic.completed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {topic.completed ? (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Completed
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                Pending
                              </>
                            )}
                          </span>
                        </div>

                        {/* Timeline with beautiful icon */}
                        {topic.timeline && (
                          <div className="mt-3 flex items-center text-sm text-gray-600">
                            <svg className="flex-shrink-0 mr-2 h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Target:</span>
                            <span className="ml-1">{topic.timeline}</span>
                          </div>
                        )}

                        {/* Resources section */}
                        {topic.resources && (
                          <div className="mt-4">
                            <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                              <svg className="flex-shrink-0 mr-2 h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Learning Resources
                            </div>
                            
                            <div className="ml-7 space-y-2">
                              {(() => {
                                // Process resources based on type
                                if (typeof topic.resources === 'string') {
                                  if (topic.resources.includes('\n')) {
                                    const resourcesArray = topic.resources.split('\n').filter(r => r.trim() !== '');
                                    return resourcesArray.map((resource, idx) => (
                                      <ResourceLink key={idx} url={resource} />
                                    ));
                                  } else if (topic.resources.trim() !== '') {
                                    return <ResourceLink url={topic.resources} />;
                                  }
                                } else if (Array.isArray(topic.resources)) {
                                  return topic.resources.map((resource, idx) => (
                                    resource && <ResourceLink key={idx} url={resource} />
                                  ));
                                }
                                return (
                                  <div className="text-sm text-gray-500 italic">
                                    No resources provided for this topic
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer with subtle gradient */}
              <div className="px-8 py-4 bg-gradient-to-r from-white/70 to-blue-50/50 text-right">
                <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Last updated: {new Date(plan.updatedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowEdit(false)}></div>

            {/* This element is to trick the browser into centering the modal contents */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div 
              className="inline-block overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:max-w-lg sm:w-full"
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
              <div className="px-4 pt-5 pb-4 bg-white sm:p-6">
                <h2 className="text-xl font-bold mb-4 text-blue-700">Edit Learning Plan</h2>
                <div className="overflow-y-auto max-h-[80vh]">
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
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteModal(false)}></div>

            {/* This element is to trick the browser into centering the modal contents */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal content */}
            <div className="inline-block overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="w-6 h-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Learning Plan</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-2">
                        Are you sure you want to delete this learning plan? This action cannot be undone.
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        Plan Title: <span className="text-red-600">{plan.title}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <button 
                  type="button" 
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

// ResourceLink component for consistent link styling
function ResourceLink({ url }) {
  return (
    <div className="flex items-start group">
      <FaLink className="text-blue-400 mr-2 mt-1.5 flex-shrink-0" size={12} />
      <a 
        href={url.startsWith('http') ? url : `https://${url}`}
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center group-hover:underline break-all"
      >
        {url.replace(/^https?:\/\//, '')}
        <svg className="ml-1.5 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}

export default LearningPlanDetails; 