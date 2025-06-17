import React from 'react';

/**
 * Reusable Radio component
 * Demonstrates: Component composition, reusable components, form handling
 */
const Radio = React.memo(function Radio({ 
  label, 
  id, 
  options = [],
  name,
  error, 
  className = '', 
  ...props 
}) {
  return (
    <div className={`radio-group ${className}`}>
      {label && <div className="radio-group-label">{label}</div>}
      <div className="radio-options">
        {options.map((option) => (
          <div key={option.value} className="radio-option">
            <input
              type="radio"
              id={`${id}-${option.value}`}
              name={name}
              value={option.value}
              className={`radio ${error ? 'radio-error' : ''}`}
              {...props}
            />
            <label htmlFor={`${id}-${option.value}`} className="radio-label">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

export default Radio;
