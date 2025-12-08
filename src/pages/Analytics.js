import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Route, Users, DollarSign, Star, Calendar } from 'lucide-react';
import Header from '../components/Header';
import './Analytics.css';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="stat-card">
        <div className="stat-info-col">
            <span className="stat-title">{title}</span>
            <div className="stat-value-row">
                <h3 className="stat-value">{value}</h3>
            </div>
            <span className={`stat-change ${change.includes('+') ? 'positive' : change.includes('-') ? 'negative' : 'neutral'}`}>
                {change}
            </span>
        </div>
        <div className={`stat-icon-bg ${color}`}>
            <Icon size={24} className={`stat-icon ${color}-text`} />
        </div>
    </div>
);

const Analytics = () => {
    // Mock Data
    const ridesData = [
        { name: 'Mon', rides: 200 },
        { name: 'Tue', rides: 180 },
        { name: 'Wed', rides: 240 },
        { name: 'Thu', rides: 300 },
        { name: 'Fri', rides: 280 },
        { name: 'Sat', rides: 420 },
        { name: 'Sun', rides: 450 },
    ];

    const revenueBreakdownData = [
        { name: 'Ride Fees', value: 65, color: '#3b82f6' },
        { name: 'Subscriptions', value: 25, color: '#f59e0b' },
        { name: 'Cancellation Fees', value: 5, color: '#ef4444' },
        { name: 'Tips', value: 5, color: '#10b981' },
    ];

    const subscriptionData = [
        { name: 'Premium', value: 456, color: '#3b82f6' },
        { name: 'Standard', value: 678, color: '#f59e0b' },
        { name: 'Basic', value: 234, color: '#94a3b8' },
    ];

    const topDrivers = [
        { name: 'John Uwimana', rides: 245, rating: 4.9, earnings: '$3,420' },
        { name: 'Eric Nzeyimana', rides: 198, rating: 4.8, earnings: '$2,890' },
        { name: 'David Mugisha', rides: 187, rating: 4.7, earnings: '$2,650' },
    ];

    const popularRoutes = [
        { route: 'Kigali → Nyanza', rides: '1,234 rides', percent: 80 },
        { route: 'Kigali → Huye', rides: '987 rides', percent: 65 },
        { route: 'Kigali → Musanze', rides: '756 rides', percent: 50 },
        { route: 'Kigali → Rubavu', rides: '623 rides', percent: 40 },
    ];

    const recentActivity = [
        { id: '#RY-2024-001', driver: 'John Uwimana', passenger: 'Alice Mukamana', route: 'Kigali → Nyanza', amount: '$15.50', status: 'Completed', time: '2 min ago' },
        { id: '#RY-2024-002', driver: 'Eric Nzeyimana', passenger: 'Bob Nkurunziza', route: 'Kigali → Huye', amount: '$22.00', status: 'In Progress', time: '5 min ago' },
        { id: '#RY-2024-003', driver: 'David Mugisha', passenger: 'Claire Uwase', route: 'Kigali → Musanze', amount: '$18.75', status: 'Completed', time: '8 min ago' },
    ];

    return (
        <div className="analytics-page">
            <Header title="Analytics Dashboard" subtitle="Monitor your transport system performance" />

            <div className="content-padding p-6">
                {/* Top Stats */}
                <div className="stats-grid">
                    <StatCard title="Total Rides" value="12,847" change="↑ 12.5% from last month" icon={Route} color="blue" />
                    <StatCard title="Active Drivers" value="1,234" change="↑ 8.2% from last month" icon={Users} color="green" />
                    <StatCard title="Revenue" value="$89,420" change="↑ 15.3% from last month" icon={DollarSign} color="amber" />
                    <StatCard title="Customer Rating" value="4.8" change="↑ 0.2 from last month" icon={Star} color="purple" />
                </div>

                {/* Charts Row 1 */}
                <div className="charts-grid-2 mt-6">
                    {/* Rides Over Time */}
                    <div className="card">
                        <div className="card-header flex justify-between items-center mb-4">
                            <h3 className="card-title">Rides Over Time</h3>
                            <div className="chart-filters flex gap-2">
                                <button className="filter-btn active">Daily</button>
                                <button className="filter-btn">Weekly</button>
                                <button className="filter-btn">Monthly</button>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart data={ridesData}>
                                    <defs>
                                        <linearGradient id="colorRidesAnalytics" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="rides" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRidesAnalytics)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Revenue Breakdown */}
                    <div className="card">
                        <div className="card-header flex justify-between items-center mb-4">
                            <h3 className="card-title">Revenue Breakdown</h3>
                            <span className="cursor-pointer">⋮</span>
                        </div>
                        <div style={{ width: '100%', height: 300 }} className="flex justify-center">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={revenueBreakdownData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {revenueBreakdownData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Middle Row: Top Drivers, Routes, Subscription */}
                <div className="grid-3 mt-6">
                    {/* Top Drivers */}
                    <div className="card">
                        <h3 className="card-title mb-4">Top Drivers</h3>
                        <div className="flex flex-col gap-4">
                            {topDrivers.map((driver, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} className="w-10 h-10 rounded-full bg-gray-100" alt={driver.name} />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm">{driver.name}</h4>
                                        <span className="text-secondary text-xs">{driver.rides} rides</span>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="font-semibold text-sm">{driver.earnings}</h4>
                                        <span className="text-accent text-xs flex items-center justify-end gap-1">★ {driver.rating}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular Routes */}
                    <div className="card">
                        <h3 className="card-title mb-4">Popular Routes</h3>
                        <div className="flex flex-col gap-4">
                            {popularRoutes.map((route, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-sm">{route.route}</span>
                                        <span className="text-secondary text-xs">{route.rides}</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div className="progress-bar-fill" style={{ width: `${route.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Subscription Stats */}
                    <div className="card">
                        <h3 className="card-title mb-4">Subscription Stats</h3>
                        <div className="flex items-center">
                            <div style={{ width: '150px', height: '150px' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={subscriptionData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                                            {subscriptionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 flex flex-col gap-2 ml-4">
                                {subscriptionData.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-secondary">{item.name}</span>
                                        </div>
                                        <span className="font-semibold">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card mt-6">
                    <h3 className="card-title mb-4">Recent Activity</h3>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ride ID</th>
                                    <th>Driver</th>
                                    <th>Passenger</th>
                                    <th>Route</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivity.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="text-secondary text-sm">{item.id}</td>
                                        <td className="font-medium text-sm">{item.driver}</td>
                                        <td className="text-sm">{item.passenger}</td>
                                        <td className="text-sm">{item.route}</td>
                                        <td className="text-sm">{item.amount}</td>
                                        <td>
                                            <span className={`status-badge ${item.status === 'Completed' ? 'confirmed' : 'pool'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="text-secondary text-sm">{item.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Analytics;
