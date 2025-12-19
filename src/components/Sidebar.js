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
                    <img src="ryde-icon.png" alt="Ryde Icon" width="24" height="24" style={{borderRadius: '50%'}} />                </div>
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

                <div 
                    className="nav-item logout" 
                    onClick={() => {
                        // Sign out from Firebase Auth
                        import('firebase/auth').then(({ getAuth, signOut }) => {
                            const auth = getAuth();
                            signOut(auth).then(() => {
                                // Redirect to login page after successful logout
                                window.location.href = '/login';
                            }).catch((error) => {
                                console.error('Logout error:', error);
                            });
                        });
                    }}
                > </div>

                <div className="nav-item logout">
                    <LogOut size={20} />
                    <span>Logout</span>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
