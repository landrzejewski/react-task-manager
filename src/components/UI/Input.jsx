import React from 'react';

/**
 * Reusable Input component
 * Demonstrates: Component composition, reusable components, form handling
 */
const Input = React.memo(function Input({ 
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
      <input
        id={id}
        className={`input ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

export default Input;
