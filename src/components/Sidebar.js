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
    LogOut
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const navItems = [
        { to: '/app', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/app/rides', icon: Car, label: 'Rides' },
        { to: '/app/drivers', icon: Users, label: 'Drivers' },
        { to: '/app/passengers', icon: User, label: 'Passengers' },
        { to: '/app/payments', icon: CreditCard, label: 'Payments' },
        { to: '/app/analytics', icon: BarChart2, label: 'Analytics' },
        { to: '/app/subscription', icon: Crown, label: 'Subscription' },
    ];

    return (
        <aside className="sidebar">
            <div className="logo-container">
                <div className="logo-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" fill="#3B82F6" />
                        <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" fill="white" />
                    </svg>
                </div>
                <div className="logo-text">
                    <h1>RYDE</h1>
                    <span>Transport System</span>
                </div>
            </div>

            <nav className="nav-menu">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                <div className="nav-item logout">
                    <LogOut size={20} />
                    <span>Logout</span>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
