/**
 * API utility functions for HTTP communication
 * Demonstrates: HTTP communication, error handling, async operations
 */

const API_BASE_URL = 'http://localhost:3001/api';

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Task API functions
export async function fetchTasks(filters = {}) {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });

  const endpoint = `/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiRequest(endpoint);
}

export async function fetchTask(id) {
  return apiRequest(`/tasks/${id}`);
}

export async function createTask(taskData) {
  return apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

export async function updateTask(id, taskData) {
  return apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
}

export async function deleteTask(id) {
  return apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

// Subtask API functions
export async function createSubtask(taskId, subtaskData) {
  return apiRequest(`/tasks/${taskId}/subtasks`, {
    method: 'POST',
    body: JSON.stringify(subtaskData),
  });
}

export async function updateSubtask(taskId, subtaskId, subtaskData) {
  return apiRequest(`/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: 'PUT',
    body: JSON.stringify(subtaskData),
  });
}

export async function deleteSubtask(taskId, subtaskId) {
  return apiRequest(`/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: 'DELETE',
  });
}

// Reminder API functions
export async function fetchReminders() {
  return apiRequest('/reminders');
}

export async function createReminder(reminderData) {
  return apiRequest('/reminders', {
    method: 'POST',
    body: JSON.stringify(reminderData),
  });
}

export async function deleteReminder(id) {
  return apiRequest(`/reminders/${id}`, {
    method: 'DELETE',
  });
}

// Statistics API function
export async function fetchStats() {
  return apiRequest('/stats');
}
