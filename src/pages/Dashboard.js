import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { Users, Route, DollarSign, Crown } from 'lucide-react';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/Header';
import './Dashboard.css';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="stat-card">
        <div className="stat-info">
            <span className="stat-title">{title}</span>
            <h3 className="stat-value">{value}</h3>
            <span className={`stat-change ${change.includes('+') ? 'positive' : 'negative'}`}>
                {change} from last month
            </span>
        </div>
        <div className={`stat-icon-bg ${color}`}>
            <Icon size={24} className={`stat-icon ${color}-text`} />
        </div>
    </div>
);

const Dashboard = () => {
    const [recentRides, setRecentRides] = useState([]);
    const [drivers, setDrivers] = useState([]);

    // Mock data for charts to match screenshot aesthetics
    const weeklyRidesData = [
        { name: 'Mon', rides: 120 },
        { name: 'Tue', rides: 145 },
        { name: 'Wed', rides: 165 },
        { name: 'Thu', rides: 180 },
        { name: 'Fri', rides: 195 },
        { name: 'Sat', rides: 220 },
        { name: 'Sun', rides: 185 },
    ];

    const revenueData = [
        { name: 'Jan', revenue: 1.8 },
        { name: 'Feb', revenue: 2.1 },
        { name: 'Mar', revenue: 1.9 },
        { name: 'Apr', revenue: 2.3 },
        { name: 'May', revenue: 2.4 },
        { name: 'Jun', revenue: 2.2 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch recent rides
                const ridesQuery = query(
                    collection(db, "requestRiders"),
                    orderBy("createdAt", "desc"),
                    limit(5)
                );
                const rideSnapshot = await getDocs(ridesQuery);
                const rides = rideSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRecentRides(rides);

                // Fetch drivers (users)
                // Note: Real app would filter by role. Using all users for demo based on prompt data.
                const usersQuery = query(collection(db, "users"), limit(5));
                const userSnapshot = await getDocs(usersQuery);
                const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setDrivers(userList);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="dashboard-page">
            <Header title="Dashboard Overview" subtitle="Welcome back, manage your transport operations" />

            <div className="dashboard-content p-6">
                {/* Stats Grid */}
                <div className="stats-grid">
                    <StatCard
                        title="Total Rides"
                        value="12,847"
                        change="+12%"
                        icon={Route}
                        color="blue"
                    />
                    <StatCard
                        title="Active Drivers"
                        value="1,247"
                        change="+8%"
                        icon={Users}
                        color="green"
                    />
                    <StatCard
                        title="Revenue"
                        value="RWF 2.4M"
                        change="+15%"
                        icon={DollarSign}
                        color="amber"
                    />
                    <StatCard
                        title="Subscribers"
                        value="847"
                        change="+22%"
                        icon={Crown}
                        color="purple"
                    />
                </div>

                {/* Charts Section */}
                <div className="charts-grid mt-6">
                    <div className="card chart-card">
                        <h3 className="card-title">Rides Overview</h3>
                        <span className="card-subtitle">Weekly Rides</span>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart data={weeklyRidesData}>
                                    <defs>
                                        <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="rides" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRides)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card chart-card">
                        <h3 className="card-title">Revenue Trends</h3>
                        <span className="card-subtitle">Monthly Revenue (M RWF)</span>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Recent Rides & Top Drivers */}
                <div className="bottom-grid mt-6">
                    {/* Recent Rides Table */}
                    <div className="card table-card">
                        <h3 className="card-title mb-4">Recent Rides</h3>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Passenger</th>
                                        <th>Driver</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRides.length > 0 ? recentRides.map((ride) => (
                                        <tr key={ride.id}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="avatar-sm">
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.requestedBy}`} alt="user" />
                                                    </div>
                                                    <span className="font-medium text-sm">{ride.requestedBy ? ride.requestedBy.split('@')[0] : 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td>{ride.rider ? ride.rider.split('@')[0] : 'Pending'}</td>
                                            <td>
                                                <span className={`status-badge ${ride.status || 'pending'}`}>
                                                    {ride.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td>RWF {ride.price || 0}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center">Loading rides...</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Drivers List */}
                    <div className="card list-card">
                        <h3 className="card-title mb-4">Top Drivers</h3>
                        <div className="drivers-list">
                            {drivers.length > 0 ? drivers.map((driver, index) => (
                                <div key={driver.id} className="driver-item">
                                    <img
                                        src={driver.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.fullName}`}
                                        alt={driver.fullName}
                                        className="driver-avatar"
                                    />
                                    <div className="driver-info">
                                        <h4 className="driver-name">{driver.fullName}</h4>
                                        <div className="driver-rating">
                                            <span className="star">⭐</span>
                                            <span className="score">4.9 • 234 rides</span>
                                        </div>
                                    </div>
                                    <span className="driver-earnings">RWF 89,500</span>
                                </div>
                            )) : (
                                <p className="text-center text-secondary">Loading drivers...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
