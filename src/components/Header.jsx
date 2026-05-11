import React, { useState } from 'react';

function Header({ isRunning, onStart, onStop, onCheckNow, onClear, lastChecked, toSearchTerms, onToSearchTermsChange }) {
  const [inputVal, setInputVal] = useState('');

  const addTerm = () => {
    const trimmed = inputVal.trim();
    if (!trimmed || toSearchTerms.includes(trimmed)) { setInputVal(''); return; }
    onToSearchTermsChange([...toSearchTerms, trimmed]);
    setInputVal('');
  };

  const removeTerm = (term) => {
    onToSearchTermsChange(toSearchTerms.filter(t => t !== term));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTerm();
  };

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

      <div className="to-search-block">
        <label className="to-search-label" htmlFor="to-search-input">
          🎯 Highlight if "To" contains:
        </label>

        {toSearchTerms.length > 0 && (
          <ul className="to-search-list">
            {toSearchTerms.map(term => (
              <li key={term} className="to-search-list-item">
                <span className="to-search-list-text" title={term}>{term}</span>
                <button
                  className="tag-remove"
                  onClick={() => removeTerm(term)}
                  aria-label={`Remove "${term}"`}
                >×</button>
              </li>
            ))}
          </ul>
        )}

        <div className="to-search-input-row">
          <input
            id="to-search-input"
            className="to-search-input"
            type="text"
            placeholder='Type recipient & press Enter…'
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="to-search-add" onClick={addTerm} aria-label="Add recipient term">Add</button>
        </div>
      </div>
    </header>
  );
}

export default Header;
