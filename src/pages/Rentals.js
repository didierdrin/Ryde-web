import React, { useCallback, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import { Car, Plus, CreditCard, Loader, ImageIcon } from 'lucide-react';

const IPAY_PUBLIC_KEY = process.env.REACT_APP_IPAY_PUBLIC_KEY || '';

const DEFAULT_CAR_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80';

async function waitForRentalIntentCompleted(intentId, maxMs = 45000) {
    const start = Date.now();
    while (Date.now() - start < maxMs) {
        const { intent } = await api.getRentalIntent(intentId);
        if (intent.status === 'COMPLETED') return 'COMPLETED';
        if (intent.status === 'FAILED') return 'FAILED';
        await new Promise((r) => setTimeout(r, 2000));
    }
    return 'TIMEOUT';
}

const Rentals = () => {
    const { isPassenger, isAdmin } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState({
        make: '', model: '', year: '', color: '', vehicleType: 'SEDAN', dailyRate: '', imageUrl: '', description: ''
    });
    const [payingVehicleId, setPayingVehicleId] = useState(null);
    const [error, setError] = useState(null);

    const loadVehicles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { vehicles: list } = await api.getRentalVehicles(isAdmin);
            setVehicles(list || []);
        } catch (e) {
            setError(e.message || 'Failed to load rental vehicles');
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            const { vehicle } = await api.createRentalVehicle({
                make: newVehicle.make,
                model: newVehicle.model,
                year: Number(newVehicle.year),
                color: newVehicle.color,
                vehicleType: newVehicle.vehicleType,
                dailyRate: Number(newVehicle.dailyRate),
                imageUrl: newVehicle.imageUrl || DEFAULT_CAR_IMAGE,
                description: newVehicle.description,
            });
            setVehicles((prev) => [...prev, vehicle]);
            setNewVehicle({ make: '', model: '', year: '', color: '', vehicleType: 'SEDAN', dailyRate: '', imageUrl: '', description: '' });
            setShowAddModal(false);
        } catch (e) {
            alert(e.message || 'Failed to add vehicle');
        }
    };

    const handleRent = async (vehicle, days = 1) => {
        if (!IPAY_PUBLIC_KEY) {
            alert('Payment (IremboPay) is not configured.');
            return;
        }
        if (typeof window.IremboPay === 'undefined') {
            alert('Payment system is not ready. Please refresh and try again.');
            return;
        }
        const amount = Number(vehicle.dailyRate) * Math.max(1, Number(days));
        if (!amount || amount <= 0) {
            alert('Invalid amount.');
            return;
        }
        setPayingVehicleId(vehicle.id);
        try {
            const { invoiceNumber, intentId } = await api.createInvoiceForAmount(amount, undefined, vehicle.id);
            if (!invoiceNumber || !intentId) {
                alert('Could not create payment invoice. Please try again.');
                return;
            }
            window.IremboPay.initiate({
                publicKey: IPAY_PUBLIC_KEY,
                invoiceNumber,
                locale: window.IremboPay.locale.EN,
                callback: async (err) => {
                    setPayingVehicleId(null);
                    if (!err) {
                        const outcome = await waitForRentalIntentCompleted(intentId);
                        if (outcome === 'COMPLETED') {
                            alert(`Booking confirmed for ${vehicle.make} ${vehicle.model}. Payment successful!`);
                        } else if (outcome === 'FAILED') {
                            alert('Payment was recorded as failed.');
                        } else {
                            alert('Payment is processing. If booking status does not update, refresh or contact support.');
                        }
                    } else {
                        alert('Payment failed or was cancelled.');
                    }
                },
            });
        } catch (e) {
            setPayingVehicleId(null);
            alert(e.message || 'Failed to start payment.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="Rentals"
                subtitle={isPassenger ? 'Rent a vehicle — pay with IremboPay' : 'Add and manage rental vehicles'}
            />

            <div className="max-w-6xl mx-auto p-6">
                {isPassenger && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-800">
                        <CreditCard size={20} />
                        <span>Pay securely with IremboPay when you book.</span>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
                )}

                {isAdmin && (
                    <div className="mb-6 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            <Plus size={18} /> Add vehicle for rental
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12 text-gray-500 flex items-center justify-center gap-2">
                        <Loader className="animate-spin" size={20} /> Loading vehicles…
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Car size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-600">No vehicles available for rental.</p>
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setShowAddModal(true)}
                                className="mt-4 text-blue-600 font-medium hover:underline"
                            >
                                Add first vehicle
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map((v) => (
                            <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                <div className="h-44 bg-gray-100 relative">
                                    <img
                                        src={v.imageUrl || DEFAULT_CAR_IMAGE}
                                        alt={`${v.make} ${v.model}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = DEFAULT_CAR_IMAGE; }}
                                    />
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">{v.make} {v.model}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{v.year} • {v.color} • {v.type}</p>
                                    {v.description && (
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{v.description}</p>
                                    )}
                                    <p className="mt-4 text-xl font-semibold text-gray-900">
                                        RWF {Number(v.dailyRate).toLocaleString()}{' '}
                                        <span className="text-sm font-normal text-gray-500">/ day</span>
                                    </p>
                                    {isPassenger && (
                                        <button
                                            type="button"
                                            onClick={() => handleRent(v)}
                                            disabled={payingVehicleId === v.id}
                                            className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {payingVehicleId === v.id ? <Loader size={18} className="animate-spin" /> : null}
                                            Book (Pay with IremboPay)
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Add vehicle for rental</h3>
                            <form onSubmit={handleAddVehicle} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                                        <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.make} onChange={e => setNewVehicle({ ...newVehicle, make: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                        <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.model} onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                        <input type="number" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.year} onChange={e => setNewVehicle({ ...newVehicle, year: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.color} onChange={e => setNewVehicle({ ...newVehicle, color: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.vehicleType} onChange={e => setNewVehicle({ ...newVehicle, vehicleType: e.target.value })}>
                                        <option value="SEDAN">Sedan</option>
                                        <option value="SUV">SUV</option>
                                        <option value="MOTORCYCLE">Motorcycle</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <ImageIcon size={14} /> Image URL
                                    </label>
                                    <input type="url" required placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.imageUrl} onChange={e => setNewVehicle({ ...newVehicle, imageUrl: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.description} onChange={e => setNewVehicle({ ...newVehicle, description: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Daily rate (RWF)</label>
                                    <input type="number" required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.dailyRate} onChange={e => setNewVehicle({ ...newVehicle, dailyRate: e.target.value })} />
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Add vehicle</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rentals;
