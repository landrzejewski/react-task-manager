# HTTP Communication in React

## Introduction

Modern web applications rely heavily on communication with servers to provide dynamic, interactive experiences. In React applications, HTTP communication is a fundamental aspect of building real-world apps that can fetch, create, update, and delete data.

This guide covers everything you need to know about handling HTTP requests in React, from basic data fetching to advanced patterns like optimistic updates and proper error handling.

### Why HTTP Communication Matters in React

React is primarily concerned with the view layer of your application, but most applications need to:
- Fetch data from APIs to display to users
- Send user input to servers for processing or storage
- Update or delete existing data on the server
- Synchronize client state with server state

Since these operations are asynchronous and involve side effects (network requests), they require special handling in React's component lifecycle to ensure your UI remains responsive and consistent.

## Introduction to HTTP in React

React applications often need to communicate with servers to:
- Fetch data to display (GET requests)
- Send user input to be processed or stored (POST requests)
- Update existing data (PUT/PATCH requests)
- Delete data (DELETE requests)

Since these operations are asynchronous and involve side effects (network requests), they require special handling in React's component lifecycle. Poorly managed HTTP requests can lead to:

- Race conditions where outdated data overwrites newer data
- Memory leaks from requests that complete after a component unmounts
- Poor user experience due to lack of loading indicators or error messages
- Unnecessary network requests that waste bandwidth and slow down the application

This guide will show you how to handle these challenges effectively in your React applications.

## The Fetch API

Modern React applications typically use the built-in Fetch API for HTTP requests. The Fetch API provides a cleaner, more powerful alternative to the older XMLHttpRequest.

### Basic Fetch Requests

```jsx
// Basic GET request
fetch('https://api.example.com/data')
  .then(response => {
    // Always check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Request Methods

Fetch supports all standard HTTP methods:

```jsx
// POST request with JSON data
fetch('https://api.example.com/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token-here'
  },
  body: JSON.stringify({ name: 'New Item', value: 42 }),
})
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));

// PUT request to update data
fetch('https://api.example.com/items/123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'Updated Item', value: 99 }),
})
  .then(response => response.json())
  .then(data => console.log('Updated:', data))
  .catch(error => console.error('Error:', error));

// DELETE request
fetch('https://api.example.com/items/123', {
  method: 'DELETE',
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.text();
  })
  .then(data => console.log('Deleted:', data))
  .catch(error => console.error('Error:', error));
```

### Using Async/Await with Fetch

Modern JavaScript allows for cleaner syntax using async/await:

```jsx
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Fetching data failed:', error);
    throw error; // Re-throw to allow calling code to handle it
  }
}
```

### Request Configuration Options

Fetch accepts a second parameter with configuration options:

```jsx
fetch('https://api.example.com/data', {
  method: 'GET', // *GET, POST, PUT, DELETE, etc.
  mode: 'cors', // no-cors, *cors, same-origin
  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  credentials: 'same-origin', // include, *same-origin, omit
  headers: {
    'Content-Type': 'application/json',
    'API-Key': 'your-api-key-here'
  },
  redirect: 'follow', // manual, *follow, error
  referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, etc.
  body: JSON.stringify(data) // body data type must match "Content-Type" header
});
```

### Handling Different Response Types

Fetch can handle various response formats:

```jsx
// JSON response
const jsonData = await response.json();

// Text response
const textData = await response.text();

// Binary data (Blob)
const blobData = await response.blob();

// Form data
const formData = await response.formData();

// Array buffer
const arrayBuffer = await response.arrayBuffer();
```

## Using useEffect for HTTP Requests

In React, the `useEffect` hook is commonly used for handling HTTP requests. For a comprehensive understanding of `useEffect`, refer to the "01 - Effects.md" document. This section focuses specifically on how to use `useEffect` for HTTP requests.

### Basic Pattern for Data Fetching

The most common pattern is fetching data when a component mounts:

```jsx
import { useState, useEffect } from 'react';

