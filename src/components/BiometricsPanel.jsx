import React from 'react';
import { Activity } from 'lucide-react';

const BiometricsPanel = ({ blendshapes }) => {
  if (!blendshapes || blendshapes.length === 0) return null;
  
  // Find specific blendshapes
  const getScore = (name) => {
    const shape = blendshapes[0].categories.find(c => c.categoryName === name);
    return shape ? shape.score : 0;
  };

  const metrics = [
    { label: 'SMILE', value: Math.max(getScore('mouthSmileLeft'), getScore('mouthSmileRight')) },
    { label: 'BLINK (L)', value: getScore('eyeBlinkLeft') },
    { label: 'BLINK (R)', value: getScore('eyeBlinkRight') },
    { label: 'BROW RAISE', value: Math.max(getScore('browInnerUp'), getScore('browOuterUpLeft'), getScore('browOuterUpRight')) },
    { label: 'MOUTH OPEN', value: getScore('jawOpen') }
  ];

  return (
    <div className="glass-panel" style={{ marginTop: '10px' }}>
      <h3 className="text-pink" style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,0,255,0.3)', paddingBottom: '5px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Activity size={18} /> BIOMETRICS
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {metrics.map(m => (
          <div key={m.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
              <span className="mono-text">{m.label}</span>
              <span className="mono-text text-cyan">{(m.value * 100).toFixed(0)}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(0,243,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${m.value * 100}%`, height: '100%', background: m.value > 0.5 ? 'var(--neon-pink)' : 'var(--neon-blue)', transition: 'width 0.1s ease-out', boxShadow: '0 0 5px currentColor' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BiometricsPanel;
