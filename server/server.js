import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage (in a real app, you'd use a database)
let tasks = [
  {
    id: '1',
    title: 'Learn React Hooks',
    description: 'Study useEffect, useState, and custom hooks',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2025-01-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub1', title: 'Read useEffect documentation', completed: true },
      { id: 'sub2', title: 'Practice custom hooks', completed: false }
    ],
    tags: ['react', 'learning'],
    assignee: 'John Doe'
  },
  {
    id: '2',
    title: 'Build Task Manager',
    description: 'Create a comprehensive task management application',
    status: 'todo',
    priority: 'medium',
    dueDate: '2025-01-25',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub3', title: 'Setup backend API', completed: true },
      { id: 'sub4', title: 'Create React components', completed: false },
      { id: 'sub5', title: 'Add form validation', completed: false }
    ],
    tags: ['project', 'development'],
    assignee: 'Jane Smith'
  }
];

let reminders = [
  {
    id: 'rem1',
    taskId: '1',
    message: 'Don\'t forget to complete your React learning!',
    reminderTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    isActive: true
  }
];

// API Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
  const { status, priority, search } = req.query;
  
  let filteredTasks = [...tasks];
  
  if (status) {
    filteredTasks = filteredTasks.filter(task => task.status === status);
  }
  
  if (priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === priority);
  }
  
  if (search) {
    filteredTasks = filteredTasks.filter(task => 
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json(filteredTasks);
});

// Get single task
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Create new task
app.post('/api/tasks', (req, res) => {
  const { title, description, priority = 'medium', dueDate, tags = [], assignee } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const newTask = {
    id: uuidv4(),
    title,
    description: description || '',
    status: 'todo',
    priority,
    dueDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    tags,
    assignee: assignee || ''
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const updatedTask = {
    ...tasks[taskIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Add subtask
app.post('/api/tasks/:id/subtasks', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Subtask title is required' });
  }
  
  const newSubtask = {
    id: uuidv4(),
    title,
    completed: false
  };
  
  task.subtasks.push(newSubtask);
  task.updatedAt = new Date().toISOString();
  
  res.status(201).json(newSubtask);
});

// Update subtask
app.put('/api/tasks/:taskId/subtasks/:subtaskId', (req, res) => {
  const task = tasks.find(t => t.id === req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const subtaskIndex = task.subtasks.findIndex(st => st.id === req.params.subtaskId);
  if (subtaskIndex === -1) {
    return res.status(404).json({ error: 'Subtask not found' });
  }
  
  task.subtasks[subtaskIndex] = {
    ...task.subtasks[subtaskIndex],
    ...req.body
  };
  task.updatedAt = new Date().toISOString();
  
  res.json(task.subtasks[subtaskIndex]);
});

// Delete subtask
app.delete('/api/tasks/:taskId/subtasks/:subtaskId', (req, res) => {
  const task = tasks.find(t => t.id === req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const subtaskIndex = task.subtasks.findIndex(st => st.id === req.params.subtaskId);
  if (subtaskIndex === -1) {
    return res.status(404).json({ error: 'Subtask not found' });
  }
  
  task.subtasks.splice(subtaskIndex, 1);
  task.updatedAt = new Date().toISOString();
  
  res.status(204).send();
});

// Reminders API
app.get('/api/reminders', (req, res) => {
  res.json(reminders);
});

app.post('/api/reminders', (req, res) => {
  const { taskId, message, reminderTime } = req.body;
  
  if (!taskId || !message || !reminderTime) {
    return res.status(400).json({ error: 'TaskId, message, and reminderTime are required' });
  }
  
  const newReminder = {
    id: uuidv4(),
    taskId,
    message,
    reminderTime,
    isActive: true
  };
  
  reminders.push(newReminder);
  res.status(201).json(newReminder);
});

app.delete('/api/reminders/:id', (req, res) => {
  const reminderIndex = reminders.findIndex(r => r.id === req.params.id);
  if (reminderIndex === -1) {
    return res.status(404).json({ error: 'Reminder not found' });
  }
  
  reminders.splice(reminderIndex, 1);
  res.status(204).send();
});

// Get task statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length
  };
  
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
