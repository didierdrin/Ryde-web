import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const LandingLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isHome = location.pathname === '/';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col">
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-colors ${
                    isHome
                        ? ''
                        : 'bg-white border-b border-gray-200'
                }`}
                style={isHome ? { background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' } : undefined}
            >
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="flex items-center gap-2 no-underline">
                            <img
                                src="ryde-icon.png"
                                alt="RYDE"
                                className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className={`text-xl font-bold ${isHome ? 'text-white' : 'text-gray-900'}`}>RYDE</span>
                        </Link>

                        <div className="flex items-center gap-6">
                            {isHome && (
                                <>
                                    <a href="#features" className="hidden md:block text-white/80 hover:text-white">Features</a>
                                    {/* <a href="#pricing" className="hidden md:block text-white/80 hover:text-white">Pricing</a>
                                    <a href="#support" className="hidden md:block text-white/80 hover:text-white">Support</a> */}
                                </>
                            )}
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-lg ${isHome ? 'btn-outline-on-dark' : 'btn-outline-primary'}`}
                                onClick={() => navigate('/signup')}
                            >
                                Sign Up
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-lg ${isHome ? 'btn-outline-on-dark' : 'btn-outline-primary'}`}
                                onClick={() => navigate('/login')}
                            >
                                Log In
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="h-[60px] bg-white border-t border-gray-200 shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
                    <div className="flex h-full items-center justify-between gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-3 sm:gap-6">
                            <Link to="/privacy" className={`whitespace-nowrap no-underline ${location.pathname === '/privacy' ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>Privacy Policy</Link>
                            <Link to="/terms" className={`whitespace-nowrap no-underline ${location.pathname === '/terms' ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>Terms of Service</Link>
                            <Link to="/contact" className={`whitespace-nowrap no-underline ${location.pathname === '/contact' ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>Contact Us</Link>
                        </div>
                        <p className="text-gray-500 whitespace-nowrap">© {new Date().getFullYear()} RYDE. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingLayout;
