import React from 'react';

/**
 * Reusable Select component
 * Demonstrates: Component composition, reusable components, form handling
 */
const Select = React.memo(function Select({ 
  label, 
  id, 
  options = [],
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
      <select
        id={id}
        className={`input ${error ? 'input-error' : ''}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

export default Select;
