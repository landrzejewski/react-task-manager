import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TaskBoard from './components/TaskBoard';
import TaskForm from './components/TaskForm';
import Modal from './components/UI/Modal';
import Button from './components/UI/Button';
import LoadingSpinner from './components/UI/LoadingSpinner';
import useFetch from './hooks/useFetch';
import useLocalStorage from './hooks/useLocalStorage';
import { fetchTasks, createTask, updateTask } from './utils/api';
import './App.css';

/**
 * Main App component demonstrating comprehensive React concepts
 * Demonstrates: All major React concepts from the topics directory
 */
function App() {
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

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Task Manager</h1>
            <div className="header-stats">
              <span className="stat">
                {taskStats.completed}/{taskStats.total} completed
              </span>
              <span className="stat">
                {taskStats.completionRate}% completion rate
              </span>
              {taskStats.overdue > 0 && (
                <span className="stat overdue">
                  {taskStats.overdue} overdue
                </span>
              )}
            </div>
          </div>

          <div className="header-actions">
            <div className="view-controls">
              <label className="auto-refresh-toggle">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Auto-refresh
              </label>
              
              {lastRefresh && (
                <span className="last-refresh">
                  Last updated: {new Date(lastRefresh).toLocaleTimeString()}
                </span>
              )}
            </div>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="create-task-btn"
            >
              + New Task
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {error && (
          <div className="error-banner">
            <span>{error.message}</span>
            <button 
              className="error-close"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        <TaskBoard
          tasks={tasks}
          isLoading={isLoading}
          error={error}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onEdit={handleEditTask}
          onRefresh={loadTasks}
        />
      </main>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        title="Create New Task"
        className="task-modal"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          isLoading={isSubmitting}
          onCancel={handleCloseCreateModal}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Edit Task"
        className="task-modal"
      >
        {editingTask && (
          <TaskForm
            initialData={editingTask}
            onSubmit={handleUpdateTask}
            isLoading={isSubmitting}
            onCancel={handleCloseEditModal}
          />
        )}
      </Modal>

      {/* Global Loading Overlay */}
      {isLoading && tasks.length === 0 && (
        <div className="global-loading">
          <LoadingSpinner size="large" />
          <p>Loading your tasks...</p>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="keyboard-shortcuts">
        <small>
          Shortcuts: <kbd>Ctrl+N</kbd> New Task, <kbd>Esc</kbd> Close Modal
        </small>
      </div>
    </div>
  );
}

export default App;
