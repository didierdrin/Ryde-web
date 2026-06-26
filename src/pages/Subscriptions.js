import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import { CreditCard, Calendar, Trash2, Plus } from 'lucide-react';

const PLANS = [
    { id: 'BASIC', name: 'Basic Driver', amount: 10000, duration: '30 days' },
    { id: 'PREMIUM', name: 'Premium Driver', amount: 15000, duration: '30 days' },
];

function DriverSubscriptionView() {
    const handlePurchase = (plan) => {
        alert(`Subscription "${plan.name}" — payment will be completed with IremboPay when integrated.`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Subscription" subtitle="Buy a driver subscription — payment via IremboPay (to be integrated)" />
            <div className="max-w-2xl mx-auto p-6 w-full">
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                    Payment for subscriptions will use IremboPay once integrated.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PLANS.map((plan) => (
                        <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                            <p className="text-2xl font-bold text-blue-600 mt-2">RWF {plan.amount.toLocaleString()}</p>
                            <p className="text-sm text-gray-500 mt-1">{plan.duration}</p>
                            <button
                                type="button"
                                onClick={() => handlePurchase(plan)}
                                className="mt-6 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                            >
                                Buy subscription
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AdminSubscriptionView() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const { subscriptions: data } = await api.getAdminSubscriptions();
            setSubscriptions(data || []);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
        api.getAdminDrivers()
            .then((res) => setDrivers(res.drivers || []))
            .catch(() => setDrivers([]));
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this subscription?')) return;
        try {
            await api.cancelAdminSubscription(id);
            setSubscriptions((prev) => prev.filter((s) => s.id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to cancel');
        }
    };

    const addTestSubscription = async () => {
        const driver = drivers[0];
        if (!driver) {
            alert('No drivers in the database. Add a driver first.');
            return;
        }
        try {
            const start = new Date();
            const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await api.createAdminSubscription({
                driverId: driver.driverId || driver.driver_id,
                tier: 'PREMIUM',
                startDate: start.toISOString().slice(0, 10),
                endDate: end.toISOString().slice(0, 10),
            });
            fetchSubscriptions();
        } catch (error) {
            console.error(error);
            alert(error.message || 'Failed to create subscription');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Subscriptions" subtitle="Manage Driver Subscriptions" />
            <div className="p-6">
                <div className="flex justify-end mb-6">
                    <button type="button" onClick={addTestSubscription} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm">
                        <Plus size={16} /> Add Test Subscription
                    </button>
                </div>
                {loading ? (
                    <div className="text-center py-10">Loading subscriptions...</div>
                ) : subscriptions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">No Active Subscriptions</h3>
                        <p className="text-gray-500">No drivers with active subscriptions.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {(sub.driverName || 'D')[0]}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{sub.driverName || sub.driverId}</div>
                                                    <div className="text-sm text-gray-500">{sub.driverPhone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{sub.tier || sub.plan}</div>
                                            <div className="text-xs text-gray-500">{sub.commissionRate}% commission</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {sub.isActive ? 'ACTIVE' : 'CANCELLED'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col text-sm text-gray-500">
                                                <span className="flex items-center gap-1"><Calendar size={12} /> Start: {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}</span>
                                                <span className="flex items-center gap-1"><Calendar size={12} /> End: {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {sub.isActive && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancel(sub.id)}
                                                    className="text-red-600 hover:text-red-900 flex items-center gap-1 ml-auto"
                                                >
                                                    <Trash2 size={16} /> Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const Subscriptions = () => {
    const { isAdmin, isDriver } = useAuth();
    if (isAdmin) return <AdminSubscriptionView />;
    if (isDriver) return <DriverSubscriptionView />;
    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Subscription" subtitle="Not available for your role" />
            <div className="p-8 text-center text-gray-600">Subscription management is available for admins only.</div>
        </div>
    );
};

export default Subscriptions;
