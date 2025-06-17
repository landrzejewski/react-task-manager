import React from 'react';
import TaskBoard from './components/TaskBoard';
import TaskForm from './components/TaskForm';
import Modal from './components/UI/Modal';
import Button from './components/UI/Button';
import LoadingSpinner from './components/UI/LoadingSpinner';
import { useTaskContext } from './context/TaskContext';
import './App.css';

/**
 * Main App component demonstrating comprehensive React concepts
 * Demonstrates: All major React concepts from the topics directory
 */
function App() {
  // Use the task context
  const {
    tasks,
    isLoading,
    error,
    showCreateModal,
    showEditModal,
    editingTask,
    lastRefresh,
    autoRefresh,
    taskStats,
    setError,
    setAutoRefresh,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleOpenCreateModal
  } = useTaskContext();

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
              onClick={handleOpenCreateModal}
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

        <TaskBoard />
      </main>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        title="Create New Task"
        className="task-modal"
      >
        <TaskForm onCancel={handleCloseCreateModal} />
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
