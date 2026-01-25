import React, { useEffect, useState } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Header = ({ title, subtitle }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearchTerm(query);
        }
    }, [searchParams]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim()) {
            navigate(`/app/search?q=${encodeURIComponent(value)}`);
        } else {
            navigate(`/app`);
        }
    };

    return (
        <header className="h-20 bg-white border-b border-gray-200 flex items-center px-8 sticky top-0 z-10">
            <div className="w-full flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-600">{subtitle}</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative w-80">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        />
                    </div>

                    <div className="relative p-2 cursor-pointer text-gray-600">
                        <Bell size={20} />
                        <span className="absolute -top-0 -right-0 bg-red-500 text-white text-xs font-bold h-4 w-4 rounded-full flex items-center justify-center">
                            3
                        </span>
                    </div>

                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center">
                            <User size={20} className="text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">John Admin</span>
                            <span className="text-xs text-gray-600">System Admin</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;