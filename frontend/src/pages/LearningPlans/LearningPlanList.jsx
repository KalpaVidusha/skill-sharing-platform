import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaChevronRight, FaCheck, FaClock } from 'react-icons/fa';

const LearningPlanList = ({ plans, onSelect }) => {
  const navigate = useNavigate();
  
  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FaGraduationCap className="mx-auto text-4xl text-gray-300 mb-3" />
        <div className="text-gray-500 mb-2">No learning plans yet.</div>
        <p className="text-sm text-gray-400 max-w-xs mx-auto">
          Create your first learning plan to start tracking your learning journey.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {plans.map((plan, idx) => {
        // Calculate completion percentage
        const totalTopics = plan.topics?.length || 0;
        const completedTopics = plan.topics?.filter(t => t.completed)?.length || 0;
        const percentComplete = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
        
        return (
          <div
            key={plan.id || idx}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div 
                onClick={() => navigate(`/userdashboard/learning-plans/${plan.id}`)} 
                className="flex-1 cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-blue-800 hover:text-blue-600 transition-colors">
                  {plan.title}
                </h3>
                
                <p className="text-gray-600 mb-2 line-clamp-2 text-sm">{plan.description}</p>
                
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-2">
                  <div 
                    className="h-1.5 bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentComplete}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 justify-between">
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center">
                      {percentComplete === 100 ? (
                        <><FaCheck className="text-green-500 mr-1" /> Completed</>
                      ) : (
                        <><FaClock className="text-yellow-500 mr-1" /> In Progress</>
                      )}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{completedTopics} of {totalTopics} topics</span>
                  </div>
                  
                  <div className="text-xs text-blue-500">
                    {new Date(plan.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  className="px-3 py-1.5 flex items-center gap-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
                  onClick={() => navigate(`/userdashboard/learning-plans/${plan.id}`)}
                >
                  View <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LearningPlanList; 