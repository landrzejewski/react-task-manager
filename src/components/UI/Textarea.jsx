import React from 'react';

/**
 * Reusable Textarea component
 * Demonstrates: Component composition, reusable components, form handling
 */
const Textarea = React.memo(function Textarea({ 
  label, 
  id, 
  error, 
  className = '', 
  ...props 
}) {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`input ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

export default Textarea;