function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Set loading state before fetching
    setIsLoading(true);
    setError(null);
    
    fetch('http://localhost:3000/places')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch places');
        }
        return response.json();
      })
      .then((resData) => {
        setAvailablePlaces(resData.places);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setIsLoading(false);
      });
  }, []); // Empty dependency array means this runs once after initial render
  
  // Render based on state
  if (isLoading) {
    return <p>Loading places...</p>;
  }
  
  if (error) {
    return <p>Error: {error}</p>;
  }
  
  return (
    <div>
      <h2>Available Places</h2>
      <ul>
        {availablePlaces.map(place => (
          <li key={place.id} onClick={() => onSelectPlace(place)}>
            {place.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Using Async/Await with useEffect

Since the effect callback cannot be async directly, define an async function inside:

```jsx
useEffect(() => {
  async function fetchPlaces() {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/places');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const resData = await response.json();
      setAvailablePlaces(resData.places);
    } catch (error) {
      setError(error.message || 'Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  }
  
  fetchPlaces();
  
  // Optional cleanup function
  return () => {
    // This runs if the component unmounts before the fetch completes
  };
}, []);
```

### Fetching Data Based on Props or State

When you need to fetch data when props or state change:

```jsx
function UserProfile({ userId }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Re-fetch whenever userId changes
  useEffect(() => {
    if (!userId) return; // Skip effect if userId is not provided
    
    setIsLoading(true);
    
    fetch(`https://api.example.com/users/${userId}`)
      .then(response => response.json())
      .then(data => {
        setUserData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user:', error);
        setIsLoading(false);
      });
  }, [userId]); // Re-run effect when userId changes
  
  if (isLoading) return <p>Loading user data...</p>;
  if (!userData) return <p>No user data available</p>;
  
  return (
    <div>
      <h2>{userData.name}</h2>
      <p>Email: {userData.email}</p>
    </div>
  );
}
```

## Error Handling

Proper error handling is crucial for HTTP requests to provide a good user experience and help with debugging. Without proper error handling, your application might:

- Display blank screens or incomplete data
- Fail silently without informing users
- Crash entirely
- Make it difficult to diagnose issues

### Comprehensive Error Handling

A robust error handling approach includes:

1. Checking for network errors
2. Validating HTTP status codes
3. Handling expected API error responses
4. Providing user-friendly error messages
5. Logging detailed errors for debugging

```jsx
function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    async function fetchPlaces() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Network errors will be caught in the catch block
        const response = await fetch('http://localhost:3000/places');
        
        // Check for HTTP error status
        if (!response.ok) {
          // Get more specific error information if available
          let errorMessage = `Server error: ${response.status}`;
          
          try {
            // Try to parse error details from response
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            // If parsing fails, use default message
            console.error('Error parsing error response:', e);
          }
          
          throw new Error(errorMessage);
        }
        
        // Parse the successful response
        const resData = await response.json();
        
        // Validate the response data structure
        if (!resData.places || !Array.isArray(resData.places)) {
          throw new Error('Invalid data format received from server');
        }
        
        setAvailablePlaces(resData.places);
      } catch (error) {
        console.error('Fetch error:', error);
        
        // Set user-friendly error message
        setError({
          title: 'Failed to load places',
          message: error.message || 'Could not fetch places, please try again later.',
          technical: error.toString() // For debugging
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPlaces();
  }, []);
  
  // Show error UI
  if (error) {
    return (
      <div className="error-container">
        <h2>{error.title}</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }
  
  // Show loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Show empty state
  if (availablePlaces.length === 0) {
    return <p>No places available at the moment.</p>;
  }
  
  // Show successful data
  return (
    <div className="places-list">
      {availablePlaces.map(place => (
        <PlaceItem 
          key={place.id} 
          place={place} 
          onSelect={() => onSelectPlace(place)} 
        />
      ))}
    </div>
  );
}
```

### Error Boundaries for React Components

For handling rendering errors (not API errors), you can use React Error Boundaries:

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
    // You could also log to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>The application encountered an error. Please try again later.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary>
      <AvailablePlaces onSelectPlace={handleSelectPlace} />
    </ErrorBoundary>
  );
}
```

### Retry Logic

For transient errors, implementing retry logic can improve reliability:

```jsx
function useDataFetching(url, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { maxRetries = 3, retryDelay = 1000 } = options;
  
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    
    const fetchWithRetry = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        console.error(`Attempt ${retryCount + 1} failed:`, err);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying in ${retryDelay}ms...`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          // Try again
          if (isMounted) {
            await fetchWithRetry();
          }
        } else if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchWithRetry();
    
    return () => {
      isMounted = false;
    };
  }, [url, maxRetries, retryDelay]);
  
  return { data, error, isLoading };
}
```

## Loading States

Adding loading indicators improves user experience by:
- Providing feedback that something is happening
- Preventing users from thinking the application is frozen
- Setting expectations about waiting time
- Reducing perceived loading time

### Basic Loading State

```jsx
function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchPlaces() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('http://localhost:3000/places');
        
        if (!response.ok) {
          throw new Error('Failed to fetch places');
        }
        
        const resData = await response.json();
        setAvailablePlaces(resData.places);
      } catch (error) {
        setError({
          message: error.message || 'Could not fetch places, please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPlaces();
  }, []);
  
  if (error) {
    return <Error title="An error occurred!" message={error.message} />;
  }
  
  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading={isLoading}
      loadingText="Fetching place data..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
```

### Advanced Loading States

For a better user experience, you can implement more sophisticated loading states:

#### Skeleton Loading

Skeleton loaders mimic the layout of the content that will eventually appear:

```jsx
function PlacesSkeleton() {
  return (
    <div className="places-skeleton">
      <div className="skeleton-header" />
      {Array(5).fill(0).map((_, index) => (
        <div key={index} className="skeleton-item">
          <div className="skeleton-image" />
          <div className="skeleton-text" />
          <div className="skeleton-text short" />
        </div>
      ))}
    </div>
  );
}

function AvailablePlaces({ onSelectPlace }) {
  // ... state and effect as before
  
  if (isLoading) {
    return <PlacesSkeleton />;
  }
  
  // ... rest of component
}
```

#### Delayed Loading Indicator

To prevent flickering for fast loads, you can delay showing the loading indicator:

```jsx
function useDelayedLoading(isLoading, delay = 300) {
  const [showLoading, setShowLoading] = useState(false);
  
  useEffect(() => {
    let timer;
    
    if (isLoading) {
      timer = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    } else {
      setShowLoading(false);
    }
    
    return () => clearTimeout(timer);
  }, [isLoading, delay]);
  
  return showLoading;
}

function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const showLoading = useDelayedLoading(isLoading);
  
  // ... fetch logic
  
  return (
    <div>
      {showLoading ? (
        <LoadingSpinner />
      ) : (
        <PlacesList places={availablePlaces} onSelectPlace={onSelectPlace} />
      )}
    </div>
  );
}
```

#### Loading Progress Indicator

For operations that take a long time, showing progress can improve user experience:

```jsx
function FileUploader() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  async function uploadFile(file) {
    setIsUploading(true);
    setProgress(0);
    
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress(percentComplete);
      }
    });
    
    xhr.addEventListener('load', () => {
      setIsUploading(false);
      // Handle successful upload
    });
    
    xhr.addEventListener('error', () => {
      setIsUploading(false);
      // Handle error
    });
    
    xhr.open('POST', 'https://api.example.com/upload');
    
    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  }
  
  return (
    <div>
      <input type="file" onChange={(e) => uploadFile(e.target.files[0])} />
      
      {isUploading && (
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }} 
          />
          <span>{progress}%</span>
        </div>
      )}
    </div>
  );
}
```

## Extracting HTTP Logic

For cleaner code, extract API calls to separate functions:

```jsx
// http.js
export async function fetchAvailablePlaces() {
  const response = await fetch('http://localhost:3000/places');
  const resData = await response.json();
  
  if (!response.ok) {
    throw new Error('Failed to fetch places');
  }
  
  return resData.places;
}

