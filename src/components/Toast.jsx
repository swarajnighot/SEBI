import React from 'react';

function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="toast-container">
      <div className="toast">
        <strong>{message.title || 'New Item Detected!'}</strong>
        <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>{message.text}</p>
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            color: 'white', 
            position: 'absolute', 
            top: '0.5rem', 
            right: '0.5rem',
            padding: '0.25rem',
            opacity: 0.5
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default Toast;
