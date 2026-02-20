import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Car, Plus, CreditCard } from 'lucide-react';

// Placeholder in-memory list for demo (no rental API in backend yet)
const MOCK_VEHICLES = [
    { id: '1', make: 'Toyota', model: 'RAV4', year: 2022, color: 'White', type: 'SUV', dailyRate: 35000 },
    { id: '2', make: 'Honda', model: 'CR-V', year: 2021, color: 'Silver', type: 'SUV', dailyRate: 32000 },
    { id: '3', make: 'Toyota', model: 'Corolla', year: 2023, color: 'Black', type: 'SEDAN', dailyRate: 25000 },
];

const Rentals = () => {
    const { isPassenger, isAdmin } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState({
        make: '', model: '', year: '', color: '', vehicleType: 'SEDAN', dailyRate: ''
    });

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setVehicles([...MOCK_VEHICLES]);
            setLoading(false);
        }, 400);
    }, []);

    const handleAddVehicle = (e) => {
        e.preventDefault();
        const v = {
            id: String(Date.now()),
            make: newVehicle.make,
            model: newVehicle.model,
            year: Number(newVehicle.year),
            color: newVehicle.color,
            type: newVehicle.vehicleType,
            dailyRate: Number(newVehicle.dailyRate)
        };
        setVehicles(prev => [...prev, v]);
        setNewVehicle({ make: '', model: '', year: '', color: '', vehicleType: 'SEDAN', dailyRate: '' });
        setShowAddModal(false);
    };

    const handleRent = (vehicle) => {
        alert(`Rental booking for ${vehicle.make} ${vehicle.model} will use IremboPay when integrated. Payment placeholder.`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="Rentals"
                subtitle={isPassenger ? 'Rent a vehicle — payment via IremboPay (to be integrated)' : 'Add and manage rental vehicles'}
            />

            <div className="max-w-6xl mx-auto p-6">
                {isPassenger && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800">
                        <CreditCard size={20} />
                        <span>Payment for rentals will be completed with IremboPay once integrated.</span>
                    </div>
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
                    <div className="text-center py-12 text-gray-500">Loading vehicles…</div>
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
                            <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                                    <Car size={24} className="text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{v.make} {v.model}</h3>
                                <p className="text-sm text-gray-600 mt-1">{v.year} • {v.color} • {v.type}</p>
                                <p className="mt-4 text-xl font-semibold text-gray-900">RWF {Number(v.dailyRate).toLocaleString()} <span className="text-sm font-normal text-gray-500">/ day</span></p>
                                {isPassenger && (
                                    <button
                                        type="button"
                                        onClick={() => handleRent(v)}
                                        className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                    >
                                        Book (IremboPay later)
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
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
                                        <option value="HATCHBACK">Hatchback</option>
                                    </select>
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
