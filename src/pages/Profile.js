import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';

const formatRole = (userType) => {
    if (!userType) return 'User';
    const labels = { PASSENGER: 'Passenger', DRIVER: 'Driver', ADMIN: 'Admin' };
    return labels[userType] || userType;
};

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await api.getProfile();
                if (data?.user) setUser(data.user);
                else setError('No profile data');
            } catch (err) {
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    if (loading) {
        return (
            <>
                <Header title="Profile" subtitle="Your account details" />
                <div className="p-8 flex items-center justify-center">
                    <p className="text-gray-500">Loading profile…</p>
                </div>
            </>
        );
    }

    if (error || !user) {
        return (
            <>
                <Header title="Profile" subtitle="Your account details" />
                <div className="p-8">
                    <p className="text-red-600">{error || 'Profile not found.'}</p>
                </div>
            </>
        );
    }

    const registrationDate = user.registrationDate
        ? new Date(user.registrationDate).toLocaleDateString(undefined, {
              dateStyle: 'medium',
          })
        : '—';

    return (
        <>
            <Header title="Profile" subtitle="Your account details" />
            <div className="p-8">
                <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600" />
                    <div className="px-8 pb-8 -mt-12 relative">
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center shadow-sm">
                            <User size={40} className="text-blue-600" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-gray-600 flex items-center gap-2 mt-1">
                            <Shield size={16} className="shrink-0" />
                            {formatRole(user.userType)}
                        </p>
                        <dl className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 text-gray-700">
                                <Mail size={20} className="text-gray-400 shrink-0" />
                                <div>
                                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Email</dt>
                                    <dd>{user.email}</dd>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Phone size={20} className="text-gray-400 shrink-0" />
                                <div>
                                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Phone</dt>
                                    <dd>{user.phoneNumber || '—'}</dd>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Calendar size={20} className="text-gray-400 shrink-0" />
                                <div>
                                    <dt className="text-xs text-gray-500 uppercase tracking-wider">Member since</dt>
                                    <dd>{registrationDate}</dd>
                                </div>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
