import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Tag,
  MoreVertical
} from 'lucide-react';
import { 
  formatDate, 
  formatRelativeTime, 
  getPriorityColor, 
  getStatusColor, 
  truncateText,
  isDueSoon,
  isOverdue 
} from '../../utils/helpers';
import { useUpdateTask, useDeleteTask } from '../../hooks/useApi';

const TaskItem = ({ task, onEdit, onView }) => {
  const [showMenu, setShowMenu] = useState(false);
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const handleStatusToggle = async () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTaskMutation.mutateAsync({
        id: task._id,
        status: newStatus
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(task._id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
    setShowMenu(false);
  };

  const handleEdit = () => {
    onEdit(task);
    setShowMenu(false);
  };

  const handleView = () => {
    onView(task);
    setShowMenu(false);
  };

  const priorityColorClass = getPriorityColor(task.priority);
  const statusColorClass = getStatusColor(task.status);
  const isTaskOverdue = isOverdue(task.dueDate);
  const isTaskDueSoon = isDueSoon(task.dueDate);

  return (
    <div className={`task-card ${task.priority ? `priority-${task.priority}` : ''} fade-in relative`}>
      {/* Task Status Toggle */}
      <div className="flex items-start space-x-3">
        <button
          onClick={handleStatusToggle}
          className="mt-1 flex-shrink-0 transition-colors"
          disabled={updateTaskMutation.isLoading}
        >
          {task.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Menu */}
          <div className="flex items-start justify-between">
            <h3 
              className={`text-lg font-medium cursor-pointer hover:text-blue-600 transition-colors ${
                task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
              onClick={handleView}
            >
              {task.title}
            </h3>
            
            {/* More Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={handleView}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    <button
                      onClick={handleEdit}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Task
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      disabled={deleteTaskMutation.isLoading}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className={`mt-1 text-sm ${
              task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {truncateText(task.description, 120)}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  +{task.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Task Meta Information */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4">
              {/* Priority */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColorClass}`}>
                {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Normal'}
              </span>

              {/* Status */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClass}`}>
                {task.status ? task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Pending'}
              </span>

              {/* Category */}
              {task.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {task.category}
                </span>
              )}
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center text-xs ${
                isTaskOverdue 
                  ? 'text-red-600' 
                  : isTaskDueSoon 
                    ? 'text-yellow-600' 
                    : 'text-gray-500'
              }`}>
                {isTaskOverdue && <AlertCircle className="w-3 h-3 mr-1" />}
                {isTaskDueSoon && !isTaskOverdue && <Clock className="w-3 h-3 mr-1" />}
                {!isTaskOverdue && !isTaskDueSoon && <Calendar className="w-3 h-3 mr-1" />}
                <span className="font-medium">
                  {formatDate(task.dueDate)}
                </span>
              </div>
            )}
          </div>

          {/* Due Soon/Overdue Alert */}
          {(isTaskOverdue || isTaskDueSoon) && task.status !== 'completed' && (
            <div className={`mt-2 p-2 rounded-md text-xs ${
              isTaskOverdue 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}>
              <div className="flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {isTaskOverdue 
                  ? `Overdue by ${formatRelativeTime(task.dueDate).replace('ago', '').trim()}`
                  : 'Due soon!'
                }
              </div>
            </div>
          )}

          {/* Creation/Update Info */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-xs text-gray-400">
            <span>
              Created {formatRelativeTime(task.createdAt)}
            </span>
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <span>
                Updated {formatRelativeTime(task.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {(updateTaskMutation.isLoading || deleteTaskMutation.isLoading) && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default TaskItem;
