import React from 'react';
import { Search, Bell } from 'lucide-react';
import './Header.css';

const Header = ({ title, subtitle }) => {
    return (
        <header className="top-header">
            <div className="header-content">
                <div>
                    <h2 className="page-title">{title}</h2>
                    <p className="page-subtitle">{subtitle}</p>
                </div>

                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Search..." />
                    </div>

                    <div className="notification-btn">
                        <Bell size={20} />
                        <span className="badge">3</span>
                    </div>

                    <div className="user-profile">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                            alt="Profile"
                            className="avatar"
                        />
                        <div className="user-info">
                            <span className="name">John Admin</span>
                            <span className="role">System Admin</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
