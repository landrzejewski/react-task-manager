import React, { useState, useCallback, useMemo } from 'react';
import Button from './UI/Button';
import { updateTask, deleteTask, updateSubtask, createSubtask, deleteSubtask } from '../utils/api';

/**
 * Task card component with optimistic updates and progress tracking
 * Demonstrates: useMemo, useCallback, optimistic updates, progress calculation
 */
const TaskCard = React.memo(function TaskCard({ 
  task, 
  onTaskUpdate, 
  onTaskDelete, 
  onEdit 
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);

  // Memoized progress calculation to avoid recalculation on every render
  const progress = useMemo(() => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.status === 'completed' ? 100 : 0;
    }
    
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  }, [task.subtasks, task.status]);

  // Memoized priority color to avoid recalculation
  const priorityColor = useMemo(() => {
    switch (task.priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  }, [task.priority]);

  // Memoized due date status
  const dueDateStatus = useMemo(() => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'overdue', text: `${Math.abs(diffDays)} days overdue` };
    if (diffDays === 0) return { status: 'today', text: 'Due today' };
    if (diffDays <= 3) return { status: 'soon', text: `Due in ${diffDays} days` };
    return { status: 'future', text: `Due in ${diffDays} days` };
  }, [task.dueDate]);

  // Optimistic status update
  const handleStatusChange = useCallback(async (newStatus) => {
    const previousTask = { ...task };
    
    // Optimistically update the UI
    onTaskUpdate({ ...task, status: newStatus });
    
    try {
      setIsUpdating(true);
      await updateTask(task.id, { status: newStatus });
    } catch (error) {
      // Revert on error
      onTaskUpdate(previousTask);
      console.error('Failed to update task status:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [task, onTaskUpdate]);

  // Optimistic subtask toggle
  const handleSubtaskToggle = useCallback(async (subtaskId) => {
    const previousTask = { ...task };
    const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
    
    if (subtaskIndex === -1) return;
    
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex] = {
      ...updatedSubtasks[subtaskIndex],
      completed: !updatedSubtasks[subtaskIndex].completed
    };
    
    // Optimistically update the UI
    onTaskUpdate({ ...task, subtasks: updatedSubtasks });
    
    try {
      await updateSubtask(task.id, subtaskId, { 
        completed: updatedSubtasks[subtaskIndex].completed 
      });
    } catch (error) {
      // Revert on error
      onTaskUpdate(previousTask);
      console.error('Failed to update subtask:', error);
    }
  }, [task, onTaskUpdate]);

  // Add new subtask
  const handleAddSubtask = useCallback(async (event) => {
    event.preventDefault();
    
    if (!newSubtaskTitle.trim()) return;
    
    const previousTask = { ...task };
    const tempSubtask = {
      id: `temp-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    
    // Optimistically add subtask to UI
    onTaskUpdate({ 
      ...task, 
      subtasks: [...task.subtasks, tempSubtask] 
    });
    
    try {
      const createdSubtask = await createSubtask(task.id, { title: newSubtaskTitle.trim() });
      
      // Replace temp subtask with real one
      const updatedSubtasks = task.subtasks.map(st => 
        st.id === tempSubtask.id ? createdSubtask : st
      );
      onTaskUpdate({ ...task, subtasks: [...task.subtasks, createdSubtask] });
      
      setNewSubtaskTitle('');
      setShowSubtaskForm(false);
    } catch (error) {
      // Revert on error
      onTaskUpdate(previousTask);
      console.error('Failed to create subtask:', error);
    }
  }, [task, onTaskUpdate, newSubtaskTitle]);

  // Delete subtask
  const handleDeleteSubtask = useCallback(async (subtaskId) => {
    const previousTask = { ...task };
    
    // Optimistically remove from UI
    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
    onTaskUpdate({ ...task, subtasks: updatedSubtasks });
    
    try {
      await deleteSubtask(task.id, subtaskId);
    } catch (error) {
      // Revert on error
      onTaskUpdate(previousTask);
      console.error('Failed to delete subtask:', error);
    }
  }, [task, onTaskUpdate]);

  // Delete task
  const handleDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      setIsUpdating(true);
      await deleteTask(task.id);
      onTaskDelete(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setIsUpdating(false);
    }
  }, [task.id, onTaskDelete]);

  return (
    <div className="task-card">
      <div className="task-card-header">
        <div className="task-title-section">
          <h3 className="task-title">{task.title}</h3>
          <div 
            className="priority-indicator" 
            style={{ backgroundColor: priorityColor }}
            title={`Priority: ${task.priority}`}
          />
        </div>
        
        <div className="task-actions">
          <Button
            variant="secondary"
            size="small"
            onClick={() => onEdit(task)}
            disabled={isUpdating}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={handleDelete}
            loading={isUpdating}
          >
            Delete
          </Button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div className="task-status">
          <label htmlFor={`status-${task.id}`}>Status:</label>
          <select
            id={`status-${task.id}`}
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdating}
            className="status-select"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {task.assignee && (
          <div className="task-assignee">
            <strong>Assignee:</strong> {task.assignee}
          </div>
        )}

        {dueDateStatus && (
          <div className={`task-due-date ${dueDateStatus.status}`}>
            <strong>Due:</strong> {dueDateStatus.text}
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="task-progress">
        <div className="progress-header">
          <span>Progress: {progress}%</span>
          <span>{task.subtasks?.filter(st => st.completed).length || 0} / {task.subtasks?.length || 0} subtasks</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Subtasks */}
      <div className="task-subtasks">
        <div className="subtasks-header">
          <h4>Subtasks</h4>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setShowSubtaskForm(!showSubtaskForm)}
          >
            {showSubtaskForm ? 'Cancel' : 'Add Subtask'}
          </Button>
        </div>

        {showSubtaskForm && (
          <form onSubmit={handleAddSubtask} className="subtask-form">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Enter subtask title"
              className="input"
              autoFocus
            />
            <Button type="submit" size="small" disabled={!newSubtaskTitle.trim()}>
              Add
            </Button>
          </form>
        )}

        {task.subtasks && task.subtasks.length > 0 && (
          <ul className="subtasks-list">
            {task.subtasks.map(subtask => (
              <li key={subtask.id} className="subtask-item">
                <label className="subtask-checkbox">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleSubtaskToggle(subtask.id)}
                  />
                  <span className={subtask.completed ? 'completed' : ''}>
                    {subtask.title}
                  </span>
                </label>
                <button
                  className="subtask-delete"
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  aria-label="Delete subtask"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

export default TaskCard;
