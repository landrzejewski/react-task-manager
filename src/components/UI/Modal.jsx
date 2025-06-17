import React, { useEffect } from 'react';

/**
 * Modal component with portal-like behavior
 * Demonstrates: useEffect for DOM manipulation, event handling, cleanup
 */
const Modal = React.memo(function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  className = ''
}) {
  // Handle escape key press
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal ${className}`}>
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
});

export default Modal;
