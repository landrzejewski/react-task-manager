import React, { useEffect, useCallback, useMemo } from 'react';
import TaskCard from './TaskCard';
import Button from './UI/Button';
import Input from './UI/Input';
import LoadingSpinner from './UI/LoadingSpinner';
import useLocalStorage from '../hooks/useLocalStorage';

/**
 * Task board component with filtering and search
 * Demonstrates: useEffect, useMemo, useCallback, localStorage persistence
 */
const TaskBoard = React.memo(function TaskBoard({ 
  tasks, 
  isLoading, 
  error, 
  onTaskUpdate, 
  onTaskDelete, 
  onEdit,
  onRefresh 
}) {
  const [searchTerm, setSearchTerm] = useLocalStorage('taskSearch', '');
  const [statusFilter, setStatusFilter] = useLocalStorage('statusFilter', 'all');
  const [priorityFilter, setPriorityFilter] = useLocalStorage('priorityFilter', 'all');
  const [sortBy, setSortBy] = useLocalStorage('taskSortBy', 'createdAt');
  const [sortOrder, setSortOrder] = useLocalStorage('taskSortOrder', 'desc');

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      // This would trigger a search in a real app
      // For now, we'll just filter locally
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoized filtered and sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    if (!tasks) return [];

    let filtered = tasks.filter(task => {
      // Search filter
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

      // Priority filter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue, bValue;

      // Define order mappings outside switch
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const statusOrder = { todo: 1, 'in-progress': 2, completed: 3 };
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'priority':
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          bValue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          break;
        case 'status':
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        default: // createdAt
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  // Group tasks by status for Kanban-style display
  const tasksByStatus = useMemo(() => {
    const grouped = {
      todo: [],
      'in-progress': [],
      completed: []
    };

    filteredAndSortedTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }, [filteredAndSortedTasks]);

  // Memoized statistics
  const stats = useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, inProgress: 0, overdue: 0 };

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return { total, completed, inProgress, overdue };
  }, [tasks]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
  }, [setSearchTerm, setStatusFilter, setPriorityFilter, setSortBy, setSortOrder]);

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Tasks</h2>
        <p>{error.message}</p>
        <Button onClick={onRefresh}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="task-board">
      {/* Statistics */}
      <div className="task-stats">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.inProgress}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item overdue">
          <span className="stat-number">{stats.overdue}</span>
          <span className="stat-label">Overdue</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="task-filters">
        <div className="filter-row">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="createdAt">Created Date</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="status">Status</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="filter-select"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          <Button
            variant="secondary"
            size="small"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={onRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-container">
          <LoadingSpinner size="large" />
          <p>Loading tasks...</p>
        </div>
      )}

      {/* Task Columns (Kanban Style) */}
      {!isLoading && (
        <div className="task-columns">
          <div className="task-column">
            <div className="column-header">
              <h3>To Do</h3>
              <span className="task-count">{tasksByStatus.todo.length}</span>
            </div>
            <div className="column-content">
              {tasksByStatus.todo.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskUpdate={onTaskUpdate}
                  onTaskDelete={onTaskDelete}
                  onEdit={onEdit}
                />
              ))}
              {tasksByStatus.todo.length === 0 && (
                <div className="empty-column">
                  <p>No tasks in this column</p>
                </div>
              )}
            </div>
          </div>

          <div className="task-column">
            <div className="column-header">
              <h3>In Progress</h3>
              <span className="task-count">{tasksByStatus['in-progress'].length}</span>
            </div>
            <div className="column-content">
              {tasksByStatus['in-progress'].map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskUpdate={onTaskUpdate}
                  onTaskDelete={onTaskDelete}
                  onEdit={onEdit}
                />
              ))}
              {tasksByStatus['in-progress'].length === 0 && (
                <div className="empty-column">
                  <p>No tasks in this column</p>
                </div>
              )}
            </div>
          </div>

          <div className="task-column">
            <div className="column-header">
              <h3>Completed</h3>
              <span className="task-count">{tasksByStatus.completed.length}</span>
            </div>
            <div className="column-content">
              {tasksByStatus.completed.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskUpdate={onTaskUpdate}
                  onTaskDelete={onTaskDelete}
                  onEdit={onEdit}
                />
              ))}
              {tasksByStatus.completed.length === 0 && (
                <div className="empty-column">
                  <p>No tasks in this column</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAndSortedTasks.length === 0 && tasks && tasks.length > 0 && (
        <div className="empty-state">
          <h3>No tasks match your filters</h3>
          <p>Try adjusting your search or filter criteria</p>
          <Button onClick={handleClearFilters}>Clear All Filters</Button>
        </div>
      )}

      {!isLoading && (!tasks || tasks.length === 0) && (
        <div className="empty-state">
          <h3>No tasks yet</h3>
          <p>Create your first task to get started!</p>
        </div>
      )}
    </div>
  );
});

export default TaskBoard;
