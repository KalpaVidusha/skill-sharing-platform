import React from 'react';
import { useNavigate } from 'react-router-dom';

const LearningPlanList = ({ plans }) => {
  const navigate = useNavigate();
  if (!plans || plans.length === 0) {
    return <div className="text-gray-500">No learning plans yet.</div>;
  }
  return (
    <div className="space-y-4">
      {plans.map((plan, idx) => (
        <div
          key={plan.id || idx}
          className="p-4 bg-white rounded-lg shadow border flex flex-col md:flex-row md:items-center md:justify-between hover:bg-blue-50 transition cursor-pointer"
        >
          <div onClick={() => navigate(`/learning-plans/${plan.id}`)} className="flex-1 cursor-pointer">
            <h3 className="text-lg font-semibold text-blue-800">{plan.title}</h3>
            <p className="text-gray-600 mb-1 line-clamp-2">{plan.description}</p>
            <div className="text-xs text-gray-400">{plan.topics?.length || 0} tasks</div>
          </div>
          <button
            className="mt-2 md:mt-0 md:ml-4 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            onClick={() => navigate(`/learning-plans/${plan.id}`)}
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );
};

export default LearningPlanList; 