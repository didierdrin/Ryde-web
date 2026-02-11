import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { Users, Route, DollarSign, Crown, User, Loader } from 'lucide-react';
import api from '../services/api';
import Header from '../components/Header';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-6 flex justify-between items-start shadow-sm border border-gray-200">
        <div className="flex flex-col">
            <span className="text-gray-600 text-sm font-medium mb-1">{title}</span>
            <h3 className="text-gray-900 text-3xl font-bold mb-1">{value}</h3>
            {change && (
                <span className={`text-xs font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                    {change} from last period
                </span>
            )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color === 'blue' ? 'bg-blue-100' :
            color === 'green' ? 'bg-green-100' :
                color === 'amber' ? 'bg-amber-100' :
                    'bg-purple-100'
            }`}>
            <Icon size={24} className={`${color === 'blue' ? 'text-blue-600' :
                color === 'green' ? 'text-green-600' :
                    color === 'amber' ? 'text-amber-600' :
                        'text-purple-600'
                }`} />
        </div>
    </div>
);

const Dashboard = () => {
    const [recentRides, setRecentRides] = useState([]);
    const [topDrivers, setTopDrivers] = useState([]);
    const [stats, setStats] = useState({
        totalRides: 0,
        activeDrivers: 0,
        revenue: 0,
        subscribers: 0
    });
    const [chartData, setChartData] = useState({
        weeklyRides: [],
        monthlyRevenue: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch trips data
                const tripsResponse = await api.getTrips();
                const trips = tripsResponse.trips || [];

                // Calculate stats
                const totalRides = trips.length;
                const completedTrips = trips.filter(t => t.status === 'COMPLETED');
                const activeDrivers = new Set(trips.filter(t => t.driver_id).map(t => t.driver_id)).size;
                const revenue = completedTrips.reduce((acc, trip) => acc + (Number(trip.fare) || 0), 0);

                setStats({
                    totalRides,
                    activeDrivers,
                    revenue,
                    subscribers: 0 // Would need separate endpoint for subscriptions
                });

                // Process Chart Data (Weekly Rides)
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const ridesPerDay = new Array(7).fill(0);
                const now = new Date();

                trips.forEach(trip => {
                    if (trip.request_time) {
                        const date = new Date(trip.request_time);
                        const diffTime = Math.abs(now - date);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays <= 7) {
                            ridesPerDay[date.getDay()] += 1;
                        }
                    }
                });

                const weeklyData = days.map((day, index) => ({
                    name: day,
                    rides: ridesPerDay[index]
                }));

                // Process Chart Data (Revenue)
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const revenuePerMonth = new Array(12).fill(0);

                completedTrips.forEach(trip => {
                    if (trip.request_time) {
                        const date = new Date(trip.request_time);
                        if (date.getFullYear() === now.getFullYear()) {
                            revenuePerMonth[date.getMonth()] += Number(trip.fare) || 0;
                        }
                    }
                });

                const monthlyRevenueData = months.map((month, index) => ({
                    name: month,
                    revenue: revenuePerMonth[index] / 1000
                }));

                setChartData({
                    weeklyRides: weeklyData,
                    monthlyRevenue: monthlyRevenueData
                });

                // Recent Rides (Sort by date)
                const sortedRides = [...trips].sort((a, b) => {
                    const dateA = new Date(a.request_time || 0);
                    const dateB = new Date(b.request_time || 0);
                    return dateB - dateA;
                }).slice(0, 5);
                setRecentRides(sortedRides);

                // Top Drivers - Extract from trips
                const driverStats = {};
                completedTrips.forEach(trip => {
                    if (trip.driver_id && trip.driver_name) {
                        if (!driverStats[trip.driver_id]) {
                            driverStats[trip.driver_id] = {
                                id: trip.driver_id,
                                fullName: trip.driver_name,
                                rides: 0,
                                earnings: 0,
                                rating: trip.driver_rating || '5.0'
                            };
                        }
                        driverStats[trip.driver_id].rides += 1;
                        driverStats[trip.driver_id].earnings += Number(trip.fare) || 0;
                    }
                });

                const topDriversList = Object.values(driverStats)
                    .sort((a, b) => b.earnings - a.earnings)
                    .slice(0, 5);
                setTopDrivers(topDriversList);

                setLoading(false);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper to format currency
    const formatCurrency = (amount) => {
        if (amount >= 1000000) {
            return `RWF ${(amount / 1000000).toFixed(1)}M`;
        }
        return `RWF ${amount.toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader className="animate-spin text-blue-600 mb-4" size={32} />
                    <p className="text-gray-500">Loading Dashboard Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Dashboard Overview" subtitle="Welcome back, manage your transport operations" />

            <div className="max-w-7xl mx-auto p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Rides"
                        value={stats.totalRides.toLocaleString()}
                        change="+5%" // Calculated change would require historical data
                        icon={Route}
                        color="blue"
                    />
                    <StatCard
                        title="Active Drivers"
                        value={stats.activeDrivers.toLocaleString()}
                        change="+0%"
                        icon={Users}
                        color="green"
                    />
                    <StatCard
                        title="Revenue"
                        value={formatCurrency(stats.revenue)}
                        change="+12%"
                        icon={DollarSign}
                        color="amber"
                    />
                    <StatCard
                        title="Subscribers"
                        value={stats.subscribers.toLocaleString()}
                        icon={Crown}
                        color="purple"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Rides Overview</h3>
                        <span className="text-sm text-gray-600 block mb-6">Weekly Activity</span>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart data={chartData.weeklyRides}>
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

                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
                        <span className="text-sm text-gray-600 block mb-6">Monthly Revenue (in '000 RWF)</span>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData.monthlyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Recent Rides & Top Drivers */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    {/* Recent Rides Table */}
                    <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Rides</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">User / Requester</th>
                                        <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Locations</th>
                                        <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Status</th>
                                        <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRides.length > 0 ? recentRides.map((ride) => (
                                        <tr key={ride.id}>
                                            <td className="p-4 border-b border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                                        <User size={16} className="text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-sm text-gray-900 block">{ride.passenger_name || 'Unknown'}</span>
                                                        <span className="text-xs text-gray-500">{ride.request_time ? new Date(ride.request_time).toLocaleDateString() : 'Date N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 border-b border-gray-200 text-gray-600 text-sm">
                                                <div className="flex flex-col text-xs">
                                                    <span className="truncate w-32" title={ride.pickup_address}>From: {ride.pickup_address || 'N/A'}</span>
                                                    <span className="truncate w-32" title={ride.destination_address}>To: {ride.destination_address || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 border-b border-gray-200">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${ride.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                                                    ride.status === 'REQUESTED' ? 'bg-amber-100 text-amber-600' :
                                                        ride.status === 'CANCELLED' ? 'bg-red-100 text-red-500' :
                                                            'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {ride.status || 'REQUESTED'}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b border-gray-200 text-gray-900 text-sm">RWF {ride.fare || 0}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center p-4 text-gray-600">No recent rides found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Drivers List */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Active Drivers</h3>
                        <div className="flex flex-col gap-4">
                            {topDrivers.length > 0 ? topDrivers.map((driver, index) => (
                                <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                        <User size={24} className="text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900 truncate w-32">{driver.fullName}</h4>
                                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                            <span>⭐</span>
                                            <span>{driver.rating} • {driver.rides} rides</span>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-green-600 text-sm">{formatCurrency(driver.earnings)}</span>
                                </div>
                            )) : (
                                <p className="text-center text-gray-600">No active drivers found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;