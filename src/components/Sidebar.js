import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Car,
    Users,
    User,
    CreditCard,
    BarChart2,
    Crown,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu
} from 'lucide-react';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const navItems = [
        { to: '/app', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/app/rides', icon: Car, label: 'Rides' },
        { to: '/app/drivers', icon: Users, label: 'Drivers' },
        { to: '/app/passengers', icon: User, label: 'Passengers' },
        // { to: '/app/payments', icon: CreditCard, label: 'Payments' },
        // { to: '/app/analytics', icon: BarChart2, label: 'Analytics' },
        { to: '/app/subscription', icon: Crown, label: 'Subscription' },
    ];

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

                {/* Toggle Button */}
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

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}

                <button
                    className={`flex items-center gap-4 p-3 rounded-lg text-gray-600 font-medium transition-all cursor-pointer mt-auto hover:bg-red-50 hover:text-red-500 group relative ${isCollapsed ? 'justify-center' : ''}`}
                    onClick={() => {
                        import('firebase/auth').then(({ getAuth, signOut }) => {
                            const auth = getAuth();
                            signOut(auth).then(() => {
                                window.location.href = '/login';
                            }).catch((error) => {
                                console.error('Logout error:', error);
                            });
                        });
                    }}
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

            {/* Mobile Toggle inside sidebar at bottom if needed, or rely on top button */}
        </aside>
    );
};

export default Sidebar;