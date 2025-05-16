import React, { useState, useEffect } from 'react';
import LearningPlanForm from './LearningPlanForm';
import LearningPlanList from './LearningPlanList';
import apiService from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaPlus, FaGraduationCap, FaTimes, FaSearch, FaChartLine, FaRegLightbulb } from 'react-icons/fa';
import Footer from '../../components/Footer';

const LearningPlans = () => {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    apiService.getLearningPlansByUser(userId)
      .then(res => {
        const fetchedPlans = res.data || res;
        setPlans(fetchedPlans);
        setFilteredPlans(fetchedPlans);
      })
      .catch(() => setError('Failed to load learning plans'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlans(plans);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const filtered = plans.filter(plan => {
      // Search in title and description
      if (
        plan.title.toLowerCase().includes(term) || 
        plan.description.toLowerCase().includes(term)
      ) {
        return true;
      }
      
      // Search in topics
      if (plan.topics && plan.topics.length > 0) {
        return plan.topics.some(topic => 
          topic.name.toLowerCase().includes(term) || 
          (topic.description && topic.description.toLowerCase().includes(term))
        );
      }
      
      return false;
    });
    
    setFilteredPlans(filtered);
  }, [searchTerm, plans]);

  const handleAddPlan = (plan) => {
    setLoading(true);
    apiService.createLearningPlan(plan, userId)
      .then(res => {
        const newPlan = res.data || res;
        setPlans(prev => [...prev, newPlan]);
        setFilteredPlans(prev => [...prev, newPlan]);
        setShowFormModal(false); // Close the modal after successfully adding a plan
      })
      .catch(() => setError('Failed to create plan'))
      .finally(() => setLoading(false));
  };

  const handleDeletePlan = (planId) => {
    setLoading(true);
    apiService.deleteLearningPlan(planId)
      .then(() => {
        setPlans(prev => prev.filter(p => p.id !== planId));
        setFilteredPlans(prev => prev.filter(p => p.id !== planId));
        setSelectedPlan(null);
      })
      .catch(() => setError('Failed to delete plan'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
      <Navbar />
      <div className="flex min-h-screen pt-20 font-sans">
        {/* Sidebar */}
        <div className="sticky top-20 h-[calc(100vh-5rem)] self-start">
          <Sidebar defaultActiveTab="learning_plans" userId={userId} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header with glass effect */}
            <div className="mb-8 bg-white/80 backdrop-blur-lg rounded-xl shadow-md border border-white/70 p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                    Learning Plans
                  </h1>
                  <p className="mt-2 text-gray-600 max-w-2xl">
                    Track and organize your learning journey with structured plans and measurable progress.
                  </p>
                </div>
                
                {plans.length > 0 && (
                  <button 
                    onClick={() => setShowFormModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all group"
                  >
                    <FaPlus className="group-hover:rotate-90 transition-transform duration-300" /> 
                    <span>Create New Plan</span>
                  </button>
                )}
              </div>
              
              {plans.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaSearch className="text-blue-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-4 py-3 border-0 rounded-lg bg-blue-50/50 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
                      placeholder="Search in titles, descriptions, and topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        onClick={() => setSearchTerm('')}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Loading, Error & Empty States */}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 bg-white/80 backdrop-blur-lg rounded-xl shadow-md border border-white/70">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 mt-4 animate-pulse">Loading your learning plans...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-white/80 backdrop-blur-lg rounded-xl shadow-md border border-white/70">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-red-500 font-medium text-lg mb-3">{error}</div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-lg rounded-xl shadow-md border border-white/70 p-16 text-center">
                <div className="p-4 rounded-full bg-blue-100 mb-6">
                  <FaGraduationCap className="text-6xl text-blue-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Start Your Learning Journey</h2>
                
                <p className="text-gray-600 max-w-lg mb-8 leading-relaxed">
                  Create your first learning plan to organize your educational goals. Break down complex subjects into manageable topics and track your progress effectively.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mb-8">
                  <div className="flex items-start p-4 bg-blue-50/80 rounded-lg">
                    <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full mr-3">
                      <FaRegLightbulb className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800">Organize & Structure</h3>
                      <p className="text-sm text-gray-600 mt-1">Create organized learning paths with clear milestones</p>
                    </div>
                  </div>
                  <div className="flex items-start p-4 bg-blue-50/80 rounded-lg">
                    <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full mr-3">
                      <FaChartLine className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800">Track Progress</h3>
                      <p className="text-sm text-gray-600 mt-1">Monitor your advancement with visual progress indicators</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowFormModal(true)}
                  className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  <FaPlus /> Create Your First Learning Plan
                </button>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md border border-white/70 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-blue-900 flex items-center">
                      Your Learning Plans
                      <span className="ml-3 text-sm font-normal px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {searchTerm 
                          ? `${filteredPlans.length} of ${plans.length} plans`
                          : `${plans.length} ${plans.length === 1 ? 'plan' : 'plans'}`
                        }
                      </span>
                    </h2>
                  </div>
                </div>
              
                {/* Plans List */}
                <div className="relative">
                  {filteredPlans.length === 0 && searchTerm ? (
                    <div className="text-center py-16 px-4">
                      <FaSearch className="mx-auto text-4xl text-gray-300 mb-4 opacity-50" />
                      <h3 className="text-xl font-medium text-gray-700 mb-2">No Matching Plans Found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        No plans found matching "<strong>{searchTerm}</strong>".
                        Try different keywords or check your spelling.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4">
                      <LearningPlanList plans={filteredPlans} onSelect={setSelectedPlan} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Form Modal with glass effect */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay with blur */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-700 bg-opacity-60 backdrop-blur-sm" 
              onClick={() => setShowFormModal(false)}
            ></div>

            {/* This element is to trick the browser into centering the modal contents */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div 
              className="inline-block overflow-hidden text-left align-middle transition-all transform bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/70 sm:my-8 sm:max-w-lg sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                onClick={() => setShowFormModal(false)}
              >
                <FaTimes className="text-xl" />
              </button>
              
              <div className="px-6 pt-6 pb-4">
                <h2 className="text-xl font-bold mb-1 text-blue-700">Create Learning Plan</h2>
                <p className="text-sm text-gray-500 mb-6">Design your personalized learning path and track your progress</p>
                
                <div className="overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                  <LearningPlanForm onSubmit={handleAddPlan} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
      
      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default LearningPlans; 