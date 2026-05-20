import React from 'react';
import { Settings, Download } from 'lucide-react';

const SidebarControls = ({ options, setOptions, handleCapture }) => {
  
  const toggleOption = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="glass-panel side-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 className="text-cyan" style={{ fontSize: '1rem', borderBottom: '1px solid rgba(0,243,255,0.3)', paddingBottom: '5px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={18} /> CONTROLS
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span className="mono-text">Show Mesh</span>
            <input type="checkbox" checked={options.showMesh} onChange={() => toggleOption('showMesh')} style={{ accentColor: 'var(--neon-blue)' }} />
          </label>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span className="mono-text">Show Iris</span>
            <input type="checkbox" checked={options.showIris} onChange={() => toggleOption('showIris')} style={{ accentColor: 'var(--neon-blue)' }} />
          </label>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span className="mono-text">Bounding Box</span>
            <input type="checkbox" checked={options.showBox} onChange={() => toggleOption('showBox')} style={{ accentColor: 'var(--neon-blue)' }} />
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-pink" style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,0,255,0.3)', paddingBottom: '5px', marginBottom: '15px' }}>
          AR FILTERS
        </h3>
        <select 
          value={options.activeFilter} 
          onChange={(e) => setOptions(prev => ({ ...prev, activeFilter: e.target.value }))}
          style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.5)', color: 'var(--neon-pink)', border: '1px solid var(--neon-pink)', outline: 'none', fontFamily: 'Share Tech Mono' }}
        >
          <option value="none">None</option>
          <option value="cyber_hud">Cyber HUD</option>
          <option value="tech_visor">Tech Visor</option>
        </select>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button className="cyber-btn" onClick={handleCapture}>
          <Download size={16} /> CAPTURE HUD
        </button>
      </div>
    </div>
  );
};

export default SidebarControls;
