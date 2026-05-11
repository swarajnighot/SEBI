import React from 'react';

const catIcons = {
  acts: '📜', rules: '📋', regulations: '⚖️', circulars: '📢',
  orders: '🔨', enforcement: '🚔', legal: '🏛️',
  guidelines: '📌', 'master-circulars': '📔', 'general-orders': '📄',
  gazette: '📰', other: '📎'
};

function FeedItem({ item, onViewPdf }) {
  const icon = catIcons[item.cat] || '📎';
  const parseDate = (d) => {
    if (!d) return 'No date';
    const date = new Date(d);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    }
    return d; // Fallback to raw string if parsing fails
  };

  const dateStr = parseDate(item.pubDate);

  return (
    <div className={`feed-item cat-${item.cat} src-${item.source} ${item.isNew ? 'is-new' : ''} ${item.aifTagged ? 'aif-tagged' : ''}`}>
      <div className="icon">{icon}</div>
      <div className="body">
        <div className="item-title" title={item.title}>{item.title}</div>
        {item.aifTagged && (
          <div className="aif-badge">⚠️ "To" section matches your search term</div>
        )}
        <div className="meta">
          <span className="badge badge-cat">{item.cat.replace('-', ' ')}</span>
          <span className={`badge badge-source-${item.source}`}>{item.source}</span>
          <span className="date-tag">📅 {dateStr}</span>
          <div className="action-buttons">
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn-detail">
              DETAILS
            </a>
            <button className="btn-pdf" onClick={() => onViewPdf(item)}>
              📄 VIEW PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedItem;
