import React, { useEffect, useRef } from 'react';

function LogBox({ logs }) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="log-box" ref={logRef}>
      {logs.length === 0 && <div className="log-info">[ready] SEBI Monitor initialized.</div>}
      {logs.map((log, i) => (
        <div key={i} className={`log-${log.type}`}>
          {log.text}
        </div>
      ))}
    </div>
  );
}

export default LogBox;
