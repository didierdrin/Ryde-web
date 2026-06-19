import React, { useCallback, useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, Ticket, Copy, Check } from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';

const formatRole = (userType) => {
    if (!userType) return 'User';
    const labels = { PASSENGER: 'Passenger', DRIVER: 'Driver', ADMIN: 'Admin' };
    return labels[userType] || userType;
};

const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [referral, setReferral] = useState(null);
    const [referralError, setReferralError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const loadReferralCode = useCallback(async () => {
        try {
            const data = await api.getAdminReferralCode();
            setReferral(data);
            setReferralError(null);
            setCountdown(data.secondsUntilExpiry ?? 0);
        } catch (err) {
            setReferralError(err.message || 'Failed to load referral code');
        }
    }, []);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await api.getProfile();
                if (data?.user) {
                    setUser(data.user);
                    if (data.user.userType === 'ADMIN') {
                        await loadReferralCode();
                    }
                } else {
                    setError('No profile data');
                }
            } catch (err) {
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [loadReferralCode]);

    useEffect(() => {
        if (!referral || user?.userType !== 'ADMIN') return undefined;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    loadReferralCode();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [referral, user?.userType, loadReferralCode]);

    const handleCopyReferral = async () => {
        if (!referral?.code) return;
        try {
            await navigator.clipboard.writeText(referral.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (_) {
            setReferralError('Could not copy to clipboard');
        }
    };

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

    const isAdmin = user.userType === 'ADMIN';

    return (
        <>
            <Header title="Profile" subtitle="Your account details" />
            <div className="p-8 space-y-6">
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

                {isAdmin && (
                    <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start gap-3">
                            <Ticket size={22} className="text-blue-600 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900">Referral code</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Share this code with new admins during sign up. It refreshes every hour.
                                </p>

                                {referralError && (
                                    <p className="text-red-600 text-sm mt-3">{referralError}</p>
                                )}

                                {referral?.code && (
                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <span className="font-mono text-2xl font-bold tracking-widest text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                                            {referral.code}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyReferral}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                )}

                                {referral?.code && countdown > 0 && (
                                    <p className="text-sm text-gray-500 mt-3">
                                        New code in {formatCountdown(countdown)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Profile;
