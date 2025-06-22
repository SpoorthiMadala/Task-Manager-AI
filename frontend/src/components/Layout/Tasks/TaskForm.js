import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Flag, Tag, Brain, Loader2 } from 'lucide-react';
import { useCreateTask, useUpdateTask, useGenerateTaskDescription, useCategorizeTask } from '../../hooks/useApi';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TaskForm = ({ task, onClose, onSuccess }) => {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isCategorizingTask, setIsCategorizingTask] = useState(false);
  
  const isEditing = !!task;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      status: task?.status || 'pending',
      category: task?.category || '',
      dueDate: task?.dueDate ? formatDate(task.dueDate) : '',
      tags: task?.tags?.join(', ') || '',
    },
  });

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const generateDescriptionMutation = useGenerateTaskDescription();
  const categorizeTaskMutation = useCategorizeTask();

  const watchedTitle = watch('title');
  const watchedDescription = watch('description');

  useEffect(() => {
    if (task) {
      reset({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        category: task.category || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        tags: task.tags?.join(', ') || '',
      });
    }
  }, [task, reset]);

  const handleGenerateDescription = async () => {
    if (!watchedTitle.trim()) {
      toast.error('Please enter a task title first');
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const response = await generateDescriptionMutation.mutateAsync({
        title: watchedTitle,
        context: watchedDescription || '',
      });
      
      setValue('description', response.data.description);
      toast.success('Description generated successfully!');
    } catch (error) {
      toast.error('Failed to generate description');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleCategorizeTask = async () => {
    if (!watchedTitle.trim()) {
      toast.error('Please enter a task title first');
      return;
    }

    setIsCategorizingTask(true);
    try {
      const response = await categorizeTaskMutation.mutateAsync({
        title: watchedTitle,
        description: watchedDescription || '',
      });
      
      setValue('category', response.data.category);
      toast.success('Task categorized successfully!');
    } catch (error) {
      toast.error('Failed to categorize task');
    } finally {
      setIsCategorizingTask(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const taskData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };

      if (isEditing) {
        await updateTaskMutation.mutateAsync({ id: task._id, ...taskData });
      } else {
        await createTaskMutation.mutateAsync(taskData);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const isLoading = createTaskMutation.isLoading || updateTaskMutation.isLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              className="input-field"
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDescription || !watchedTitle.trim()}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
              >
                {isGeneratingDescription ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Brain size={16} />
                )}
                <span>Generate with AI</span>
              </button>
            </div>
            <textarea
              {...register('description')}
              rows={4}
              className="input-field resize-none"
              placeholder="Describe your task in detail..."
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Flag size={16} className="inline mr-1" />
                Priority
              </label>
              <select {...register('priority')} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select {...register('status')} className="input-field">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Category and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Tag size={16} className="inline mr-1" />
                  Category
                </label>
                <button
                  type="button"
                  onClick={handleCategorizeTask}
                  disabled={isCategorizingTask || !watchedTitle.trim()}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                >
                  {isCategorizingTask ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Brain size={16} />
                  )}
                  <span>Auto-categorize</span>
                </button>
              </div>
              <input
                {...register('category')}
                type="text"
                className="input-field"
                placeholder="e.g., Work, Personal, Health"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Due Date
              </label>
              <input
                {...register('dueDate')}
                type="date"
                className="input-field"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              {...register('tags')}
              type="text"
              className="input-field"
              placeholder="Enter tags separated by commas"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple tags with commas (e.g., urgent, meeting, client)
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              <span>{isEditing ? 'Update Task' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;