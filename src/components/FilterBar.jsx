import React from 'react';

function FilterBar({ filterCat, setFilterCat, filterSearch, setFilterSearch,
  filterNewOnly, setFilterNewOnly, filterScraped, setFilterScraped,
  filterMatchedOnly, setFilterMatchedOnly, checkTime, setCheckTime,
  onCheckNow, isCheckingNow, isRunning, onStart, onStop }) {
  return (
    <div className="filter-bar" role="search" aria-label="Feed filters">

      {/* Search */}
      <div className="filter-item filter-item-grow">
        <label htmlFor="filter-search" className="filter-label">Search</label>
        <input
          id="filter-search"
          className="filter-input"
          type="text"
          placeholder="Filter by title…"
          value={filterSearch}
          onChange={e => setFilterSearch(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="filter-divider" aria-hidden="true" />

      {/* Check Now — immediately left of Category */}
      <div className="filter-item filter-item-action">
        <button
          className="filter-check-btn"
          onClick={onCheckNow}
          disabled={isCheckingNow}
          aria-label="Run check now"
        >
          {isCheckingNow ? (
            <>
              <svg className="filter-check-spinner" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Checking…
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-.18-4.6"/>
              </svg>
              Check Now
            </>
          )}
        </button>
      </div>

      <div className="filter-divider" aria-hidden="true" />

      {/* Category */}
      <div className="filter-item">
        <label htmlFor="filter-cat" className="filter-label">Category</label>
        <div className="filter-select-wrap">
          <select id="filter-cat" className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">All</option>
            <option value="legal">Legal</option>
            <option value="acts">Acts</option>
            <option value="rules">Rules</option>
            <option value="regulations">Regulations</option>
            <option value="guidelines">Guidelines</option>
            <option value="master-circulars">Master Circulars</option>
            <option value="general-orders">General Orders</option>
            <option value="gazette">Gazette</option>
            <option value="circulars">Circulars</option>
          </select>
          <svg className="filter-select-arrow" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <div className="filter-divider" aria-hidden="true" />

      {/* New only */}
      <div className="filter-item filter-item-toggle">
        <label className="filter-toggle-label" htmlFor="filter-new">
          <span className="toggle-switch">
            <input id="filter-new" type="checkbox" checked={filterNewOnly} onChange={e => setFilterNewOnly(e.target.checked)} />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
          </span>
          New only
        </label>
      </div>

      <div className="filter-divider" aria-hidden="true" />

      {/* Scraped */}
      <div className="filter-item filter-item-toggle">
        <label className="filter-toggle-label" htmlFor="filter-scraped">
          <span className="toggle-switch">
            <input id="filter-scraped" type="checkbox" checked={filterScraped} onChange={e => setFilterScraped(e.target.checked)} />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
          </span>
          Scraped
        </label>
      </div>

      <div className="filter-divider" aria-hidden="true" />

      {/* Matched only */}
      <div className="filter-item filter-item-toggle">
        <label className="filter-toggle-label" htmlFor="filter-matched">
          <span className="toggle-switch">
            <input id="filter-matched" type="checkbox" checked={filterMatchedOnly} onChange={e => setFilterMatchedOnly(e.target.checked)} />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
          </span>
          Matched only
        </label>
      </div>

      <div className="filter-divider" aria-hidden="true" />

      {/* Check Time + Start/Stop — rightmost section */}
      <div className="filter-item filter-item-schedule">
        <label htmlFor="filter-time" className="filter-label">Schedule</label>
        <div className="schedule-control">
          <svg className="schedule-clock-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <input
            id="filter-time"
            className="filter-input filter-input-time"
            type="time"
            value={checkTime}
            onChange={e => setCheckTime(e.target.value)}
            aria-label="Daily check time"
          />
          <button
            className={`schedule-toggle-btn ${isRunning ? 'schedule-toggle-btn--stop' : 'schedule-toggle-btn--start'}`}
            onClick={isRunning ? onStop : onStart}
            aria-label={isRunning ? 'Stop monitoring' : 'Start monitoring'}
          >
            {isRunning ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="6" width="12" height="12" rx="1"/>
                </svg>
                Stop
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Start
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}

export default FilterBar;
