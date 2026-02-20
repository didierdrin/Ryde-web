import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Smartphone, MapPin, CreditCard, Calendar, User } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <img
                                src="ryde-icon.png"
                                alt="RYDE"
                                className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-xl font-bold text-gray-900">RYDE</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
                            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
                            <a href="#support" className="text-gray-600 hover:text-gray-900">Support</a>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="px-4 py-2 text-gray-600 hover:text-gray-900" onClick={() => navigate('/login')}>Sign Up</button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => navigate('/login')}>Log In</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative bg-gradient-to-br from-slate-50 to-slate-800 text-white py-20">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Your Private Transport, Managed <br /> Seamlessly</h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">RYDE offers a comprehensive solution for managing your private transport needs, from real-time booking to secure payments and flexible subscriptions.</p>
                </div>
            </header>

            {/* Key Features */}
            <section className="py-20 bg-white" id="features">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">RYDE provides a suite of tools designed to enhance your private transport experience.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Smartphone size={24} className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Ride Booking</h3>
                            <p className="text-gray-600">Book rides instantly with our intuitive interface, ensuring prompt and reliable service.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <MapPin size={24} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Driver Tracking</h3>
                            <p className="text-gray-600">Monitor your driver's location in real-time, providing peace of mind and accurate arrival estimates.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <CreditCard size={24} className="text-amber-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payment Options</h3>
                            <p className="text-gray-600">Enjoy secure and convenient payment methods, including credit cards and digital wallets.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Calendar size={24} className="text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Subscriptions</h3>
                            <p className="text-gray-600">Choose from a variety of subscription plans tailored to your specific transport requirements.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Experience the Future of Private <br /> Transport?</h2>
                    <p className="text-xl text-gray-600 mb-8">Join RYDE today and take control of your transport needs with our innovative platform.</p>
                    <button className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors" onClick={() => navigate('/login')}>Sign Up Now</button>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">How RYDE works</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">SwiftRide connects you with reliable drivers in minutes. Our platform ensures a safe and efficient transportation experience.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Smartphone size={20} className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Request a ride</h3>
                            <p className="text-gray-600">Use the app to request a ride, specifying your pickup location and destination.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <MapPin size={20} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose your destination</h3>
                            <p className="text-gray-600">Select your desired destination on the map or enter the address manually.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={20} className="text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Enjoy the journey</h3>
                            <p className="text-gray-600">Track your driver's progress in real-time and enjoy a comfortable ride to your destination.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Benefits of RYDE</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">SwiftRide offers a range of benefits for both passengers and drivers. Our platform is designed to provide a seamless rewarding experience.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="text-center">
                            <img src="https://images.unsplash.com/photo-1512428559087-560fa0d8988e?q=80&w=2070&auto=format&fit=crop" alt="Passenger" className="w-full h-64 object-cover rounded-lg mb-6" />
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Passengers</h3>
                            <p className="text-gray-600">RYDE offers a convenient and affordable way to get around. With a few taps, you can request a ride and track your driver's arrival in real-time.</p>
                        </div>
                        <div className="text-center">
                            <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop" alt="Driver" className="w-full h-64 object-cover rounded-lg mb-6" />
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Drivers</h3>
                            <p className="text-gray-600">Become a RYDE driver and earn on your own schedule. Our app provides flexible hours, competitive pay, and a user-friendly interface.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Customer Testimonials</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Sophia Clark</h4>
                                    <span className="text-sm text-gray-600">2 months ago</span>
                                </div>
                            </div>
                            <div className="text-amber-400 mb-3">★★★★★</div>
                            <p className="text-gray-600">RYDE has completely transformed my daily commute. The drivers are always professional, and the app is incredibly easy to use.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Ethan Bennett</h4>
                                    <span className="text-sm text-gray-600">3 months ago</span>
                                </div>
                            </div>
                            <div className="text-amber-400 mb-3">★★★★☆</div>
                            <p className="text-gray-600">I've been driving with RYDE for over a year now, and it's been a fantastic experience. The flexible hours allow me to work around my schedule.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Olivia Carter</h4>
                                    <span className="text-sm text-gray-600">4 months ago</span>
                                </div>
                            </div>
                            <div className="text-amber-400 mb-3">★★★★★</div>
                            <p className="text-gray-600">RYDE is my go-to for getting around the city. It's reliable, affordable, and the drivers are always friendly. I feel safe using the app.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-6 mb-4 md:mb-0">
                            <a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a>
                            <a href="/terms" className="text-gray-400 hover:text-white">Terms of Service</a>
                            <a href="/contact" className="text-gray-400 hover:text-white">Contact Us</a>
                        </div>
                        <p className="text-gray-400">© {new Date().getFullYear()} RYDE. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;