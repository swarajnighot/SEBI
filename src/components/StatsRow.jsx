import React from 'react';

function StatCard({ num, label, mod }) {
  return (
    <div className={`stat-card${mod ? ` ${mod}` : ''}`}>
      <div className="num">{num}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}

function StatsRow({ totalItems, newSinceStart, legalItems, checksRun }) {
  return (
    <div className="stats-row" role="region" aria-label="Feed statistics">
      <StatCard num={totalItems}    label="Total"   />
      <StatCard num={newSinceStart} label="New"     mod="highlight" />
      <StatCard num={legalItems}    label="Legal"   mod="stat-success" />
      <StatCard num={checksRun}     label="Checks"  />
    </div>
  );
}

export default StatsRow;
