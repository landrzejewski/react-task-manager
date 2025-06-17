import { useState, useEffect } from 'react';

/**
 * Custom hook for data fetching with loading and error states
 * Demonstrates: Custom hooks, useEffect, HTTP communication
 */
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();
    
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError({
            message: error.message || 'Failed to fetch data'
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
    
    // Cleanup function to cancel request if component unmounts
    return () => {
      controller.abort();
    };
  }, [url, JSON.stringify(options)]);

  const refetch = () => {
    if (url) {
      setData(null);
      setError(null);
      // Trigger useEffect by creating a new options object
      setIsLoading(true);
    }
  };

  return { data, isLoading, error, refetch };
}

export default useFetch;
