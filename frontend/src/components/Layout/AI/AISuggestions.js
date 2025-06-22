import React, { useState } from 'react';
import { Brain, Lightbulb, Clock, Target, TrendingUp, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useTasks, useGenerateTaskSuggestions, useGenerateTaskBreakdown } from '../../hooks/useApi';
import { formatDate, getStatusColor, getPriorityColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AISuggestions = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [suggestions, setSuggestions] = useState([]);
  const [breakdown, setBreakdown] = useState(null);

  const { data: tasks, isLoading: tasksLoading } = useTasks({ status: 'pending,in-progress' });
  const generateSuggestionsMutation = useGenerateTaskSuggestions();
  const generateBreakdownMutation = useGenerateTaskBreakdown();

  const handleGenerateSuggestions = async (taskId) => {
    try {
      const response = await generateSuggestionsMutation.mutateAsync(taskId);
      setSuggestions(response.data.suggestions || []);
      setSelectedTask(tasks?.data?.find(t => t._id === taskId));
      setActiveTab('suggestions');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    }
  };

  const handleGenerateBreakdown = async (taskId) => {
    try {
      const response = await generateBreakdownMutation.mutateAsync(taskId);
      setBreakdown(response.data.breakdown);
      setSelectedTask(tasks?.data?.find(t => t._id === taskId));
      setActiveTab('breakdown');
    } catch (error) {
      toast.error('Failed to generate breakdown');
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'productivity':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'time-management':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'prioritization':
        return <Target className="w-5 h-5 text-purple-500" />;
      case 'optimization':
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      default:
        return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const mockInsights = [
    {
      type: 'productivity',
      title: 'Peak Productivity Hours',
      description: 'You tend to complete tasks faster between 9-11 AM. Consider scheduling high-priority tasks during this time.',
      impact: 'high'
    },
    {
      type: 'time-management',
      title: 'Task Duration Patterns',
      description: 'Tasks labeled as "1 hour" typically take 1.5 hours to complete. Adjust your time estimates accordingly.',
      impact: 'medium'
    },
    {
      type: 'prioritization',
      title: 'Priority Balance',
      description: 'You have 12 high-priority tasks pending. Consider breaking down or delegating some of them.',
      impact: 'high'
    },
    {
      type: 'optimization',
      title: 'Category Clustering',
      description: 'Batch similar tasks together. You could save 30% time by grouping "email" and "communication" tasks.',
      impact: 'medium'
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Brain },
    { id: 'suggestions', name: 'Task Suggestions', icon: Lightbulb },
    { id: 'breakdown', name: 'Task Breakdown', icon: Target },
  ];

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Suggestions</h1>
          <p className="text-gray-600">Get intelligent insights to optimize your productivity</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw size={16} />
          <span>Refresh Insights</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold">AI Insights</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockInsights.map((insight, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{insight.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            insight.impact === 'high' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {insight.impact} impact
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Tasks */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Your Active Tasks</h2>
              <div className="space-y-3">
                {tasks?.data?.slice(0, 5).map((task) => (
                  <div key={task._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority} priority
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500">
                            Due: {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleGenerateSuggestions(task._id)}
                        disabled={generateSuggestionsMutation.isLoading}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Get Suggestions
                      </button>
                      <button
                        onClick={() => handleGenerateBreakdown(task._id)}
                        disabled={generateBreakdownMutation.isLoading}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Break Down
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            {selectedTask && suggestions.length > 0 ? (
              <div className="card">
                <div className="flex items-center space-x-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-lg font-semibold">
                    Suggestions for: {selectedTask.title}
                  </h2>
                </div>
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-gray-900">{suggestion.title}</h3>
                          <p className="text-gray-600 mt-1">{suggestion.description}</p>
                          {suggestion.estimatedTimeReduction && (
                            <p className="text-sm text-green-600 mt-2">
                              ⏱️ Could save {suggestion.estimatedTimeReduction} minutes
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Suggestions Yet</h3>
                <p className="text-gray-600 mb-4">
                  Select a task from the overview tab to generate AI-powered suggestions.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="space-y-6">
            {selectedTask && breakdown ? (
              <div className="card">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-semibold">
                    Task Breakdown: {selectedTask.title}
                  </h2>
                </div>
                <div className="space-y-4">
                  {breakdown.steps?.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{step.title}</h3>
                        <p className="text-gray-600 mt-1">{step.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          {step.estimatedTime && (
                            <span className="text-sm text-blue-600">
                              ⏱️ {step.estimatedTime}
                            </span>
                          )}
                          {step.difficulty && (
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              step.difficulty === 'easy' 
                                ? 'bg-green-100 text-green-700'
                                : step.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {step.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {breakdown.totalEstimatedTime && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">
                      Total Estimated Time: {breakdown.totalEstimatedTime}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Breakdown Yet</h3>
                <p className="text-gray-600 mb-4">
                  Select a task from the overview tab to generate an AI-powered breakdown.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestions;