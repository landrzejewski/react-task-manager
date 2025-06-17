import React from 'react';

/**
 * Loading spinner component
 * Demonstrates: Simple reusable component
 */
const LoadingSpinner = React.memo(function LoadingSpinner({ 
  size = 'medium', 
  className = '' 
}) {
  return (
    <div className={`loading-spinner loading-spinner-${size} ${className}`}>
      <div className="spinner"></div>
    </div>
  );
});

export default LoadingSpinner;
