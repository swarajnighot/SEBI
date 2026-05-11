import React, { useEffect } from 'react';

function PdfModal({ isOpen, item, blobUrl, error, loading, loadingText, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-area">
            <h3>{item?.title || 'Viewing PDF'}</h3>
            <p>{item?.link}</p>
          </div>
          <div className="modal-actions">
            <a href={item?.link} target="_blank" rel="noopener noreferrer" className="btn-modal-link">
              🔗 External Link
            </a>
            <button className="btn-close" onClick={onClose}>✕</button>
          </div>
        </div>
        
        <div className="modal-body">
          {loading && (
            <div className="modal-loading">
              <div className="spinner"></div>
              <p>{loadingText}</p>
            </div>
          )}
          
          {error && (
            <div className="modal-error">
              <div className="error-icon">⚠️</div>
              <h4>Could not load PDF</h4>
              <p>{error}</p>
              <a href={item?.link} target="_blank" rel="noopener noreferrer" className="btn-retry">
                Open Page in New Tab
              </a>
            </div>
          )}

          {blobUrl && !loading && !error && (
            <iframe 
              src={`${blobUrl}#toolbar=0&navpanes=0`} 
              className="pdf-iframe" 
              title="PDF Viewer"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PdfModal;
