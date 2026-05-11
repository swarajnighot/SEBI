import React from 'react';

function ProgressBar({ countdownSec, totalSec }) {
  const percentage = totalSec > 0 ? (countdownSec / totalSec) * 100 : 0;
  
  return (
    <div className="next-check-bar">
      <span>⏱ Next check in:</span>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
      </div>
      <span style={{ minWidth: '40px', textAlign: 'right' }}>{countdownSec}s</span>
    </div>
  );
}

export default ProgressBar;
