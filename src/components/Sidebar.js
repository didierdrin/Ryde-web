import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Car,
    Users,
    User,
    ChevronRight,
    Crown,
    LogOut,
    ChevronLeft,
    MapPin,
    Route,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const navigate = useNavigate();
    const { user, logout, isPassenger, isDriver, isAdmin } = useAuth();

    const baseItems = [
        { to: '/app', icon: LayoutDashboard, label: 'Dashboard', roles: ['PASSENGER', 'DRIVER', 'ADMIN'] },
        { to: '/app/trips', icon: Route, label: 'Trips', roles: ['PASSENGER', 'DRIVER', 'ADMIN'] },
        { to: '/app/rides', icon: Car, label: 'Rides', roles: ['PASSENGER', 'ADMIN'] },
        { to: '/app/rentals', icon: MapPin, label: 'Rentals', roles: ['PASSENGER', 'ADMIN'] },
        { to: '/app/drivers', icon: Users, label: 'Drivers', roles: ['ADMIN'] },
        { to: '/app/passengers', icon: User, label: 'Passengers', roles: ['ADMIN'] },
        { to: '/app/subscription', icon: Crown, label: 'Subscription', roles: ['DRIVER', 'ADMIN'] },
    ];

    const navItems = baseItems.filter((item) => {
        const role = user?.userType;
        return role && item.roles.includes(role);
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col p-4 z-20 transition-all duration-300`}>
            <div className={`flex items-center gap-2 mb-8 ${isCollapsed ? 'justify-center' : ''} relative`}>
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <img src="ryde-icon.png" alt="Ryde Icon" width="24" height="24" className="w-10 h-10 rounded-full" />
                </div>
                {!isCollapsed && (
                    <div className="overflow-hidden whitespace-nowrap">
                        <h1 className="text-xl font-extrabold text-gray-900 leading-none">RYDE</h1>
                        <span className="text-xs text-gray-600">Transport System</span>
                    </div>
                )}

                <button
                    onClick={toggleSidebar}
                    className={`absolute -right-8 top-1/2 -translate-y-1/2 bg-white border border-gray-200 p-1 rounded-full shadow-sm text-gray-500 hover:text-blue-600 z-30 hidden md:flex ${isCollapsed ? 'right-[-32px]' : '-right-8'}`}
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/app'}
                        className={({ isActive }) =>
                            `flex items-center gap-4 p-3 rounded-lg font-medium transition-all group relative ${isActive
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                            } ${isCollapsed ? 'justify-center' : ''}`
                        }
                    >
                        <item.icon size={20} className="shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}

                <button
                    type="button"
                    onClick={handleLogout}
                    className={`flex items-center gap-4 p-3 rounded-lg text-gray-600 font-medium transition-all cursor-pointer mt-auto hover:bg-red-50 hover:text-red-500 group relative ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <LogOut size={20} className="shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                    {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity">
                            Logout
                        </div>
                    )}
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;
