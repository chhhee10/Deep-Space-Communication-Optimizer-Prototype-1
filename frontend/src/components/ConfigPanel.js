import React, { useState } from 'react';

const ConfigPanel = ({ config, onUpdateConfig }) => {
  const [localConfig, setLocalConfig] = useState(config);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateConfig(localConfig);
  };

  return (
    <div className="config-panel">
      <h3>Transmission Configuration</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Distance (km):</label>
          <input
            type="number"
            value={localConfig.distance_km}
            onChange={(e) => setLocalConfig({
              ...localConfig,
              distance_km: parseFloat(e.target.value)
            })}
            min="1000"
            max="1000000000"
          />
          <small>Earth-Moon: 384,400 km | Earth-Mars: 225,000,000 km</small>
        </div>
        
        <div className="form-group">
          <label>Bandwidth (bps):</label>
          <input
            type="number"
            value={localConfig.bandwidth_bps}
            onChange={(e) => setLocalConfig({
              ...localConfig,
              bandwidth_bps: parseInt(e.target.value)
            })}
            min="256"
            max="1000000"
          />
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={localConfig.compression_enabled}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                compression_enabled: e.target.checked
              })}
            />
            Enable Compression
          </label>
        </div>

        <div className="form-group">
          <label>Latency Scale Factor:</label>
          <input
            type="number"
            step="0.001"
            value={localConfig.latency_scale_factor}
            onChange={(e) => setLocalConfig({
              ...localConfig,
              latency_scale_factor: parseFloat(e.target.value)
            })}
            min="0.001"
            max="1.0"
          />
          <small>Scale factor for demo timing (0.01 = 1% of real time)</small>
        </div>
        
        <button type="submit" className="update-btn">
          Update Configuration
        </button>
      </form>
    </div>
  );
};

export default ConfigPanel;