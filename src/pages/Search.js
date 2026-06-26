import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Car, CreditCard, User } from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';

const Search = () => {
    const [searchParams] = useSearchParams();
    const queryTerm = searchParams.get('q') || '';

    const [results, setResults] = useState({
        users: [],
        rides: [],
        subscriptions: [],
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!queryTerm.trim()) {
                setResults({ users: [], rides: [], subscriptions: [] });
                return;
            }

            setLoading(true);
            const lowerQuery = queryTerm.toLowerCase();

            try {
                const [driversRes, passengersRes, tripsRes, subsRes] = await Promise.all([
                    api.getAdminDrivers().catch(() => ({ drivers: [] })),
                    api.getAdminPassengers().catch(() => ({ passengers: [] })),
                    api.getAdminTrips().catch(() => ({ trips: [] })),
                    api.getAdminSubscriptions().catch(() => ({ subscriptions: [] })),
                ]);

                const drivers = (driversRes.drivers || []).map((d) => ({
                    id: d.driverId || d.driver_id,
                    fullName: d.name,
                    phoneNumber: d.phoneNumber || d.phone_number,
                    email: d.email,
                    profilePicture: d.profilePictureUrl || d.profile_picture_url,
                    role: 'Driver',
                }));

                const passengers = (passengersRes.passengers || []).map((p) => ({
                    id: p.passengerId || p.passenger_id,
                    fullName: p.name,
                    phoneNumber: p.phoneNumber || p.phone_number,
                    email: p.email,
                    profilePicture: p.profilePictureUrl || p.profile_picture_url,
                    role: 'Passenger',
                }));

                const users = [...drivers, ...passengers].filter(
                    (user) =>
                        (user.fullName && user.fullName.toLowerCase().includes(lowerQuery)) ||
                        (user.phoneNumber && user.phoneNumber.toLowerCase().includes(lowerQuery)) ||
                        (user.email && user.email.toLowerCase().includes(lowerQuery))
                );

                const rides = (tripsRes.trips || [])
                    .filter(
                        (trip) =>
                            (trip.passengerName && trip.passengerName.toLowerCase().includes(lowerQuery)) ||
                            (trip.pickupAddress && trip.pickupAddress.toLowerCase().includes(lowerQuery)) ||
                            (trip.destinationAddress && trip.destinationAddress.toLowerCase().includes(lowerQuery)) ||
                            (trip.status && trip.status.toLowerCase().includes(lowerQuery))
                    )
                    .map((trip) => ({
                        id: trip.tripId || trip.trip_id,
                        status: trip.status,
                        pickupLocation: { address: trip.pickupAddress },
                        dropoffLocation: { address: trip.destinationAddress },
                    }));

                const subscriptions = (subsRes.subscriptions || []).filter(
                    (sub) =>
                        (sub.driverName && sub.driverName.toLowerCase().includes(lowerQuery)) ||
                        (sub.driverPhone && sub.driverPhone.toLowerCase().includes(lowerQuery)) ||
                        (sub.tier && sub.tier.toLowerCase().includes(lowerQuery)) ||
                        (sub.plan && sub.plan.toLowerCase().includes(lowerQuery))
                );

                setResults({ users, rides, subscriptions });
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [queryTerm]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Search Results" subtitle={`Found results for "${queryTerm}"`} />

            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {results.users.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <Users size={20} /> Users & Drivers
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {results.users.map((user) => (
                                        <div key={`${user.role}-${user.id}`} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <User size={20} className="text-gray-500" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{user.fullName || 'User'}</h3>
                                                <p className="text-xs text-gray-500">{user.phoneNumber}</p>
                                                <p className="text-xs text-gray-400">{user.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {results.rides.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <Car size={20} /> Rides
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {results.rides.map((ride) => (
                                        <div key={ride.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-1 rounded">#{ride.id.slice(0, 8)}</span>
                                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600">{ride.status}</span>
                                            </div>
                                            <div className="space-y-1 text-sm text-gray-700 mt-2">
                                                <p><span className="font-medium text-gray-500">From:</span> {ride.pickupLocation?.address || 'N/A'}</p>
                                                <p><span className="font-medium text-gray-500">To:</span> {ride.dropoffLocation?.address || 'N/A'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {results.subscriptions.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <CreditCard size={20} /> Subscriptions
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {results.subscriptions.map((sub) => (
                                        <div key={sub.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-bold text-gray-900">{sub.tier || sub.plan}</h3>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${sub.isActive || sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {sub.isActive ? 'active' : sub.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">Driver: {sub.driverName || sub.driverId}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {queryTerm && !loading &&
                            results.users.length === 0 &&
                            results.rides.length === 0 &&
                            results.subscriptions.length === 0 && (
                                <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-gray-200 border-dashed">
                                    No results found for "{queryTerm}"
                                </div>
                            )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
