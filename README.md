# React Task Manager

A comprehensive task management application built with React and Node.js that demonstrates all major React concepts and best practices. This application resembles Trello in functionality and showcases modern React development patterns.

## 🚀 Features

- **Task Management**: Create, edit, delete, and organize tasks
- **Kanban Board**: Visual task organization with drag-and-drop-like interface
- **Subtasks**: Break down tasks into smaller, manageable pieces
- **Progress Tracking**: Visual progress bars and completion statistics
- **Filtering & Search**: Advanced filtering by status, priority, and search terms
- **Real-time Updates**: Optimistic updates for better user experience
- **Reminders**: Set and manage task reminders
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Efficient navigation with keyboard shortcuts
- **Data Persistence**: Local storage for user preferences
- **Auto-refresh**: Optional automatic data refreshing

## 🎯 React Concepts Demonstrated

This application showcases all the React concepts from the topics directory:

### 1. Effects (useEffect)
- **Data fetching** on component mount and updates
- **Cleanup functions** for event listeners and timers
- **Auto-refresh timer** with proper cleanup
- **Document title updates** based on pending tasks
- **Keyboard shortcuts** event handling
- **Notification effects** for overdue tasks
- **Debounced search** implementation

### 2. Rendering and Optimizations
- **React.memo** for preventing unnecessary re-renders
- **useMemo** for expensive calculations (progress, statistics, filtered data)
- **useCallback** for memoizing event handlers
- **Component keys** for efficient list rendering
- **Conditional rendering** for different UI states
- **Performance optimization** patterns

### 3. HTTP Communication
- **Fetch API** integration with error handling
- **Loading states** management
- **Optimistic updates** for better UX
- **Error handling** and recovery
- **API abstraction** in utility functions
- **Request cancellation** with AbortController

### 4. Custom Hooks
- **useFetch**: Reusable data fetching with loading/error states
- **useLocalStorage**: Persistent state management
- **useInput**: Form input handling with validation
- **Separation of concerns** between UI and logic

### 5. Forms Handling
- **Controlled components** with useState
- **Form validation** with custom validation functions
- **Real-time validation** on blur and change events
- **Dynamic form fields** (tags, subtasks)
- **Form submission** with loading states
- **Error display** and user feedback

### 6. Form Actions (Modern React Patterns)
- **Optimistic updates** for immediate UI feedback
- **Error handling** with rollback functionality
- **Loading states** during form submission
- **Form state management** with proper validation

## 🏗️ Architecture

### Backend (Node.js + Express)
- RESTful API with full CRUD operations
- In-memory data storage (easily replaceable with database)
- Error handling and validation
- CORS enabled for frontend communication

### Frontend (React)
- Component-based architecture
- Custom hooks for reusable logic
- Utility functions for API calls and validation
- Responsive CSS with modern design patterns

## 📁 Project Structure

```
react-task-manager/
├── server/                 # Backend API
│   ├── package.json
│   └── server.js
├── src/
│   ├── components/         # React components
│   │   ├── UI/            # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── TaskBoard.jsx  # Main task board
│   │   ├── TaskCard.jsx   # Individual task card
│   │   └── TaskForm.jsx   # Task creation/editing form
│   ├── hooks/             # Custom React hooks
│   │   ├── useFetch.js
│   │   ├── useInput.js
│   │   └── useLocalStorage.js
│   ├── utils/             # Utility functions
│   │   ├── api.js         # API communication
│   │   └── validation.js  # Form validation
│   ├── App.jsx           # Main application component
│   ├── App.css           # Application styles
│   └── main.jsx          # Application entry point
└── topics/               # React concept documentation
    ├── 01 - Effects.md
    ├── 02 - Rendering and optimalizations.md
    ├── 03 - Http communication.md
    ├── 04 - Custom hooks.md
    ├── 05 - Forms handling.md
    └── 06 - Form actions.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-task-manager
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The API will be available at `http://localhost:3001`

2. **Start the frontend development server** (in a new terminal)
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## 🎮 Usage

### Keyboard Shortcuts
- `Ctrl/Cmd + N`: Create new task
- `Escape`: Close modals

### Task Management
1. **Create Task**: Click "New Task" button or use Ctrl+N
2. **Edit Task**: Click "Edit" button on any task card
3. **Update Status**: Use the dropdown on task cards
4. **Add Subtasks**: Click "Add Subtask" on task cards
5. **Filter Tasks**: Use the search and filter controls
6. **Track Progress**: View progress bars and statistics

### Features in Detail

#### Optimistic Updates
The application uses optimistic updates for better user experience:
- Task status changes appear immediately
- Subtask toggles update instantly
- If the server request fails, changes are reverted

#### Data Persistence
- User preferences (filters, sort order) are saved to localStorage
- Search terms and view settings persist across sessions

#### Real-time Features
- Auto-refresh option for live data updates
- Progress calculations update in real-time
- Statistics update as tasks change

## 🧪 React Concepts in Action

### useEffect Examples
```javascript
// Data fetching with cleanup
useEffect(() => {
  const controller = new AbortController();
  
  async function fetchData() {
    // Fetch logic
  }
  
  fetchData();
  
  return () => controller.abort();
}, []);

// Auto-refresh timer
useEffect(() => {
  if (!autoRefresh) return;
  
  const interval = setInterval(loadTasks, 30000);
  return () => clearInterval(interval);
}, [autoRefresh]);
```

### Performance Optimizations
```javascript
// Memoized calculations
const taskStats = useMemo(() => {
  // Expensive calculations
}, [tasks]);

// Memoized event handlers
const handleTaskUpdate = useCallback((updatedTask) => {
  // Update logic
}, []);

// Memoized components
const TaskCard = React.memo(function TaskCard({ task }) {
  // Component logic
});
```

### Custom Hooks
```javascript
// Reusable data fetching
const { data, isLoading, error } = useFetch('/api/tasks');

// Form input management
const { value, hasError, handleChange } = useInput('', validator);

// Persistent state
const [preferences, setPreferences] = useLocalStorage('prefs', {});
```

## 🎨 Design Patterns

- **Component Composition**: Reusable UI components
- **Render Props**: Flexible component patterns
- **Custom Hooks**: Logic extraction and reuse
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful error handling
- **Responsive Design**: Mobile-first approach

## 🔧 Technologies Used

### Frontend
- React 19.1.0
- Vite (build tool)
- Modern CSS with Flexbox/Grid
- Custom hooks and context

### Backend
- Node.js
- Express.js
- UUID for unique IDs
- CORS for cross-origin requests

## 📚 Learning Resources

The `topics/` directory contains detailed explanations of all React concepts demonstrated in this application:

1. **Effects**: Understanding useEffect and side effects
2. **Rendering and Optimizations**: Performance patterns
3. **HTTP Communication**: Data fetching and API integration
4. **Custom Hooks**: Creating reusable logic
5. **Forms Handling**: Form management and validation
6. **Form Actions**: Modern form patterns

## 🤝 Contributing

This project is designed for learning React concepts. Feel free to:
- Add new features that demonstrate additional React patterns
- Improve existing implementations
- Add more comprehensive examples
- Enhance documentation

## 📄 License

This project is created for educational purposes and demonstrates React best practices and patterns.
