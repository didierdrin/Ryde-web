import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/app');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    const handleSocialLogin = async (providerName) => {
        try {
            let provider;
            if (providerName === 'google') provider = new GoogleAuthProvider();
            if (providerName === 'facebook') provider = new FacebookAuthProvider();

            await signInWithPopup(auth, provider);
            navigate('/app');
        } catch (err) {
            setError('Social login failed');
        }
    }

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-bg-overlay"></div>
                <div className="login-content-left">
                    <div className="brand-logo mb-6">
                        {/* SVG Logo */}
                        <img src="ryde-icon.png" alt="Ryde Logo" style={{width: "60px", height: "60px", borderRadius: "50%"}} />                        <h1>RYDE</h1>
                    </div>
                    <h2 className="hero-title">Secure login required. <br /> Enter your credentials to access your accounts.</h2>
                    <p className="hero-subtitle">Lorem ipsum dolor sit amet consectetur. Consequat et sapien eu dictum elit.</p>

                    <div className="carousel-indicators">
                        <span className="active"></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-form-container">
                    <h2 className="form-header">Email/Username</h2>

                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <h2 className="form-header mt-4">Password</h2>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <label className="checkbox-container">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="forgot-password">Forgot Password?</a>
                        </div>

                        {error && <p className="error-msg">{error}</p>}

                        <button type="submit" className="login-btn">Login</button>

                        <div className="divider">
                            <span>Or continue with</span>
                        </div>

                        <div className="social-login">
                            <button type="button" className="social-btn" onClick={() => handleSocialLogin('google')}>
                                <span className="social-icon google">G</span> Google
                            </button>
                            <button type="button" className="social-btn" onClick={() => handleSocialLogin('facebook')}>
                                <span className="social-icon facebook">f</span> Facebook
                            </button>
                        </div>

                        <p className="signup-link">
                            Don't have an account? <a href="#">Sign up</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
