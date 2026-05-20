import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

const SystemLogs = ({ logs }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass-panel system-logs" style={{ display: 'flex', flexDirection: 'column' }}>
      <h3 className="text-yellow" style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,255,0,0.3)', paddingBottom: '5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Terminal size={18} /> SYS_LOGS
      </h3>
      
      <div 
        ref={containerRef}
        style={{ flex: 1, overflowY: 'auto', fontSize: '0.75rem', fontFamily: 'Share Tech Mono', color: 'rgba(0,243,255,0.7)', display: 'flex', flexDirection: 'column', gap: '4px' }}
      >
        {logs.map((log, i) => (
          <div key={i}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>[{log.time}]</span> 
            <span style={{ color: log.type === 'error' ? 'var(--neon-pink)' : log.type === 'warn' ? '#ffff00' : 'inherit', marginLeft: '5px' }}>
              {log.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemLogs;
