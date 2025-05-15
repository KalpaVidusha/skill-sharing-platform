import React, { useState, useEffect } from 'react';
import LearningPlanForm from './LearningPlanForm';
import LearningPlanList from './LearningPlanList';
import apiService from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaPlus, FaGraduationCap, FaTimes } from 'react-icons/fa';

const LearningPlans = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    apiService.getLearningPlansByUser(userId)
      .then(res => setPlans(res.data || res))
      .catch(() => setError('Failed to load learning plans'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleAddPlan = (plan) => {
    setLoading(true);
    apiService.createLearningPlan(plan, userId)
      .then(res => {
        setPlans(prev => [...prev, res.data || res]);
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
        setSelectedPlan(null);
      })
      .catch(() => setError('Failed to delete plan'))
      .finally(() => setLoading(false));
  };

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
          {/* Header with Add button */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-blue-900">Learning Plans</h1>
            {plans.length > 0 && (
              <button 
                onClick={() => setShowFormModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus /> Add New Plan
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 mb-3">{error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border p-12 text-center">
              <FaGraduationCap className="text-6xl text-blue-200 mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">No Learning Plans Created</h2>
              <p className="text-gray-500 max-w-lg mb-8">
                Create your first learning plan to organize your learning journey. Break down your learning goals into manageable topics and track your progress.
              </p>
              <button 
                onClick={() => setShowFormModal(true)}
                className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FaPlus /> Add Your Learning Plan
              </button>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-blue-800">
                  Your Plans 
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({plans.length} {plans.length === 1 ? 'plan' : 'plans'})
                  </span>
                </h2>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto pr-2">
                <LearningPlanList plans={plans} onSelect={setSelectedPlan} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
          onClick={() => setShowFormModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative flex flex-col"
            style={{maxHeight: '90vh'}}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={() => setShowFormModal(false)}
            >
              <FaTimes className="text-xl" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-700">Create Learning Plan</h2>
            <div className="overflow-y-auto flex-grow">
              <LearningPlanForm onSubmit={handleAddPlan} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPlans; 