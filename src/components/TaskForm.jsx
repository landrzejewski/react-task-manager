import React, { useState, useCallback } from 'react';
import { Input, Select, Textarea, Button } from './UI';
import useInput from '../hooks/useInput';
import { isNotEmpty, isValidPriority } from '../utils/validation';
import { useTaskContext } from '../context/TaskContext';

/**
 * Task form component with comprehensive form handling
 * Demonstrates: Form handling, validation, custom hooks, useCallback optimization
 */
const TaskForm = React.memo(function TaskForm({ 
  initialData = {}, 
  onCancel 
}) {
  // Use the task context
  const {
    isSubmitting: isLoading,
    handleCreateTask,
    handleUpdateTask
  } = useTaskContext();
  
  // Determine if we're editing or creating
  const isEditing = !!initialData.id;
  const onSubmit = isEditing ? handleUpdateTask : handleCreateTask;
  // Using custom useInput hook for form fields with validation
  const {
    value: title,
    hasError: titleHasError,
    handleChange: handleTitleChange,
    handleBlur: handleTitleBlur,
    reset: resetTitle
  } = useInput(initialData.title || '', (value) => isNotEmpty(value));

  const {
    value: description,
    handleChange: handleDescriptionChange,
    reset: resetDescription
  } = useInput(initialData.description || '');

  const {
    value: priority,
    hasError: priorityHasError,
    handleChange: handlePriorityChange,
    handleBlur: handlePriorityBlur,
    reset: resetPriority
  } = useInput(initialData.priority || 'medium', (value) => isValidPriority(value));

  const {
    value: dueDate,
    handleChange: handleDueDateChange,
    reset: resetDueDate
  } = useInput(initialData.dueDate || '');

  const {
    value: assignee,
    handleChange: handleAssigneeChange,
    reset: resetAssignee
  } = useInput(initialData.assignee || '');

  const [tags, setTags] = useState(initialData.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Memoized handlers to prevent unnecessary re-renders
  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const handleTagInputKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  const resetForm = useCallback(() => {
    resetTitle();
    resetDescription();
    resetPriority();
    resetDueDate();
    resetAssignee();
    setTags([]);
    setTagInput('');
  }, [resetTitle, resetDescription, resetPriority, resetDueDate, resetAssignee]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    
    // Final validation check
    if (titleHasError || priorityHasError || !isNotEmpty(title)) {
      return;
    }

    const formData = {
      title,
      description,
      priority,
      dueDate: dueDate || null,
      assignee,
      tags
    };

    onSubmit(formData);
    
    // Reset form after successful submission (if it's a create form)
    if (!initialData.id) {
      resetForm();
    }
  }, [
    title, description, priority, dueDate, assignee, tags,
    titleHasError, priorityHasError, onSubmit, initialData.id, resetForm
  ]);

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <Input
        label="Task Title *"
        id="title"
        type="text"
        value={title}
        onChange={handleTitleChange}
        onBlur={handleTitleBlur}
        error={titleHasError ? 'Title is required' : null}
        placeholder="Enter task title"
        required
      />

      <Textarea
        label="Description"
        id="description"
        value={description}
        onChange={handleDescriptionChange}
        placeholder="Enter task description"
        rows={4}
      />

      <div className="form-row">
        <Select
          label="Priority *"
          id="priority"
          value={priority}
          onChange={handlePriorityChange}
          onBlur={handlePriorityBlur}
          error={priorityHasError ? 'Please select a valid priority' : null}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }
          ]}
        />

        <Input
          label="Due Date"
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={handleDueDateChange}
        />
      </div>

      <Input
        label="Assignee"
        id="assignee"
        type="text"
        value={assignee}
        onChange={handleAssigneeChange}
        placeholder="Enter assignee name"
      />

      <div className="input-group">
        <label className="input-label">Tags</label>
        <div className="tag-input-container">
          <Input
            id="tagInput"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagInputKeyPress}
            placeholder="Add a tag and press Enter"
          />
          <Button 
            type="button" 
            variant="secondary" 
            size="small"
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
          >
            Add Tag
          </Button>
        </div>
        
        {tags.length > 0 && (
          <div className="tags-list">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove ${tag} tag`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <Button
          type="submit"
          loading={isLoading}
          disabled={titleHasError || priorityHasError || !isNotEmpty(title)}
        >
          {initialData.id ? 'Update Task' : 'Create Task'}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
});

export default TaskForm;
