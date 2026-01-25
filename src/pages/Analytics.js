import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Route, Users, DollarSign, Star, User } from 'lucide-react';
import Header from '../components/Header';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-6 flex justify-between items-start shadow-sm border border-gray-200">
        <div className="flex flex-col">
            <span className="text-gray-600 text-sm font-medium mb-1">{title}</span>
            <div>
                <h3 className="text-gray-900 text-3xl font-bold mb-1">{value}</h3>
            </div>
            <span className={`text-xs font-medium ${change.includes('+') ? 'text-green-600' :
                    change.includes('-') ? 'text-red-500' :
                        'text-gray-600'
                }`}>
                {change}
            </span>
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
        <div className="min-h-screen bg-gray-50">
            <Header title="Analytics Dashboard" subtitle="Monitor your transport system performance" />

            <div className="p-6">
                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Rides" value="12,847" change="↑ 12.5% from last month" icon={Route} color="blue" />
                    <StatCard title="Active Drivers" value="1,234" change="↑ 8.2% from last month" icon={Users} color="green" />
                    <StatCard title="Revenue" value="$89,420" change="↑ 15.3% from last month" icon={DollarSign} color="amber" />
                    <StatCard title="Customer Rating" value="4.8" change="↑ 0.2 from last month" icon={Star} color="purple" />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    {/* Rides Over Time */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Rides Over Time</h3>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md">Daily</button>
                                <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">Weekly</button>
                                <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">Monthly</button>
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
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Revenue Breakdown</h3>
                            <span className="cursor-pointer text-gray-400">⋮</span>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    {/* Top Drivers */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Drivers</h3>
                        <div className="flex flex-col gap-4">
                            {topDrivers.map((driver, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        <User size={20} className="text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm text-gray-900">{driver.name}</h4>
                                        <span className="text-gray-600 text-xs">{driver.rides} rides</span>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="font-semibold text-sm text-gray-900">{driver.earnings}</h4>
                                        <span className="text-amber-600 text-xs flex items-center justify-end gap-1">★ {driver.rating}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular Routes */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Routes</h3>
                        <div className="flex flex-col gap-4">
                            {popularRoutes.map((route, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-sm text-gray-900">{route.route}</span>
                                        <span className="text-gray-600 text-xs">{route.rides}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${route.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Subscription Stats */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Subscription Stats</h3>
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
                                            <span className="text-gray-600">{item.name}</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Ride ID</th>
                                    <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Driver</th>
                                    <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Passenger</th>
                                    <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Route</th>
                                    <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Amount</th>
                                    <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Status</th>
                                    <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivity.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-4 border-b border-gray-200 text-gray-600 text-sm">{item.id}</td>
                                        <td className="p-4 border-b border-gray-200 font-medium text-sm text-gray-900">{item.driver}</td>
                                        <td className="p-4 border-b border-gray-200 text-sm text-gray-900">{item.passenger}</td>
                                        <td className="p-4 border-b border-gray-200 text-sm text-gray-900">{item.route}</td>
                                        <td className="p-4 border-b border-gray-200 text-sm text-gray-900">{item.amount}</td>
                                        <td className="p-4 border-b border-gray-200">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 border-b border-gray-200 text-gray-600 text-sm">{item.time}</td>
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