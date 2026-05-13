import React, { useState } from 'react';

function Header({ isRunning, lastChecked, toSearchTerms, onToSearchTermsChange, currentUser, onLogout }) {
  const [inputVal, setInputVal] = useState('');

  const addTerm = () => {
    const trimmed = inputVal.trim();
    if (!trimmed || toSearchTerms.includes(trimmed)) { setInputVal(''); return; }
    onToSearchTermsChange([...toSearchTerms, trimmed]);
    setInputVal('');
  };

  const removeTerm = (term) => onToSearchTermsChange(toSearchTerms.filter(t => t !== term));

  const handleKeyDown = (e) => { if (e.key === 'Enter') addTerm(); };

  return (
    <header>
      <div className="title-block">
        <div className="title-brand">
          <img src="/sebiicon.png" alt="SEBI" className="sidebar-logo" />
          <h1>SEBI Monitor</h1>
        </div>
        {lastChecked && <span className="title-last-checked">Last check: {lastChecked}</span>}
      </div>

      <div className="status-area">
        <span className={`status-dot ${isRunning ? 'running' : 'stopped'}`} aria-hidden="true" />
        <span className="status-label">{isRunning ? 'Monitoring active' : 'Monitoring stopped'}</span>
      </div>

      <div className="to-search-block">
        <label className="to-search-label" htmlFor="to-search-input">
          Highlight if "To" contains
        </label>

        {toSearchTerms.length > 0 && (
          <ul className="to-search-list" aria-label="Active recipient filters">
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
            placeholder="Type recipient & press Enter…"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="to-search-add" onClick={addTerm} aria-label="Add recipient term">
            Add
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
