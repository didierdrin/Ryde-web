import React, { useRef, useEffect } from 'react';
import { RefreshCw, MapPin, Maximize, Layers } from 'lucide-react';
import Header from '../components/Header';
import './LiveMap.css';

// Placeholder Map Component (In a real app, use Google Maps or Leaflet)
const LiveMap = () => {
    return (
        <div className="live-map-page">
            <Header title="Live Map Tracking" subtitle="Real-time GPS" />

            <div className="map-container">
                {/* Mock Map Background - Using an image to simulate 3D map view */}
                <div className="map-background" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')" }}>
                    {/* Overlay Contols */}
                    <div className="map-controls-top">
                        <button className="map-control-btn"><Layers size={18} /></button>
                        <button className="map-control-btn"><Maximize size={18} /></button>
                        <button className="refresh-btn">
                            <RefreshCw size={16} /> Refresh
                        </button>
                    </div>

                    {/* Map Markers (Simulated) */}
                    <div className="map-marker" style={{ top: '40%', left: '50%' }}>
                        <div className="marker-label">John M. • #RYD001234</div>
                        <div className="marker-icon car">🚗</div>
                    </div>

                    {/* Sidebar/Panel for Active Rides */}
                    <div className="active-rides-panel">
                        <div className="panel-header">
                            <h3>Active Rides</h3>
                            <span className="badge-count">12</span>
                        </div>

                        <div className="ride-list">
                            <div className="ride-card active">
                                <div className="ride-header">
                                    <span className="ride-id">#RYD001234</span>
                                    <span className="status-tag en-route">En Route</span>
                                </div>
                                <div className="ride-user-row">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="Driver" className="avatar-xs" />
                                    <div className="ride-user-info">
                                        <h4>John Mukiza</h4>
                                        <p>Toyota Corolla • RAD 123A</p>
                                    </div>
                                </div>
                                <div className="ride-locations">
                                    <div className="location-point pickup">
                                        <span className="dot green"></span>
                                        <span>Kigali City Center</span>
                                    </div>
                                    <div className="location-point dropoff">
                                        <span className="dot red"></span>
                                        <span>Kimisagara Market</span>
                                    </div>
                                </div>
                                <div className="ride-meta">
                                    <span>ETA: 8 min</span>
                                    <span className="price">2,500 RWF</span>
                                </div>
                            </div>

                            <div className="ride-card">
                                <div className="ride-header">
                                    <span className="ride-id">#RYD001235</span>
                                    <span className="status-tag waiting">Waiting</span>
                                </div>
                                <div className="ride-user-row">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Eric" alt="Driver" className="avatar-xs" />
                                    <div className="ride-user-info">
                                        <h4>Eric Nshimiyumukiza</h4>
                                        <p>Honda CRV • RAE 456B</p>
                                    </div>
                                </div>
                                <div className="ride-locations">
                                    <div className="location-point pickup">
                                        <span className="dot green"></span>
                                        <span>Nyarutarama</span>
                                    </div>
                                </div>
                                <div className="ride-meta">
                                    <span>ETA: 15 min</span>
                                    <span className="price">8,000 RWF</span>
                                </div>
                            </div>
                        </div>

                        <div className="panel-footer">
                            <div className="stat-item">
                                <span className="stat-num text-success">12</span>
                                <span className="stat-label">Active</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-num text-warning">3</span>
                                <span className="stat-label">Pending</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-num text-primary">156</span>
                                <span className="stat-label">Today</span>
                            </div>
                        </div>
                    </div>

                    {/* Ride Details Float */}
                    <div className="ride-details-float">
                        <div className="float-header">
                            <h3>Ride Details</h3>
                            <button className="close-btn">×</button>
                        </div>
                        <div className="float-content">
                            <div className="flex gap-3 mb-4">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" className="w-12 h-12 rounded-full border-2 border-primary" alt="driver" />
                                <div>
                                    <h4 className="font-bold">John Mukiza</h4>
                                    <p className="text-secondary text-xs">Toyota Corolla • RAD 123A</p>
                                    <div className="text-accent text-xs">★★★★★ 4.9</div>
                                </div>
                            </div>

                            <div className="route-timeline">
                                <div className="route-point">
                                    <div className="point-dot green"></div>
                                    <div className="point-info">
                                        <span className="label">Pickup Location</span>
                                        <span className="val">Kigali City Center, KN 3 Ave</span>
                                    </div>
                                </div>
                                <div className="route-line"></div>
                                <div className="route-point">
                                    <div className="point-dot red"></div>
                                    <div className="point-info">
                                        <span className="label">Destination</span>
                                        <span className="val">Kimisagara Market, KG 11 Ave</span>
                                    </div>
                                </div>
                            </div>

                            <div className="float-stats mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-secondary">Distance:</span>
                                    <span className="font-semibold">8.5 km</span>
                                </div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-secondary">Duration:</span>
                                    <span className="font-semibold">15 min</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-primary">
                                    <span>Fare:</span>
                                    <span>2,500 RWF</span>
                                </div>
                            </div>

                            <div className="float-actions mt-4 flex gap-2">
                                <button className="btn btn-primary flex-1">Call Driver</button>
                                <button className="btn bg-gray-100 flex-1 text-black">Message</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMap;
