import React, { useState, useEffect } from 'react';
import LearningPlanForm from './LearningPlanForm';
import LearningPlanList from './LearningPlanList';
import apiService from '../../services/api';

const LearningPlans = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      .then(res => setPlans(prev => [...prev, res.data || res]))
      .catch(() => setError('Failed to create plan'))
      .finally(() => setLoading(false));
  };

  const handleDeletePlan = (planId) => {
    setLoading(true);
    apiService.deleteLearningPlan(planId)
      .then(() => setPlans(prev => prev.filter(p => p.id !== planId)))
      .catch(() => setError('Failed to delete plan'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-24">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Learning Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Create a New Plan</h2>
            <LearningPlanForm onSubmit={handleAddPlan} />
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Your Plans</h2>
            {loading && <div className="text-blue-500">Loading...</div>}
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <LearningPlanList plans={plans} onSelect={setSelectedPlan} />
            {selectedPlan && (
              <div className="mt-6 p-4 border rounded bg-blue-50">
                <h3 className="font-bold text-blue-700 mb-2">Selected Plan:</h3>
                <div className="mb-1">{selectedPlan.title}</div>
                <div className="mb-1 text-sm text-gray-600">{selectedPlan.description}</div>
                <ul className="list-disc ml-5 mt-2">
                  {selectedPlan.topics.map((topic, idx) => (
                    <li key={idx} className="mb-1">
                      <span className="font-semibold">{topic.name}</span> - {topic.resources} <span className="text-xs text-gray-500">({topic.timeline})</span>
                      {typeof topic.completed !== 'undefined' && (
                        <span className={topic.completed ? 'text-green-600 ml-2' : 'text-gray-400 ml-2'}>
                          {topic.completed ? '✓ Completed' : 'In Progress'}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <button
                  className="mt-4 px-3 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleDeletePlan(selectedPlan.id)}
                >
                  Delete Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPlans; 