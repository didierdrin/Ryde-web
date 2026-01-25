import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="flex h-screen w-screen overflow-hidden">
            <div className="flex-1 bg-cover bg-center relative flex flex-col justify-end p-16 text-white hidden lg:flex" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/80"></div>
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-4 mb-6">
                        <img src="ryde-icon.png" alt="Ryde Logo" className="w-10 h-10 rounded-full" />
                        <h1 className="text-4xl font-extrabold tracking-wider">RYDE</h1>
                    </div>
                    <h2 className="text-4xl font-bold mb-4 leading-tight">Secure login required. <br /> Enter your credentials to access your accounts.</h2>
                    <p className="text-lg text-white/80 mb-12">Lorem ipsum dolor sit amet consectetur. Consequat et sapien eu dictum elit.</p>
                    <div className="flex gap-2">
                        <span className="w-15 h-1 bg-white rounded-full"></span>
                        <span className="w-10 h-1 bg-white/30 rounded-full"></span>
                        <span className="w-10 h-1 bg-white/30 rounded-full"></span>
                    </div>
                </div>
            </div>

            <div className="flex-none w-full lg:w-[500px] bg-white flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <h2 className="text-base font-semibold text-gray-900 mb-2">Email/Username</h2>

                    <form onSubmit={handleLogin}>
                        <div className="mb-6">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>

                        <h2 className="text-base font-semibold text-gray-900 mb-2">Password</h2>
                        <div className="relative mb-4">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-lg hover:text-gray-600"
                            >
                                {showPassword ? '👁️' : '👁️'}
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-8 text-sm">
                            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                                <input type="checkbox" className="rounded" />
                                <span>Remember me</span>
                            </label>
                            <a href="/forgot-password" className="text-gray-600 hover:text-gray-900 no-underline">Forgot Password?</a>
                        </div>

                        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                        <button type="submit" className="w-full py-3 bg-blue-600 text-white border-none rounded-full font-semibold text-base cursor-pointer transition-colors hover:bg-blue-700">
                            Login
                        </button>

                        <p className="text-center text-sm text-gray-600 mt-12">
                            Don't have an account? <a href="/signup" className="text-gray-900 font-semibold no-underline">Sign up</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;