import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import { MapPin, Navigation, Loader, Route, X, CheckCircle } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

const KIGALI = { lat: -1.9441, lng: 30.0619 };

const statusColors = {
    REQUESTED: 'bg-amber-100 text-amber-700',
    ACCEPTED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
};

const TripMap = ({ trip, onClose }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script-trips',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    });

    const pickup = trip?.pickupLatitude != null
        ? { lat: trip.pickupLatitude, lng: trip.pickupLongitude }
        : null;
    const dest = trip?.destinationLatitude != null
        ? { lat: trip.destinationLatitude, lng: trip.destinationLongitude }
        : null;
    const center = pickup || dest || KIGALI;

    if (!isLoaded || !trip) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Trip: {trip.pickupAddress} → {trip.destinationAddress}</h3>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>
                <div className="h-80 w-full">
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={center}
                        zoom={13}
                        options={{ zoomControl: true, streetViewControl: false, mapTypeControl: false }}
                    >
                        {pickup && <Marker position={pickup} label="A" />}
                        {dest && <Marker position={dest} label="B" />}
                        {pickup && dest && (
                            <Polyline
                                path={[pickup, dest]}
                                options={{ strokeColor: '#2563eb', strokeWeight: 4 }}
                            />
                        )}
                    </GoogleMap>
                </div>
                <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[trip.status] || 'bg-gray-100 text-gray-700'}`}>
                        {trip.status}
                    </span>
                    <span className="font-semibold text-gray-900">RWF {trip.fare ?? 0}</span>
                </div>
            </div>
        </div>
    );
};

const Trips = () => {
    const { user, isPassenger, isDriver, isAdmin } = useAuth();
    const [trips, setTrips] = useState([]);
    const [availableTrips, setAvailableTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [acceptingId, setAcceptingId] = useState(null);

    const fetchMyTrips = useCallback(async () => {
        try {
            const res = await api.getTrips(statusFilter || null);
            setTrips(res.trips || []);
        } catch (e) {
            console.error(e);
            setTrips([]);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        setLoading(true);
        fetchMyTrips();
    }, [fetchMyTrips]);

    useEffect(() => {
        if (!isDriver) return;
        let cancelled = false;
        const getPosition = () => {
            if (!navigator.geolocation) {
                api.getAvailableTrips(KIGALI.lat, KIGALI.lng).then(data => {
                    if (!cancelled) setAvailableTrips(data.trips || data || []);
                }).catch(() => {});
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    api.getAvailableTrips(lat, lng).then(data => {
                        if (!cancelled) setAvailableTrips(data.trips || data || []);
                    }).catch(() => {});
                },
                () => {
                    api.getAvailableTrips(KIGALI.lat, KIGALI.lng).then(data => {
                        if (!cancelled) setAvailableTrips(data.trips || data || []);
                    }).catch(() => {});
                }
            );
        };
        getPosition();
        return () => { cancelled = true; };
    }, [isDriver]);

    const handleAccept = async (tripId) => {
        setAcceptingId(tripId);
        try {
            await api.acceptTrip(tripId);
            await fetchMyTrips();
            setAvailableTrips(prev => prev.filter(t => t.tripId !== tripId));
        } catch (e) {
            alert(e.message || 'Failed to accept trip');
        } finally {
            setAcceptingId(null);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleString() : '—';

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="Trips"
                subtitle={isPassenger ? 'Your booked rides' : isDriver ? 'Your rides & available trips' : 'All trips'}
            />

            <div className="max-w-6xl mx-auto p-6">
                {(isDriver || isPassenger || isAdmin) && (
                    <div className="mb-4 flex gap-2 flex-wrap">
                        <label className="text-sm text-gray-600">Filter:</label>
                        {['', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
                            <button
                                key={s || 'all'}
                                type="button"
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                {s || 'All'}
                            </button>
                        ))}
                    </div>
                )}

                {isDriver && availableTrips.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Route size={20} /> Available trips (near you)
                        </h3>
                        <div className="space-y-3">
                            {availableTrips.map((t) => (
                                <div
                                    key={t.tripId}
                                    className="flex flex-wrap items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{t.pickupAddress} → {t.destinationAddress}</p>
                                        <p className="text-sm text-gray-500">RWF {t.fare ?? 0} • {formatDate(t.requestTime)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleAccept(t.tripId)}
                                        disabled={acceptingId === t.tripId}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {acceptingId === t.tripId ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                        Accept
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-900 p-4 border-b border-gray-200">
                        {isPassenger ? 'Your rides' : isDriver ? 'Your accepted rides' : 'Trips'}
                    </h3>
                    {loading ? (
                        <div className="p-8 flex items-center justify-center">
                            <Loader size={32} className="animate-spin text-blue-600" />
                        </div>
                    ) : trips.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No trips found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold">From → To</th>
                                        <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold">Date</th>
                                        <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold">Status</th>
                                        <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold">Fare</th>
                                        <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trips.map((t) => (
                                        <tr key={t.tripId} className="border-t border-gray-100 hover:bg-gray-50">
                                            <td className="p-4">
                                                <span className="text-gray-900 font-medium">{t.pickupAddress || '—'}</span>
                                                <span className="text-gray-400 mx-1">→</span>
                                                <span className="text-gray-700">{t.destinationAddress || '—'}</span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">{formatDate(t.requestTime)}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[t.status] || 'bg-gray-100 text-gray-700'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium text-gray-900">RWF {t.fare ?? 0}</td>
                                            <td className="p-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedTrip(t)}
                                                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                                >
                                                    <MapPin size={16} /> Map
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

            {selectedTrip && (
                <TripMap trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
            )}
        </div>
    );
};

export default Trips;
