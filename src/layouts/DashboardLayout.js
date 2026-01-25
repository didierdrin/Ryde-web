import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
            <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;