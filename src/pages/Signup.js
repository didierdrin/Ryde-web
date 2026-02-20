import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const USER_TYPES = [
  { value: 'PASSENGER', label: 'Passenger' },
  { value: 'DRIVER', label: 'Driver' },
];

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    userType: 'PASSENGER',
    licenseNumber: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.userType === 'DRIVER' && !formData.licenseNumber.trim()) {
      setError('License number is required for drivers');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        userType: formData.userType,
      };
      if (formData.userType === 'DRIVER' && formData.licenseNumber.trim()) {
        payload.licenseNumber = formData.licenseNumber.trim();
      }
      await api.register(payload);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isDriver = formData.userType === 'DRIVER';

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div
        className="flex-1 bg-cover bg-center relative flex flex-col justify-end p-16 text-white hidden lg:flex"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/80"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <img src="ryde-icon.png" alt="Ryde Logo" className="w-10 h-10 rounded-full" />
            <h1 className="text-4xl font-extrabold tracking-wider">RYDE</h1>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Create your account. <br /> Join Ryde and start your journey.
          </h2>
          <p className="text-lg text-white/80 mb-12">
            Register as a passenger or driver. One account, flexible options.
          </p>
          <div className="flex gap-2">
            <span className="w-15 h-1 bg-white rounded-full"></span>
            <span className="w-10 h-1 bg-white/30 rounded-full"></span>
            <span className="w-10 h-1 bg-white/30 rounded-full"></span>
          </div>
        </div>
      </div>

      <div className="flex-none w-full lg:w-[500px] bg-white flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-14">Sign up</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-1">Full name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Arnold Mutabazi"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="a.mutabazi@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-1">Phone number</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="250788123456"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-1">Account type</label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white"
              >
                {USER_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {isDriver && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  License number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  placeholder="e.g. DL123456"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-lg hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Confirm password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white border-none rounded-full font-semibold text-base cursor-pointer transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>

            <p className="text-center text-sm text-gray-600 mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-gray-900 font-semibold no-underline hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
