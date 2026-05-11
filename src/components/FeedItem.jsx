import React from 'react';

function FeedItem({ item, onViewPdf }) {
  const parseDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return d;
  };

  const dateStr = parseDate(item.pubDate);
  const catLabel = item.cat.replace(/-/g, ' ');

  return (
    <article
      className={`feed-item cat-${item.cat} src-${item.source} ${item.isNew ? 'is-new' : ''} ${item.aifTagged ? 'aif-tagged' : ''}`}
      aria-label={item.title}
    >
      <span className={`cat-dot cat-dot-${item.cat}`} aria-hidden="true" title={catLabel} />

      <div className="body">
        <div className="item-title" title={item.title}>{item.title}</div>

        {item.aifTagged && (
          <div className="aif-badge" role="status">
            Matches recipient filter
          </div>
        )}

        <div className="meta">
          <span className="badge badge-cat">{catLabel}</span>
          <span className={`badge badge-source-${item.source}`}>{item.source}</span>
          <span className="date-tag">{dateStr}</span>

          <div className="action-buttons">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-detail"
              aria-label={`View details for ${item.title}`}
            >
              Details
            </a>
            <button
              className="btn-pdf"
              onClick={() => onViewPdf(item)}
              aria-label={`View PDF for ${item.title}`}
            >
              View PDF
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default FeedItem;
