import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Header from '../components/Header';
import { StatusBadge, DetailRow } from '../components/ui/EntityUI';
import { User, Search, X, Loader, CreditCard } from 'lucide-react';

const passengerToEditForm = (p) => ({
    passengerId: p.passengerId,
    name: p.name || '',
    email: p.email || '',
    phoneNumber: p.phoneNumber || '',
    paymentMethod: p.paymentMethod || 'MTN_MOMO',
    emergencyContactName: p.emergencyContactName || '',
    emergencyContactPhone: p.emergencyContactPhone || '',
});

const Passengers = () => {
    const { isAdmin } = useAuth();
    const [passengers, setPassengers] = useState([]);
    const [filteredPassengers, setFilteredPassengers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPassenger, setSelectedPassenger] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchPassengers = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAdminPassengers();
            const list = data.passengers || [];
            setPassengers(list);
            setFilteredPassengers(list);
        } catch (error) {
            console.error('Error fetching passengers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPassengers();
    }, []);

    useEffect(() => {
        const lower = searchQuery.toLowerCase();
        setFilteredPassengers(
            passengers.filter(
                (p) =>
                    (p.name && p.name.toLowerCase().includes(lower)) ||
                    (p.phoneNumber && p.phoneNumber.toLowerCase().includes(lower)) ||
                    (p.email && p.email.toLowerCase().includes(lower))
            )
        );
    }, [searchQuery, passengers]);

    const openPassenger = (p) => {
        setSelectedPassenger(p);
        setEditForm(passengerToEditForm(p));
    };

    const closePassenger = () => {
        setSelectedPassenger(null);
        setEditForm(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editForm?.passengerId) return;
        setSaving(true);
        try {
            const { passenger } = await apiService.updateAdminPassenger(editForm.passengerId, {
                name: editForm.name,
                email: editForm.email,
                phoneNumber: editForm.phoneNumber,
                paymentMethod: editForm.paymentMethod,
                emergencyContactName: editForm.emergencyContactName,
                emergencyContactPhone: editForm.emergencyContactPhone,
            });
            setPassengers((prev) => prev.map((p) => (p.passengerId === passenger.passengerId ? passenger : p)));
            setSelectedPassenger(passenger);
            setEditForm(passengerToEditForm(passenger));
        } catch (error) {
            alert(error.message || 'Failed to update passenger');
        } finally {
            setSaving(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header title="Passengers" subtitle="Access restricted" />
                <div className="p-8 text-center text-gray-600">Only admins can view this page.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Passengers" subtitle="Registered passengers (API)" />

            <div className="p-6 flex-1">
                <div className="mb-6 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPassengers.map((p) => (
                            <div key={p.passengerId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
                                <div className="flex items-start gap-4 flex-1">
                                    {p.profilePictureUrl ? (
                                        <img src={p.profilePictureUrl} alt={p.name} className="w-14 h-14 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                                            <User className="text-purple-600" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">{p.name}</h3>
                                        <p className="text-sm text-gray-500">{p.phoneNumber}</p>
                                        <p className="text-xs text-gray-400">{p.email}</p>
                                    </div>
                                    {p.totalTrips != null && (
                                        <StatusBadge label={`${p.totalTrips} trips`} tone="neutral" />
                                    )}
                                </div>
                                <button type="button" onClick={() => openPassenger(p)} className="mt-4 w-full py-2.5 btn-outline-primary rounded-lg">View</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedPassenger && editForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Edit passenger</h3>
                            <button type="button" onClick={closePassenger} className="p-1.5 rounded-full text-gray-500 hover:text-gray-900"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Full name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                            <input required type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                            <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Phone" value={editForm.phoneNumber} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment method</label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={editForm.paymentMethod} onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}>
                                    <option value="MTN_MOMO">MTN MoMo</option>
                                    <option value="AIRTEL_MONEY">Airtel Money</option>
                                    <option value="CARD">Card</option>
                                    <option value="CASH">Cash</option>
                                </select>
                            </div>
                            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Emergency contact name" value={editForm.emergencyContactName} onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })} />
                            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Emergency contact phone" value={editForm.emergencyContactPhone} onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })} />
                            <div className="rounded-lg border border-gray-200 px-4">
                                {selectedPassenger.ageYears != null && <DetailRow label="Age" value={`${selectedPassenger.ageYears} years`} />}
                                {selectedPassenger.rating != null && <DetailRow label="Rating" value={selectedPassenger.rating} />}
                                {selectedPassenger.totalTrips != null && <DetailRow label="Total trips" value={selectedPassenger.totalTrips} icon={CreditCard} />}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={closePassenger} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2 btn-outline-primary rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving && <Loader size={16} className="animate-spin" />}
                                    Save changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Passengers;
