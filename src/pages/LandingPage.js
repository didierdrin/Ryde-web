import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Smartphone, MapPin, CreditCard, Calendar, Star } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <div className="nav-logo">
                        <img 
    src="ryde-icon.png" 
    alt="RYDE" 
    style={{
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        objectFit: "cover"
    }}
/>                        <span className="brand-name">RYDE</span>
                    </div>

                    <div className="nav-links">
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#support">Support</a>
                    </div>

                    <div className="nav-auth">
                        <button className="btn-signup" onClick={() => navigate('/login')}>Sign Up</button>
                        <button className="btn-login" onClick={() => navigate('/login')}>Log In</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <div className="hero-bg-overlay"></div>
                <div className="hero-content container">
                    <h1>Your Private Transport, Managed <br /> Seamlessly</h1>
                    <p>RYDE offers a comprehensive solution for managing your private transport needs, from real-time booking to secure payments and flexible subscriptions.</p>
                </div>
            </header>

            {/* Key Features */}
            <section className="features-section container" id="features">
                <h2 className="section-title">Key Features</h2>
                <p className="section-subtitle">RYDE provides a suite of tools designed to enhance your private transport experience.</p>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="icon-box"><Smartphone size={24} /></div>
                        <h3>Real-Time Ride Booking</h3>
                        <p>Book rides instantly with our intuitive interface, ensuring prompt and reliable service.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon-box"><MapPin size={24} /></div>
                        <h3>Driver Tracking</h3>
                        <p>Monitor your driver's location in real-time, providing peace of mind and accurate arrival estimates.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon-box"><CreditCard size={24} /></div>
                        <h3>Secure Payment Options</h3>
                        <p>Enjoy secure and convenient payment methods, including credit cards and digital wallets.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon-box"><Calendar size={24} /></div>
                        <h3>Flexible Subscriptions</h3>
                        <p>Choose from a variety of subscription plans tailored to your specific transport requirements.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section container">
                <h2>Ready to Experience the Future of Private <br /> Transport?</h2>
                <p>Join RYDE today and take control of your transport needs with our innovative platform.</p>
                <button className="btn-primary-lg" onClick={() => navigate('/login')}>Sign Up Now</button>
            </section>

            {/* How It Works */}
            <section className="how-it-works container">
                <h2 className="section-title">How RYDE works</h2>
                <p className="section-subtitle">SwiftRide connects you with reliable drivers in minutes. Our platform ensures a safe and efficient transportation experience.</p>

                <div className="steps-grid">
                    <div className="step-card">
                        <div className="icon-box-sm"><Smartphone size={20} /></div>
                        <h3>Request a ride</h3>
                        <p>Use the app to request a ride, specifying your pickup location and destination.</p>
                    </div>
                    <div className="step-card">
                        <div className="icon-box-sm"><MapPin size={20} /></div>
                        <h3>Choose your destination</h3>
                        <p>Select your desired destination on the map or enter the address manually.</p>
                    </div>
                    <div className="step-card">
                        <div className="icon-box-sm"><CheckCircle size={20} /></div>
                        <h3>Enjoy the journey</h3>
                        <p>Track your driver's progress in real-time and enjoy a comfortable ride to your destination.</p>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="benefits-section container">
                <h2 className="section-title">Benefits of RYDE</h2>
                <p className="section-subtitle">SwiftRide offers a range of benefits for both passengers and drivers. Our platform is designed to provide a seamless rewarding experience.</p>

                <div className="benefits-grid">
                    <div className="benefit-item">
                        <img src="https://images.unsplash.com/photo-1512428559087-560fa0d8988e?q=80&w=2070&auto=format&fit=crop" alt="Passenger" />
                        <h3>For Passengers</h3>
                        <p>RYDE offers a convenient and affordable way to get around. With a few taps, you can request a ride and track your driver's arrival in real-time.</p>
                    </div>
                    <div className="benefit-item">
                        <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop" alt="Driver" />
                        <h3>For Drivers</h3>
                        <p>Become a RYDE driver and earn on your own schedule. Our app provides flexible hours, competitive pay, and a user-friendly interface.</p>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials-section bg-gray">
                <div className="container">
                    <h2 className="section-title">Customer Testimonials</h2>

                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="user-header">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia" alt="Sophia" />
                                <div>
                                    <h4>Sophia Clark</h4>
                                    <span>2 months ago</span>
                                </div>
                            </div>
                            <div className="stars">★★★★★</div>
                            <p>RYDE has completely transformed my daily commute. The drivers are always professional, and the app is incredibly easy to use.</p>
                        </div>
                        <div className="testimonial-card">
                            <div className="user-header">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan" alt="Ethan" />
                                <div>
                                    <h4>Ethan Bennett</h4>
                                    <span>3 months ago</span>
                                </div>
                            </div>
                            <div className="stars">★★★★☆</div>
                            <p>I've been driving with RYDE for over a year now, and it's been a fantastic experience. The flexible hours allow me to work around my schedule.</p>
                        </div>
                        <div className="testimonial-card">
                            <div className="user-header">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia" alt="Olivia" />
                                <div>
                                    <h4>Olivia Carter</h4>
                                    <span>4 months ago</span>
                                </div>
                            </div>
                            <div className="stars">★★★★★</div>
                            <p>RYDE is my go-to for getting around the city. It's reliable, affordable, and the drivers are always friendly. I feel safe using the app.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container footer-content">
                    <div className="footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Contact Us</a>
                    </div>
                    <p className="copyright">© 2023 RYDE. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
