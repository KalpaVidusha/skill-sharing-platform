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
    <div className="space-y-5 overflow-visible">
      {plans.map((plan, idx) => {
        const totalTopics = plan.topics?.length || 0;
        const completedTopics = plan.topics?.filter(t => t.completed)?.length || 0;
        const percentComplete = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
        
        return (
          <div
            key={plan.id || idx}
            className="p-5 bg-white rounded-xl shadow-xs border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group transform hover:scale-105 hover:z-10 hover:-translate-y-1 cursor-pointer relative"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div 
                onClick={() => navigate(`/userdashboard/learning-plans/${plan.id}`)} 
                className="flex-1 cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {plan.title}
                  </h3>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(plan.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <p className="text-gray-500 line-clamp-2 text-sm leading-relaxed">
                  {plan.description}
                </p>
                
                {/* Progress bar with indicator */}
                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${percentComplete}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center ${percentComplete === 100 ? 'text-green-500' : 'text-blue-500'}`}>
                        {percentComplete === 100 ? (
                          <>
                            <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Completed
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {percentComplete}% Complete
                          </>
                        )}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {completedTopics}/{totalTopics} topics
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex md:flex-col gap-2 md:gap-1.5 justify-end">
                <button
                  onClick={() => navigate(`/userdashboard/learning-plans/${plan.id}`)}
                  className="px-3 py-1.5 flex items-center gap-1.5 bg-white border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-xs transition-all shadow-xs hover:shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
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