// Component
import { fetchAvailablePlaces } from '../http.js';

function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchPlaces() {
      setIsLoading(true);
      
      try {
        const places = await fetchAvailablePlaces();
        setAvailablePlaces(places);
      } catch (error) {
        setError({
          message: error.message || 'Could not fetch places.',
        });
      }
      
      setIsLoading(false);
    }
    
    fetchPlaces();
  }, []);
  
  // Component JSX
}
```

## Sending Data

For POST, PUT, or DELETE requests:

```jsx
// http.js
export async function updateUserPlaces(places) {
  const response = await fetch('http://localhost:3000/user-places', {
    method: 'PUT',
    body: JSON.stringify({ places }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error('Failed to update user data.');
  }

  return resData.message;
}

// Component
import { updateUserPlaces } from './http.js';

async function handleSelectPlace(selectedPlace) {
  try {
    setUserPlaces(prevPlaces => [selectedPlace, ...prevPlaces]);
    await updateUserPlaces([selectedPlace, ...userPlaces]);
  } catch (error) {
    // Handle error
  }
}
```

## Optimistic Updates

Optimistic updates improve user experience by updating the UI immediately before the server confirms the change:

```jsx
async function handleSelectPlace(selectedPlace) {
  // 1. Store the current state for potential rollback
  const previousPlaces = userPlaces;
  
  // 2. Update the UI immediately (optimistically)
  setUserPlaces((prevPickedPlaces) => {
    if (!prevPickedPlaces) {
      prevPickedPlaces = [];
    }
    if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
      return prevPickedPlaces;
    }
    return [selectedPlace, ...prevPickedPlaces];
  });

  // 3. Attempt the actual server update
  try {
    await updateUserPlaces([selectedPlace, ...userPlaces]);
    // Success! No need to do anything as UI is already updated
  } catch (error) {
    // 4. If the server update fails, revert to previous state
    setUserPlaces(previousPlaces);
    setErrorUpdatingPlaces({
      message: error.message || 'Failed to update places.',
    });
  }
}
```

## Deleting Data

Handling deletion with optimistic updates:

```jsx
const handleRemovePlace = useCallback(
  async function handleRemovePlace() {
    // 1. Optimistically remove from UI
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter(
        (place) => place.id !== selectedPlace.current.id
      )
    );

    // 2. Attempt server update
    try {
      await updateUserPlaces(
        userPlaces.filter((place) => place.id !== selectedPlace.current.id)
      );
    } catch (error) {
      // 3. Revert on failure
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({
        message: error.message || 'Failed to delete place.',
      });
    }

    setModalIsOpen(false);
  },
  [userPlaces] // Include userPlaces in dependencies
);
```

## Cleanup in useEffect

Prevent memory leaks and race conditions with cleanup functions:

```jsx
useEffect(() => {
  const controller = new AbortController();
  
  async function fetchPlaces() {
    try {
      const response = await fetch('http://localhost:3000/places', {
        signal: controller.signal
      });
      // Process response...
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Handle error
      }
    }
  }
  
  fetchPlaces();
  
  // Cleanup function
  return () => {
    controller.abort(); // Cancel the fetch if component unmounts
  };
}, []);
```

## Best Practices

### 1. Keep Effects Focused

Each effect should do one thing. Split complex logic into multiple effects:

```jsx
// One effect for fetching places
useEffect(() => {
  fetchPlaces();
}, []);

