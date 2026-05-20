import React from 'react';
import { Compass } from 'lucide-react';

const TelemetryPanel = ({ rotation, gaze }) => {
  return (
    <div className="glass-panel" style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 className="text-cyan" style={{ fontSize: '1rem', borderBottom: '1px solid rgba(0,243,255,0.3)', paddingBottom: '5px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass size={18} /> TELEMETRY
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="mono-text text-cyan">YAW</span>
            <span className="mono-text" style={{ fontSize: '1.2rem' }}>{rotation.yaw.toFixed(1)}°</span>
          </div>
          <div style={{ width: '100%', height: '20px', position: 'relative', border: '1px solid rgba(0,243,255,0.3)', background: 'rgba(0,0,0,0.5)' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, width: '2px', background: 'var(--neon-pink)', left: `${Math.max(0, Math.min(100, 50 + rotation.yaw))}%`, boxShadow: '0 0 5px var(--neon-pink)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, width: '1px', background: 'rgba(0,243,255,0.3)', left: '50%' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="mono-text text-cyan">PITCH</span>
            <span className="mono-text" style={{ fontSize: '1.2rem' }}>{rotation.pitch.toFixed(1)}°</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="mono-text text-cyan">ROLL</span>
            <span className="mono-text" style={{ fontSize: '1.2rem' }}>{rotation.roll.toFixed(1)}°</span>
          </div>

          <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,243,255,0.05)', border: '1px solid rgba(0,243,255,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--neon-pink)', marginBottom: '5px' }}>GAZE STATE</div>
            <div className="mono-text" style={{ fontSize: '1.2rem', textTransform: 'uppercase', color: 'var(--neon-green)' }}>
              {gaze}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default TelemetryPanel;
