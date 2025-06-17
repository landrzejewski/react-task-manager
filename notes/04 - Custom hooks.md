# Understanding Custom Hooks in React

## Introduction

Custom hooks are one of React's most powerful features, allowing developers to extract and reuse stateful logic across components. They enable better code organization, improved reusability, and cleaner components by separating concerns.

This guide explores how to create and use custom hooks effectively, with practical examples and best practices to help you leverage this powerful pattern in your React applications.

## Introduction to React Hooks

React Hooks were introduced in React 16.8 to allow developers to use state and other React features without writing class components. Hooks are functions that let you "hook into" React state and lifecycle features from function components.

### Core React Hooks

The most commonly used built-in hooks include:

- **`useState`**: For managing state in functional components
  ```jsx
  const [count, setCount] = useState(0);
  ```

- **`useEffect`**: For handling side effects (data fetching, subscriptions, DOM manipulation)
  ```jsx
  useEffect(() => {
    document.title = `Count: ${count}`;
    return () => { /* cleanup */ };
  }, [count]);
  ```

- **`useRef`**: For creating mutable references that persist across renders
  ```jsx
  const inputRef = useRef(null);
  // Later: inputRef.current.focus();
  ```

- **`useContext`**: For consuming context values
  ```jsx
  const theme = useContext(ThemeContext);
  ```

- **`useReducer`**: For complex state logic management
  ```jsx
  const [state, dispatch] = useReducer(reducer, initialState);
  ```

- **`useCallback`** and **`useMemo`**: For performance optimizations
  ```jsx
  const memoizedCallback = useCallback(() => {
    doSomething(a, b);
  }, [a, b]);
  
  const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
  ```

### Why Hooks Matter

Hooks solve several problems in React development:

1. **Reusing Stateful Logic**: Before hooks, patterns like render props and higher-order components were needed to reuse stateful logic. Hooks make this much simpler.

2. **Complex Components**: Class components could become unwieldy with related logic scattered across different lifecycle methods. Hooks let you organize code by what it does rather than when it runs.

3. **Classes Confusion**: Classes can be confusing with `this` binding issues and boilerplate code. Hooks work with JavaScript closures and don't require classes.

4. **Optimization Barriers**: Hooks provide more direct ways to optimize rendering performance without restructuring component hierarchies.

## Creating Custom Hooks

Custom hooks are JavaScript functions that start with "use" and may call other hooks. They allow you to extract component logic into reusable functions, enabling better code organization and reuse across components.

### What Makes a Custom Hook?

A custom hook is essentially a JavaScript function that:
1. Has a name starting with "use" (by convention)
2. May call other React hooks (built-in or custom)
3. Encapsulates stateful logic that can be reused across components

### Rules for Custom Hooks

1. **Naming Convention**: Custom hook names must start with "use" (e.g., `useFetch`, `useLocalStorage`). This is not just a convention but helps React's linting tools identify hooks and enforce the rules of hooks.

2. **Hook Composition**: Custom hooks can call other hooks, both built-in and custom. This allows for powerful composition patterns.

3. **Hook Rules Apply**: Custom hooks must follow the same rules as built-in hooks:
   - Only call hooks at the top level (not inside loops, conditions, or nested functions)
   - Only call hooks from React function components or other custom hooks

4. **Return Values**: Custom hooks can return any value (objects, arrays, primitives, functions, etc.). The return value structure should be designed for the hook's specific use case.

5. **Isolation**: Each component that uses a custom hook gets its own isolated state. Calling the same hook from different components doesn't share state.

### Basic Custom Hook Structure

```jsx
function useMyCustomHook(initialValue) {
  // Call React hooks
  const [state, setState] = useState(initialValue);
  
  // Add any logic
  function updateState(newValue) {
    console.log('Updating state from:', state, 'to:', newValue);
    setState(newValue);
  }
  
  // Optionally use useEffect for side effects
  useEffect(() => {
    console.log('State changed to:', state);
    // Any side effects...
    
    return () => {
      // Any cleanup...
    };
  }, [state]);
  
  // Return values and/or functions
  return {
    state,
    updateState
  };
}
```

### Simple Custom Hook Example

Here's a simple custom hook that manages a toggle state:

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);
  
  const setTrue = useCallback(() => {
    setValue(true);
  }, []);
  
  const setFalse = useCallback(() => {
    setValue(false);
  }, []);
  
  return [value, toggle, setTrue, setFalse];
}

// Usage in a component
function ToggleComponent() {
  const [isOn, toggle, turnOn, turnOff] = useToggle();
  
  return (
    <div>
      <p>The switch is {isOn ? 'ON' : 'OFF'}</p>
      <button onClick={toggle}>Toggle</button>
      <button onClick={turnOn}>Turn On</button>
      <button onClick={turnOff}>Turn Off</button>
    </div>
  );
}
```

### Benefits of Custom Hooks

1. **Reusability**: Extract logic that can be used across multiple components
2. **Composition**: Combine multiple hooks to create more powerful abstractions
3. **Abstraction**: Hide complex implementation details behind a simple interface
4. **Testing**: Isolate logic for easier testing
5. **Separation of Concerns**: Keep components focused on rendering, not logic

## Common Custom Hook Patterns

Custom hooks can be categorized based on their purpose and behavior. Understanding these common patterns will help you design your own custom hooks effectively.

### State Management Hooks

These hooks encapsulate state logic and provide a clean interface for components to interact with that state.

#### useToggle

```jsx
function useToggle(initialState = false) {
  const [state, setState] = useState(initialState);
  
  const toggle = useCallback(() => {
    setState(state => !state);
  }, []);
  
  return [state, toggle];
}

