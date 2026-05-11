import React from 'react';

function FilterBar({ 
  filterCat, setFilterCat, 
  filterSearch, setFilterSearch, 
  filterNewOnly, setFilterNewOnly, 
  filterScraped, setFilterScraped, 
  checkTime, setCheckTime 
}) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Search Feed</label>
        <input 
          type="text" 
          placeholder="Filter by title..." 
          value={filterSearch} 
          onChange={e => setFilterSearch(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>Category</label>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="legal">Legal (All)</option>
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

      <div className="filter-group" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <label>Show Only New</label>
        <input 
          type="checkbox" 
          checked={filterNewOnly} 
          onChange={e => setFilterNewOnly(e.target.checked)} 
        />
      </div>

      <div className="filter-group" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <label>Include Scraped</label>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={filterScraped} 
            onChange={e => setFilterScraped(e.target.checked)} 
          />
          <span className="toggle-track"><span className="toggle-thumb" /></span>
        </label>
      </div>

      <div className="filter-group">
        <label>Daily Check Time</label>
        <input 
          type="time" 
          value={checkTime} 
          onChange={e => setCheckTime(e.target.value)} 
        />
      </div>
    </div>
  );
}

export default FilterBar;
