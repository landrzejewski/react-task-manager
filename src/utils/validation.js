/**
 * Validation utility functions
 * Demonstrates: Outsourcing validation logic, reusable functions
 */

export function isNotEmpty(value) {
  return value.trim() !== '';
}

export function isEmail(value) {
  return value.includes('@') && value.includes('.');
}

export function hasMinLength(value, minLength) {
  return value.length >= minLength;
}

export function isValidDate(value) {
  if (!value) return false;
  const date = new Date(value);
  return date instanceof Date && !isNaN(date);
}

export function isFutureDate(value) {
  if (!isValidDate(value)) return false;
  return new Date(value) > new Date();
}

export function isValidPriority(value) {
  return ['low', 'medium', 'high'].includes(value);
}

export function isValidStatus(value) {
  return ['todo', 'in-progress', 'completed'].includes(value);
}
