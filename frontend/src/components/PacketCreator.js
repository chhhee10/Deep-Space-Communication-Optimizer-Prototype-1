import React, { useState } from 'react';

const PacketCreator = ({ onCreatePacket }) => {
  const [packetType, setPacketType] = useState('science');
  const [data, setData] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.trim()) {
      onCreatePacket({
        type: packetType,
        data: data.trim()
      });
      setData('');
    }
  };

  return (
    <div className="packet-creator">
      <h3>Create Packet</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Packet Type:</label>
          <select 
            value={packetType} 
            onChange={(e) => setPacketType(e.target.value)}
          >
            <option value="emergency">🚨 Emergency</option>
            <option value="science">🔬 Science Data</option>
            <option value="logs">📋 System Logs</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Data:</label>
          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Enter packet data..."
            rows="4"
            required
          />
        </div>
        
        <button type="submit" className="create-btn">
          Create Packet
        </button>
      </form>
    </div>
  );
};

export default PacketCreator;