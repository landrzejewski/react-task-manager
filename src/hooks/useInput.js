import { useState } from 'react';

/**
 * Custom hook for form input handling with validation
 * Demonstrates: Custom hooks, form handling, validation
 */
function useInput(initialValue, validationFn) {
  const [value, setValue] = useState(initialValue);
  const [didEdit, setDidEdit] = useState(false);

  const isValid = validationFn ? validationFn(value) : true;

  function handleChange(event) {
    setValue(event.target.value);
    setDidEdit(false); // Reset edit state when user starts typing again
  }

  function handleBlur() {
    setDidEdit(true);
  }

  function reset() {
    setValue(initialValue);
    setDidEdit(false);
  }

  return {
    value,
    isValid,
    hasError: didEdit && !isValid,
    handleChange,
    handleBlur,
    reset
  };
}

export default useInput;
