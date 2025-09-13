import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PacketCreator from './components/PacketCreator';
import PacketQueue from './components/PacketQueue';
import TransmissionChart from './components/TransmissionChart';
import SystemStats from './components/SystemStats';
import ConfigPanel from './components/ConfigPanel';
import './App.css';

const API_BASE = '/api';

function App() {
  const [packets, setPackets] = useState([]);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState(null);
  const [isTransmitting, setIsTransmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [packetsRes, statsRes, historyRes, configRes] = await Promise.all([
        axios.get(`${API_BASE}/packets`),
        axios.get(`${API_BASE}/stats`),
        axios.get(`${API_BASE}/history`),
        axios.get(`${API_BASE}/config`)
      ]);
      
      setPackets(packetsRes.data);
      setStats(statsRes.data);
      setHistory(historyRes.data);
      setConfig(configRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const createPacket = async (packetData) => {
    try {
      await axios.post(`${API_BASE}/packets`, packetData);
      fetchData();
    } catch (error) {
      console.error('Error creating packet:', error);
    }
  };

  const startTransmission = async () => {
    setIsTransmitting(true);
    try {
      await axios.post(`${API_BASE}/transmission/start`);
      fetchData();
    } catch (error) {
      console.error('Error starting transmission:', error);
    } finally {
      setIsTransmitting(false);
    }
  };

  const clearQueue = async () => {
    try {
      await axios.delete(`${API_BASE}/packets/clear`);
      fetchData();
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      await axios.post(`${API_BASE}/config`, newConfig);
      setConfig(newConfig);
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Deep Space Communication Optimizer</h1>
        <p>Simulating high-latency, bandwidth-limited space communication</p>
      </header>

      <div className="dashboard">
        <div className="left-panel">
          <PacketCreator onCreatePacket={createPacket} />
          
          <div className="transmission-controls">
            <button 
              onClick={startTransmission} 
              disabled={isTransmitting || packets.length === 0}
              className="transmit-btn"
            >
              {isTransmitting ? 'Transmitting...' : 'Start Transmission'}
            </button>
            <button onClick={clearQueue} className="clear-btn">
              Clear Queue
            </button>
          </div>

          {config && (
            <ConfigPanel 
              config={config} 
              onUpdateConfig={updateConfig} 
            />
          )}
        </div>

        <div className="right-panel">
          {stats && <SystemStats stats={stats} />}
          <PacketQueue packets={packets} />
          <TransmissionChart history={history} />
        </div>
      </div>
    </div>
  );
}

export default App;