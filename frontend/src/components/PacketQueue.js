import React from 'react';

const PacketQueue = ({ packets }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'emergency': return '🚨';
      case 'science': return '🔬';
      case 'logs': return '📋';
      default: return '📦';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'queued': return '#ffa500';
      case 'transmitting': return '#1e90ff';
      case 'transmitted': return '#32cd32';
      case 'failed': return '#ff4444';
      default: return '#666';
    }
  };

  return (
    <div className="packet-queue">
      <h3>Transmission Queue ({packets.length})</h3>
      <div className="queue-list">
        {packets.length === 0 ? (
          <p className="empty-queue">No packets in queue</p>
        ) : (
          packets.map((packet) => (
            <div key={packet.id} className="packet-item">
              <div className="packet-header">
                <span className="packet-type">
                  {getTypeIcon(packet.type)} {packet.type.toUpperCase()}
                </span>
                <span 
                  className="packet-status"
                  style={{ color: getStatusColor(packet.status) }}
                >
                  {packet.status.toUpperCase()}
                </span>
              </div>
              <div className="packet-data">{packet.data.substring(0, 50)}...</div>
              <div className="packet-info">
                <small>
                  Size: {packet.size_bytes}B → {packet.compressed_size}B 
                  ({Math.round((1 - packet.compressed_size / packet.size_bytes) * 100)}% compressed)
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PacketQueue;