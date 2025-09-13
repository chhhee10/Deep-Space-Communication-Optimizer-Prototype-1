from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Optional
import asyncio
import gzip
import json
import time
from enum import Enum
from datetime import datetime
import uuid

app = FastAPI(title="Deep Space Communication Optimizer")

# CORS middleware to allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Replit environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PacketType(str, Enum):
    EMERGENCY = "emergency"
    SCIENCE = "science"
    LOGS = "logs"

class PacketStatus(str, Enum):
    QUEUED = "queued"
    TRANSMITTING = "transmitting"
    TRANSMITTED = "transmitted"
    FAILED = "failed"

class PacketModel(BaseModel):
    id: Optional[str] = None
    type: PacketType
    data: str
    priority: int = 0
    timestamp: Optional[datetime] = None
    size_bytes: int = 0
    compressed_size: int = 0
    status: PacketStatus = PacketStatus.QUEUED

class TransmissionConfig(BaseModel):
    distance_km: float = 384400  # Earth-Moon distance
    bandwidth_bps: int = 2048  # bits per second
    compression_enabled: bool = True
    latency_scale_factor: float = 0.01  # Scale factor for demo timing

class SystemStats(BaseModel):
    total_packets: int
    packets_transmitted: int
    packets_queued: int
    bandwidth_utilization: float
    average_compression_ratio: float
    transmission_efficiency: float

# Global state
packet_queue: List[PacketModel] = []
transmission_config = TransmissionConfig()
transmission_history: List[Dict] = []

def compress_data(data: str) -> tuple[bytes, float]:
    """Compress data and return compressed bytes and compression ratio"""
    original_bytes = data.encode('utf-8')
    compressed_bytes = gzip.compress(original_bytes)
    compression_ratio = len(compressed_bytes) / len(original_bytes)
    return compressed_bytes, compression_ratio

def calculate_priority(packet_type: PacketType) -> int:
    """Calculate packet priority based on type"""
    priority_map = {
        PacketType.EMERGENCY: 1,
        PacketType.SCIENCE: 2,
        PacketType.LOGS: 3
    }
    return priority_map[packet_type]

def calculate_transmission_delay(distance_km: float) -> float:
    """Calculate one-way transmission delay based on distance"""
    light_speed = 299792458  # m/s
    delay_seconds = (distance_km * 1000) / light_speed
    return delay_seconds

@app.post("/api/packets", response_model=PacketModel)
async def create_packet(packet_data: dict):
    """Create a new packet for transmission"""
    packet = PacketModel(
        id=str(uuid.uuid4()),
        type=PacketType(packet_data["type"]),
        data=packet_data["data"],
        timestamp=datetime.now(),
        priority=calculate_priority(PacketType(packet_data["type"]))
    )
    
    # Calculate sizes
    packet.size_bytes = len(packet.data.encode('utf-8'))
    
    if transmission_config.compression_enabled:
        compressed_data, compression_ratio = compress_data(packet.data)
        packet.compressed_size = len(compressed_data)
    else:
        packet.compressed_size = packet.size_bytes
    
    # Add to queue with priority sorting
    packet_queue.append(packet)
    packet_queue.sort(key=lambda p: p.priority)
    
    return packet

@app.get("/api/packets", response_model=List[PacketModel])
async def get_packets():
    """Get all packets in the queue"""
    return packet_queue

@app.post("/api/transmission/start")
async def start_transmission():
    """Start transmitting packets from the queue"""
    if not packet_queue:
        raise HTTPException(status_code=400, detail="No packets in queue")
    
    # Process packets in priority order
    transmitted_packets = []
    
    for packet in packet_queue[:]:
        if packet.status == PacketStatus.QUEUED:
            packet.status = PacketStatus.TRANSMITTING
            
            # Simulate transmission time based on packet size and bandwidth
            transmission_time = packet.compressed_size * 8 / transmission_config.bandwidth_bps
            transmission_delay = calculate_transmission_delay(transmission_config.distance_km)
            total_time = transmission_time + transmission_delay
            
            # Simulate the transmission delay with configurable scale factor
            await asyncio.sleep(total_time * transmission_config.latency_scale_factor)
            
            packet.status = PacketStatus.TRANSMITTED
            transmitted_packets.append(packet)
            
            # Add to history
            transmission_history.append({
                "packet_id": packet.id,
                "timestamp": datetime.now().isoformat(),
                "transmission_time": transmission_time,
                "delay": transmission_delay,
                "size": packet.compressed_size
            })
            
            # Remove from queue
            packet_queue.remove(packet)
    
    return {"transmitted_packets": len(transmitted_packets)}

@app.get("/api/config", response_model=TransmissionConfig)
async def get_config():
    """Get current transmission configuration"""
    return transmission_config

@app.post("/api/config")
async def update_config(config: TransmissionConfig):
    """Update transmission configuration"""
    global transmission_config
    transmission_config = config
    return {"message": "Configuration updated"}

@app.get("/api/stats", response_model=SystemStats)
async def get_stats():
    """Get system statistics"""
    total_packets = len(transmission_history) + len(packet_queue)
    packets_transmitted = len(transmission_history)
    packets_queued = len([p for p in packet_queue if p.status == PacketStatus.QUEUED])
    
    # Calculate bandwidth utilization
    if transmission_history:
        recent_transmissions = transmission_history[-10:]
        total_size = sum(t["size"] for t in recent_transmissions)
        total_time = sum(t["transmission_time"] for t in recent_transmissions)
        bandwidth_utilization = (total_size * 8 / total_time) / transmission_config.bandwidth_bps if total_time > 0 else 0
    else:
        bandwidth_utilization = 0
    
    # Calculate average compression ratio
    if packet_queue:
        compression_ratios = [p.compressed_size / p.size_bytes for p in packet_queue if p.size_bytes > 0]
        average_compression_ratio = sum(compression_ratios) / len(compression_ratios) if compression_ratios else 1.0
    else:
        average_compression_ratio = 1.0
    
    # Calculate transmission efficiency
    transmission_efficiency = packets_transmitted / total_packets if total_packets > 0 else 0
    
    return SystemStats(
        total_packets=total_packets,
        packets_transmitted=packets_transmitted,
        packets_queued=packets_queued,
        bandwidth_utilization=min(bandwidth_utilization, 1.0),
        average_compression_ratio=average_compression_ratio,
        transmission_efficiency=transmission_efficiency
    )

@app.get("/api/history")
async def get_transmission_history():
    """Get transmission history for visualization"""
    return transmission_history[-20:]  # Return last 20 transmissions

@app.delete("/api/packets/clear")
async def clear_queue():
    """Clear all packets from the queue"""
    global packet_queue
    packet_queue.clear()
    return {"message": "Queue cleared"}

# Mount the React frontend build files
app.mount("/", StaticFiles(directory="../frontend/build", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", "5000"))
    uvicorn.run(app, host="0.0.0.0", port=port)