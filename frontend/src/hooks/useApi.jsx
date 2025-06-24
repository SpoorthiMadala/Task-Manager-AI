import { useQuery, useMutation, useQueryClient } from 'react-query';
import { tasksAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';

// Tasks hooks
export const useTasks = (filters = {}) => {
  return useQuery(['tasks', filters], () => tasksAPI.getTasks(filters), {
    staleTime: 30000,
  });
};

export const useTask = (id) => {
  return useQuery(['task', id], () => tasksAPI.getTask(id), {
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation(tasksAPI.createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      toast.success('Task created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create task');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, ...data }) => tasksAPI.updateTask(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        toast.success('Task updated successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update task');
      },
    }
  );
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation(tasksAPI.deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      toast.success('Task deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    },
  });
};

export const useTaskStats = () => {
  return useQuery('taskStats', tasksAPI.getTaskStats);
};

// AI hooks
export const useGenerateTaskSuggestions = () => {
  return useMutation(aiAPI.generateSuggestions, {
    onSuccess: () => {
      toast.success('AI suggestions generated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate suggestions');
    },
  });
};

export const useGenerateTaskDescription = () => {
  return useMutation(aiAPI.generateDescription, {
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate description');
    },
  });
};

export const useGenerateTaskBreakdown = () => {
  return useMutation(aiAPI.generateBreakdown, {
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate breakdown');
    },
  });
};

export const useCategorizeTask = () => {
  return useMutation(aiAPI.categorizeTask, {
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to categorize task');
    },
  });
};