// Separate effect for analytics
useEffect(() => {
  logPageView();
}, []);
```

### 2. Handle Loading and Error States

Always manage loading and error states for better UX:

```jsx
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

// Then in your JSX:
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage message={error.message} />}
{!isLoading && !error && data && <DataDisplay data={data} />}
```

### 3. Extract Reusable HTTP Logic

Consider creating custom hooks for common HTTP patterns:

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchData() {
      setIsLoading(true);
      
      try {
        const response = await fetch(url, {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error('Request failed');
        }
        
        const responseData = await response.json();
        setData(responseData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError(error);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
    
    return () => {
      controller.abort();
    };
  }, [url]);

  return { data, isLoading, error };
}

// Usage:
function MyComponent() {
  const { data, isLoading, error } = useFetch('https://api.example.com/data');
  
  // Use the data, loading, and error states
}
```

### 4. Avoid Race Conditions

When dependencies change rapidly, use cleanup functions to cancel outdated requests:

```jsx
useEffect(() => {
  let isMounted = true;
  
  fetchData().then(result => {
    if (isMounted) {
      setData(result);
    }
  });
  
  return () => {
    isMounted = false;
  };
}, [fetchData]);
```

### 5. Consider Using Libraries

For complex data fetching needs, consider libraries like:
- React Query
- SWR
- Apollo Client (for GraphQL)

These provide caching, automatic retries, and other advanced features.

## Common Mistakes

1. **Missing Dependencies**: React's linter will warn about missing dependencies
2. **Unnecessary Effects**: Not all state updates need to happen in effects
3. **Dependency Array Mistakes**: Including objects or functions that change on every render
4. **Forgetting Cleanup**: Leading to memory leaks or unexpected behavior
5. **Race Conditions**: Not handling multiple in-flight requests properly

## Conclusion

HTTP communication is a fundamental part of most React applications. By combining `useEffect` with proper state management, error handling, and optimistic updates, you can create responsive and user-friendly applications that interact seamlessly with backend services.

Remember that while the patterns shown here work well for many applications, more complex apps might benefit from specialized data fetching libraries that provide additional features like caching, automatic retries, and optimized state management.
