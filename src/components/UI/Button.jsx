import React from 'react';

/**
 * Reusable Button component
 * Demonstrates: Component composition, React.memo optimization
 */
const Button = React.memo(function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props 
}) {
  const baseClasses = 'button';
  const variantClasses = `button-${variant}`;
  const sizeClasses = `button-${size}`;
  const stateClasses = disabled ? 'button-disabled' : '';
  const loadingClasses = loading ? 'button-loading' : '';
  
  const buttonClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    stateClasses,
    loadingClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="button-spinner">Loading...</span>
      ) : (
        children
      )}
    </button>
  );
});

export default Button;
