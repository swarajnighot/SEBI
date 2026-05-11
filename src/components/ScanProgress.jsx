import React from 'react';

function ScanProgress({ count }) {
  if (count === 0) return null;
  return (
    <div className="scan-progress" role="status" aria-live="polite">
      <span className="scan-spinner" aria-hidden="true" />
      <span className="scan-text">
        Scanning <strong>{count}</strong> PDF{count !== 1 ? 's' : ''} for recipient matches&hellip;
      </span>
    </div>
  );
}

export default ScanProgress;
