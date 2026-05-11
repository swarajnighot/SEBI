import React from 'react';

function FilterBar({ filterCat, setFilterCat, filterSearch, setFilterSearch,
  filterNewOnly, setFilterNewOnly, filterScraped, setFilterScraped,
  filterMatchedOnly, setFilterMatchedOnly, checkTime, setCheckTime }) {
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

      {/* Category */}
      <div className="filter-item">
        <label htmlFor="filter-cat" className="filter-label">Category</label>
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
      </div>

      <div className="filter-divider" aria-hidden="true" />

      {/* New only toggle */}
      <div className="filter-item filter-item-toggle">
        <label className="filter-toggle-label" htmlFor="filter-new">
          <span className="toggle-switch">
            <input
              id="filter-new"
              type="checkbox"
              checked={filterNewOnly}
              onChange={e => setFilterNewOnly(e.target.checked)}
            />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
          </span>
          New only
        </label>
      </div>

      <div className="filter-divider" aria-hidden="true" />

      {/* Include scraped toggle */}
      <div className="filter-item filter-item-toggle">
        <label className="filter-toggle-label" htmlFor="filter-scraped">
          <span className="toggle-switch">
            <input
              id="filter-scraped"
              type="checkbox"
              checked={filterScraped}
              onChange={e => setFilterScraped(e.target.checked)}
            />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
          </span>
          Scraped
        </label>
      </div>

      <div className="filter-divider" aria-hidden="true" />

      {/* Matched only toggle */}
      <div className="filter-item filter-item-toggle">
        <label className="filter-toggle-label" htmlFor="filter-matched">
          <span className="toggle-switch">
            <input
              id="filter-matched"
              type="checkbox"
              checked={filterMatchedOnly}
              onChange={e => setFilterMatchedOnly(e.target.checked)}
            />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
          </span>
          Matched only
        </label>
      </div>

      <div className="filter-divider" aria-hidden="true" />

      {/* Daily check time */}
      <div className="filter-item">
        <label htmlFor="filter-time" className="filter-label">Check time</label>
        <input
          id="filter-time"
          className="filter-input filter-input-time"
          type="time"
          value={checkTime}
          onChange={e => setCheckTime(e.target.value)}
        />
      </div>

    </div>
  );
}

export default FilterBar;
