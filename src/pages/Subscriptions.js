import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, Timestamp } from 'firebase/firestore';
import Header from '../components/Header';
import { CreditCard, Calendar, Trash2, CheckCircle, Plus } from 'lucide-react';

const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Subscriptions (assuming 'subscriptions' collection exists or we create one)
    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const subSnapshot = await getDocs(collection(db, 'subscriptions'));
            const subs = subSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSubscriptions(subs); // If empty, we might want to add a button to seed dummy data or add manually
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleCancelSubscription = async (id) => {
        if (window.confirm("Are you sure you want to cancel this subscription?")) {
            try {
                await deleteDoc(doc(db, 'subscriptions', id));
                setSubscriptions(prev => prev.filter(s => s.id !== id));
            } catch (error) {
                console.error("Error deleting subscription:", error);
                alert("Failed to cancel subscription");
            }
        }
    };

    // Helper to add a mock subscription for testing since the data might be empty
    const addMockSubscription = async () => {
        try {
            await addDoc(collection(db, 'subscriptions'), {
                userId: "mailto:didiercode20@gmail.com",
                userName: "Didier Code",
                plan: "Premium Driver",
                amount: 15000,
                status: "active",
                startDate: Timestamp.now(),
                endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
            });
            fetchSubscriptions();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Subscriptions" subtitle="Manage Driver Subscriptions" />

            <div className="p-6">
                <div className="flex justify-end mb-6">
                    <button onClick={addMockSubscription} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm">
                        <Plus size={16} /> Add Test Subscription
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading subscriptions...</div>
                ) : subscriptions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">No Active Subscriptions</h3>
                        <p className="text-gray-500">There are no drivers with active subscriptions currently.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User / Driver</th>
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
                                                    {sub.userName ? sub.userName[0] : 'U'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{sub.userName || sub.userId}</div>
                                                    <div className="text-sm text-gray-500">{sub.userId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">{sub.plan}</div>
                                            <div className="text-xs text-gray-500">{sub.amount} RWF/mo</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {sub.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col text-sm text-gray-500">
                                                <span className="flex items-center gap-1"><Calendar size={12} /> Start: {sub.startDate ? new Date(sub.startDate.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                                                <span className="flex items-center gap-1"><Calendar size={12} /> End: {sub.endDate ? new Date(sub.endDate.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleCancelSubscription(sub.id)}
                                                className="text-red-600 hover:text-red-900 flex items-center gap-1 ml-auto"
                                                title="Cancel Subscription"
                                            >
                                                <Trash2 size={16} /> Cancel
                                            </button>
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
};

export default Subscriptions;