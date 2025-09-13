import React from 'react';

const SystemStats = ({ stats }) => {
  return (
    <div className="system-stats">
      <h3>System Statistics</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{stats.total_packets}</div>
          <div className="stat-label">Total Packets</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.packets_transmitted}</div>
          <div className="stat-label">Transmitted</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.packets_queued}</div>
          <div className="stat-label">Queued</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{Math.round(stats.bandwidth_utilization * 100)}%</div>
          <div className="stat-label">Bandwidth</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{Math.round(stats.average_compression_ratio * 100)}%</div>
          <div className="stat-label">Compression</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{Math.round(stats.transmission_efficiency * 100)}%</div>
          <div className="stat-label">Efficiency</div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;