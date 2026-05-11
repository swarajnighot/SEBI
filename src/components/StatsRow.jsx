import React from 'react';

function StatsRow({ totalItems, newSinceStart, legalItems, checksRun, lastChecked }) {
  return (
    <div className="stats-row">
      <div className="stat-card">
        <div className="num">{totalItems}</div>
        <div className="lbl">Total</div>
      </div>
      <div className="stat-card highlight">
        <div className="num">{newSinceStart}</div>
        <div className="lbl">New</div>
      </div>
      <div className="stat-card">
        <div className="num">{legalItems}</div>
        <div className="lbl">Legal</div>
      </div>
      <div className="stat-card">
        <div className="num">{checksRun}</div>
        <div className="lbl">Checks</div>
      </div>
    </div>
  );
}

export default StatsRow;
