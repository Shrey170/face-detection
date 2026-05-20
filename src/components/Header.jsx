import React, { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';

const Header = ({ fps }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Activity className="text-cyan" size={24} />
        <div>
          <h2 style={{ fontSize: '1.2rem', letterSpacing: '2px' }} className="text-cyan">NEURAL FACE ANALYZER</h2>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }} className="mono-text">v1.0 // ONLINE</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--neon-pink)' }}>FPS</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }} className="mono-text text-pink">{fps}</div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--neon-green)' }}>
          <Clock size={18} />
          <span className="mono-text" style={{ fontSize: '1.1rem' }}>
            {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
