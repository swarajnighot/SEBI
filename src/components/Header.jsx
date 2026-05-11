import React from 'react';

function Header({ isRunning, onStart, onStop, onCheckNow, onClear, lastChecked }) {
  return (
    <header>
      <div className="title-block">
        <h1>🏛️ SEBI Monitor</h1>
        <p>Last checked: {lastChecked || '—'}</p>
      </div>
      <div className="controls">
        <div className="status-area">
          <span className={`status-dot ${isRunning ? 'running' : 'stopped'}`} />
          <span className="status-label">{isRunning ? 'Running' : 'Stopped'}</span>
        </div>
        <button id="btn-check" onClick={onCheckNow}>🔄 Check Now</button>
        {isRunning ? (
          <button id="btn-stop" onClick={onStop}>⏹ Stop Monitoring</button>
        ) : (
          <button id="btn-start" onClick={onStart}>▶ Start Monitoring</button>
        )}
        <button id="btn-clear" onClick={onClear}>🗑 Clear All Data</button>
      </div>
    </header>
  );
}

export default Header;
