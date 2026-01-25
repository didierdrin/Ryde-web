import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, Timestamp } from 'firebase/firestore';
import Header from '../components/Header';
import { User, Search, MapPin, Plus, Navigation } from 'lucide-react';

const Passengers = () => {
    const [passengers, setPassengers] = useState([]);
    const [filteredPassengers, setFilteredPassengers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRideModalOpen, setIsRideModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Ride Form State
    const [rideForm, setRideForm] = useState({
        pickup: '',
        dropoff: '',
    });

    const fetchPassengers = async () => {
        try {
            setLoading(true);
            // Fetch users. Assuming role logic isn't strictly defined in 'users', we fetch all users.
            // If there's a type field, we'd filter. The schema doesn't show a type.
            const q = query(collection(db, 'users'));
            const querySnapshot = await getDocs(q);
            const users = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPassengers(users);
            setFilteredPassengers(users);
        } catch (error) {
            console.error("Error fetching passengers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPassengers();
    }, []);

    useEffect(() => {
        const lower = searchQuery.toLowerCase();
        const filtered = passengers.filter(p =>
            (p.fullName && p.fullName.toLowerCase().includes(lower)) ||
            (p.phoneNumber && p.phoneNumber.toLowerCase().includes(lower)) ||
            (p.email && p.email.toLowerCase().includes(lower))
        );
        setFilteredPassengers(filtered);
    }, [searchQuery, passengers]);

    const handleCreateRide = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            await addDoc(collection(db, 'requestRiders'), {
                rider: selectedUser.phoneNumber || selectedUser.id, // Using identifier available
                requestedBy: "admin", // Or current user
                pickupLocation: {
                    address: rideForm.pickup,
                    latitude: -1.9441, // Default/Mock for now unless Geocoding
                    longitude: 30.0619
                },
                dropoffLocation: {
                    address: rideForm.dropoff,
                    latitude: -1.9500,
                    longitude: 30.0600
                },
                status: 'confirmed', // or 'requested'
                createdAt: Timestamp.now(),
                requestedTime: Timestamp.now(),
                seats: 1,
                price: 0,
                type: 'passengers',
                accepted: false,
                cancelled: false,
                completed: false,
                isDriverNotified: false,
                isPassengerNotified: false
            });
            setIsRideModalOpen(false);
            setRideForm({ pickup: '', dropoff: '' });
            alert(`Ride created for ${selectedUser.fullName}!`);
        } catch (error) {
            console.error("Error creating ride:", error);
            alert("Failed to create ride.");
        }
    };

    const openRideModal = (user) => {
        setSelectedUser(user);
        setIsRideModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Passengers" subtitle="Manage Users & Create Rides" />

            <div className="p-6">
                {/* Search & Filter */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search passengers by name or phone..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users Grid */}
                {loading ? (
                    <div className="text-center py-10">Loading passengers...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPassengers.map(user => (
                            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            user.fullName ? user.fullName[0].toUpperCase() : <User />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{user.fullName || "Unnamed User"}</h3>
                                        <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 mb-4 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Wallet Balance:</span>
                                        <span className="font-semibold text-gray-900">{user.walletBalance || 0} RWF</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Joined:</span>
                                        <span>{user.joinedOn ? new Date(user.joinedOn.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openRideModal(user)}
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} /> New Ride Request
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Ride Modal */}
            {isRideModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">New Ride Request</h3>
                        <p className="text-sm text-gray-500 mb-6">Create a ride for <span className="font-semibold text-blue-600">{selectedUser.fullName}</span></p>

                        <form onSubmit={handleCreateRide} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter pickup address"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={rideForm.pickup}
                                        onChange={e => setRideForm({ ...rideForm, pickup: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Location</label>
                                <div className="relative">
                                    <Navigation className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter dropoff address"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={rideForm.dropoff}
                                        onChange={e => setRideForm({ ...rideForm, dropoff: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsRideModalOpen(false)}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                                >
                                    Create Request
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
