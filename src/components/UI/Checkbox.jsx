import React from 'react';

/**
 * Reusable Checkbox component
 * Demonstrates: Component composition, reusable components, form handling
 */
const Checkbox = React.memo(function Checkbox({ 
  label, 
  id, 
  error, 
  className = '', 
  ...props 
}) {
  return (
    <div className={`checkbox-group ${className}`}>
      <div className="checkbox-container">
        <input
          type="checkbox"
          id={id}
          className={`checkbox ${error ? 'checkbox-error' : ''}`}
          {...props}
        />
        {label && (
          <label htmlFor={id} className="checkbox-label">
            {label}
          </label>
        )}
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

export default Checkbox;
