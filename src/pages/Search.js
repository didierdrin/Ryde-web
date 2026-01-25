import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Users, Car, CreditCard, User } from 'lucide-react';

import Header from '../components/Header';

const Search = () => {
    const [searchParams] = useSearchParams();
    const queryTerm = searchParams.get('q') || '';

    const [results, setResults] = useState({
        users: [],
        rides: [], // requestRiders or offerPool
        subscriptions: []
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
                // 1. Search Users (Client side filtering mostly as Firestore Search is limited)
                // Fetch reasonably limited batch then filter
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const users = usersSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user =>
                        (user.fullName && user.fullName.toLowerCase().includes(lowerQuery)) ||
                        (user.phoneNumber && user.phoneNumber.toLowerCase().includes(lowerQuery)) ||
                        (user.email && user.email.toLowerCase().includes(lowerQuery))
                    );

                // 2. Search Rides (requestRiders)
                const ridesSnapshot = await getDocs(collection(db, 'requestRiders'));
                const rides = ridesSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(ride =>
                        (ride.requestedBy && ride.requestedBy.toLowerCase().includes(lowerQuery)) ||
                        (ride.pickupLocation?.address && ride.pickupLocation.address.toLowerCase().includes(lowerQuery)) ||
                        (ride.dropoffLocation?.address && ride.dropoffLocation.address.toLowerCase().includes(lowerQuery))
                    );

                // 3. Search Subscriptions
                // Assuming subscription collection has meaningful text fields
                const subsSnapshot = await getDocs(collection(db, 'subscriptions'));
                const subs = subsSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(sub =>
                        (sub.userName && sub.userName.toLowerCase().includes(lowerQuery)) ||
                        (sub.userId && sub.userId.toLowerCase().includes(lowerQuery)) ||
                        (sub.plan && sub.plan.toLowerCase().includes(lowerQuery))
                    );

                setResults({
                    users,
                    rides,
                    subscriptions: subs
                });

            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce slightly or just run
        const timeoutId = setTimeout(() => {
            fetchResults();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [queryTerm]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Search Results" subtitle={`Found results for "${queryTerm}"`} />

            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Users Section */}
                        {results.users.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <Users size={20} /> Users & Drivers
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {results.users.map(user => (
                                        <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <User size={20} className="text-gray-500" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{user.fullName || "User"}</h3>
                                                <p className="text-xs text-gray-500">{user.phoneNumber}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Rides Section */}
                        {results.rides.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <Car size={20} /> Rides
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {results.rides.map(ride => (
                                        <div key={ride.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-1 rounded">#{ride.id.slice(0, 8)}</span>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${ride.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>{ride.status}</span>
                                            </div>
                                            <div className="space-y-1 text-sm text-gray-700 mt-2">
                                                <p><span className="font-medium text-gray-500">From:</span> {ride.pickupLocation?.address || "N/A"}</p>
                                                <p><span className="font-medium text-gray-500">To:</span> {ride.dropoffLocation?.address || "N/A"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Subscriptions Section */}
                        {results.subscriptions.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <CreditCard size={20} /> Subscriptions
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {results.subscriptions.map(sub => (
                                        <div key={sub.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-bold text-gray-900">{sub.plan}</h3>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>{sub.status}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">User: {sub.userName || sub.userId}</p>
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
