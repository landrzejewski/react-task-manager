import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { fetchTasks, createTask, updateTask } from '../utils/api';

// Create the context
const TaskContext = createContext();

// Custom hook to use the task context
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local storage for user preferences
  const [viewMode, setViewMode] = useLocalStorage('viewMode', 'kanban');
  const [lastRefresh, setLastRefresh] = useLocalStorage('lastRefresh', null);

  // Auto-refresh timer state
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch tasks on component mount and when dependencies change
  useEffect(() => {
    loadTasks();
  }, []);

  // Auto-refresh effect - demonstrates useEffect with cleanup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadTasks();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [autoRefresh]);

  // Memoized task statistics
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, overdue, completionRate };
  }, [tasks]);

  // Load tasks function with error handling
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedTasks = await fetchTasks();
      setTasks(fetchedTasks);
      setLastRefresh(new Date().toISOString());
    } catch (error) {
      setError({
        message: error.message || 'Failed to load tasks'
      });
    } finally {
      setIsLoading(false);
    }
  }, [setLastRefresh]);

  // Optimistic task creation
  const handleCreateTask = useCallback(async (taskData) => {
    setIsSubmitting(true);

    try {
      const newTask = await createTask(taskData);
      setTasks(prevTasks => [newTask, ...prevTasks]);
      setShowCreateModal(false);
    } catch (error) {
      setError({
        message: error.message || 'Failed to create task'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Optimistic task update
  const handleUpdateTask = useCallback(async (taskData) => {
    if (!editingTask) return;

    setIsSubmitting(true);
    const previousTasks = [...tasks];

    try {
      // Optimistically update UI
      const updatedTasks = tasks.map(task =>
        task.id === editingTask.id ? { ...task, ...taskData } : task
      );
      setTasks(updatedTasks);

      // Make API call
      await updateTask(editingTask.id, taskData);
      setShowEditModal(false);
      setEditingTask(null);
    } catch (error) {
      // Revert on error
      setTasks(previousTasks);
      setError({
        message: error.message || 'Failed to update task'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [editingTask, tasks]);

  // Handle task updates from TaskCard (optimistic updates)
  const handleTaskUpdate = useCallback((updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  }, []);

  // Handle task deletion
  const handleTaskDelete = useCallback((taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  // Handle edit task
  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setShowEditModal(true);
  }, []);

  // Memoized modal handlers to prevent unnecessary re-renders
  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingTask(null);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  // Keyboard shortcuts effect
  useEffect(() => {
    function handleKeyDown(event) {
      // Ctrl/Cmd + N to create new task
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        setShowCreateModal(true);
      }
      
      // Escape to close modals
      if (event.key === 'Escape') {
        if (showCreateModal) setShowCreateModal(false);
        if (showEditModal) setShowEditModal(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCreateModal, showEditModal]);

  // Document title effect
  useEffect(() => {
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    document.title = pendingTasks > 0 
      ? `Task Manager (${pendingTasks} pending)` 
      : 'Task Manager';
  }, [tasks]);

  // Notification effect for overdue tasks
  useEffect(() => {
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    });

    if (overdueTasks.length > 0) {
      // In a real app, you might show browser notifications here
      console.log(`You have ${overdueTasks.length} overdue tasks!`);
    }
  }, [tasks]);

    // Create the context value object with all the state and functions
  const contextValue = {
    // State
    tasks,
    isLoading,
    error,
    showCreateModal,
    showEditModal,
    editingTask,
    isSubmitting,
    viewMode,
    setViewMode,
    lastRefresh,
    autoRefresh,
    taskStats,
    
    // Functions
    setError,
    setAutoRefresh,
    loadTasks,
    handleCreateTask,
    handleUpdateTask,
    handleTaskUpdate,
    handleTaskDelete,
    handleEditTask,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleOpenCreateModal
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;