// Usage
function ExpandableSection({ title, children }) {
  const [isExpanded, toggleExpanded] = useToggle(false);
  
  return (
    <div className="expandable-section">
      <div className="header" onClick={toggleExpanded}>
        <h3>{title}</h3>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && <div className="content">{children}</div>}
    </div>
  );
}
```

#### useLocalStorage

```jsx
function useLocalStorage(key, initialValue) {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue];
}

// Usage
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}
```

### Side Effect Hooks

These hooks encapsulate side effects like data fetching, subscriptions, or DOM manipulations.

#### useDocumentTitle

```jsx
function useDocumentTitle(title) {
  useEffect(() => {
    // Save the original title
    const originalTitle = document.title;
    // Set the new title
    document.title = title;
    
    // Reset on cleanup
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}

// Usage
function BlogPost({ post }) {
  useDocumentTitle(post ? `${post.title} - My Blog` : 'Loading...');
  
  return (
    <article>
      {post ? (
        <>
          <h1>{post.title}</h1>
          <p>{post.content}</p>
        </>
      ) : (
        <p>Loading post...</p>
      )}
    </article>
  );
}
```

#### useInterval

```jsx
function useInterval(callback, delay) {
  const savedCallback = useRef();
  
  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// Usage
function Timer() {
  const [count, setCount] = useState(0);
  
  useInterval(() => {
    setCount(count + 1);
  }, 1000);
  
  return <h1>{count}</h1>;
}
```

### Browser API Hooks

These hooks provide a React-friendly interface to browser APIs.

#### useMediaQuery

```jsx
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const handler = (event) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);
  
  return matches;
}

// Usage
function ResponsiveLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className={`layout ${isMobile ? 'mobile' : 'desktop'}`}>
      {isMobile ? <MobileNavigation /> : <DesktopNavigation />}
      <main>Content</main>
    </div>
  );
}
```

#### useOnClickOutside

```jsx
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      
      handler(event);
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Usage
function Dropdown({ isOpen, setIsOpen, children }) {
  const ref = useRef();
  
  useOnClickOutside(ref, () => setIsOpen(false));
  
  return (
    <div ref={ref} className={`dropdown ${isOpen ? 'open' : ''}`}>
      {children}
    </div>
  );
}
```

### Form Handling Hooks

These hooks simplify form state management and validation.

#### useForm

```jsx
function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    reset
  };
}

// Usage
function SignupForm() {
  const { values, handleChange, handleBlur } = useForm({
    email: '',
    password: ''
  });
  
  return (
    <form>
      <input
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <input
        type="password"
        name="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

## Example: Creating a useFetch Hook

Let's create a custom hook for data fetching, a common use case in React applications:

```jsx
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    async function fetchData() {
      try {
        setLoading(true);
        
        const response = await fetch(url, {
          ...options,
          signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const json = await response.json();
        
        if (!signal.aborted) {
          setData(json);
          setError(null);
        }
      } catch (error) {
        if (!signal.aborted) {
          setError(error.message);
          setData(null);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }
    
    fetchData();
    
    return () => {
      controller.abort();
    };
  }, [url, JSON.stringify(options)]);

  return { data, loading, error };
}

// Usage
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`https://api.example.com/users/${userId}`);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

This hook:
1. Manages loading, error, and data states
2. Handles the fetch request and JSON parsing
3. Provides cleanup via AbortController
4. Re-fetches when the URL or options change

## Composing Multiple Hooks

Custom hooks can be composed together to create more powerful abstractions:

```jsx
function useUserData(userId) {
  // Reuse our useFetch hook
  const { data, loading, error } = useFetch(`https://api.example.com/users/${userId}`);
  
  // Reuse our useLocalStorage hook for caching
  const [cachedUser, setCachedUser] = useLocalStorage(`user-${userId}`, null);
  
  // Combine the hooks with additional logic
  useEffect(() => {
    if (data && !loading) {
      setCachedUser(data);
    }
  }, [data, loading, setCachedUser]);
  
  // Return combined data
  return {
    user: data || cachedUser,
    loading,
    error,
    isStale: !data && !!cachedUser
  };
}

// Usage
function UserProfile({ userId }) {
  const { user, loading, error, isStale } = useUserData(userId);
  
  if (loading && !user) return <div>Loading...</div>;
  if (error && !user) return <div>Error: {error}</div>;
  
  return (
    <div>
      {isStale && <div className="banner">Using cached data</div>}
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

## Best Practices for Custom Hooks

1. **Keep Hooks Simple**: Each hook should do one thing well.
2. **Descriptive Naming**: Name hooks clearly based on what they do (e.g., `useLocalStorage`, `useWindowSize`).
3. **Return Consistent Values**: Return values in a consistent format (object, array, etc.).
4. **Handle Loading and Error States**: Include loading and error states in your hooks.
5. **Provide Default Values**: Always provide sensible default values for state.
6. **Document Your Hooks**: Add comments or documentation explaining how to use your hooks.
7. **Test Your Hooks**: Write tests for your custom hooks to ensure they work as expected.

### Example: A Simple useLocalStorage Hook

```jsx
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // Get stored value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  // Update localStorage when storedValue changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setStoredValue];
}

export default useLocalStorage;
```

### Using the useLocalStorage Hook

```jsx
import useLocalStorage from './hooks/useLocalStorage';

function ThemeSelector() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

## Conclusion

Custom hooks are a powerful feature in React that allow you to extract and reuse stateful logic across components. By understanding and leveraging custom hooks, you can write more maintainable, reusable, and cleaner React code.

The `useEffect` hook in particular is a key building block for many custom hooks, enabling you to handle side effects in a controlled and predictable way. For a deeper understanding of `useEffect`, refer to the "01 - Effects.md" document.

By creating your own custom hooks, you can encapsulate complex logic, improve code organization, and build a library of reusable functionality for your React applications.
