import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getRouteDistanceKm, geocodeAddress, estimateFare } from '../services/googleMaps';
import Header from '../components/Header';
import { MapPin, Loader, Route, X, CheckCircle, Navigation } from 'lucide-react';
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
    const { isPassenger, isDriver, isAdmin } = useAuth();
    const [trips, setTrips] = useState([]);
    const [availableTrips, setAvailableTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [acceptingId, setAcceptingId] = useState(null);
    // Book a ride (passengers)
    const [pickupAddress, setPickupAddress] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');
    const [useMyLocation, setUseMyLocation] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestError, setRequestError] = useState('');

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

    const handleBookRide = async (e) => {
        e.preventDefault();
        setRequestError('');
        const pickup = pickupAddress.trim();
        const dest = destinationAddress.trim();
        if (!pickup) {
            setRequestError('Enter pickup address or use "Use my location".');
            return;
        }
        if (!dest) {
            setRequestError('Enter destination address.');
            return;
        }
        setRequestLoading(true);
        try {
            let pickupLat, pickupLng, pickupAddr;
            if (useMyLocation && navigator.geolocation) {
                const pos = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                });
                pickupLat = pos.coords.latitude;
                pickupLng = pos.coords.longitude;
                const rev = await geocodeAddress(`${pickupLat},${pickupLng}`);
                pickupAddr = rev ? rev.formattedAddress : `Current location (${pickupLat.toFixed(5)}, ${pickupLng.toFixed(5)})`;
            } else {
                const geo = await geocodeAddress(pickup);
                if (!geo) {
                    setRequestError('Could not find pickup address.');
                    setRequestLoading(false);
                    return;
                }
                pickupLat = geo.lat;
                pickupLng = geo.lng;
                pickupAddr = geo.formattedAddress;
            }
            const destGeo = await geocodeAddress(dest);
            if (!destGeo) {
                setRequestError('Could not find destination address.');
                setRequestLoading(false);
                return;
            }
            let distanceKm = await getRouteDistanceKm(pickupLat, pickupLng, destGeo.lat, destGeo.lng);
            if (distanceKm == null) {
                // Fallback: simple distance approximation (meters -> km)
                const R = 6371;
                const dLat = (destGeo.lat - pickupLat) * Math.PI / 180;
                const dLng = (destGeo.lng - pickupLng) * Math.PI / 180;
                const a = Math.sin(dLat/2)**2 + Math.cos(pickupLat * Math.PI/180) * Math.cos(destGeo.lat * Math.PI/180) * Math.sin(dLng/2)**2;
                distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            }
            const fare = estimateFare(distanceKm);
            await api.requestTrip({
                pickupLatitude: pickupLat,
                pickupLongitude: pickupLng,
                pickupAddress: pickupAddr,
                destinationLatitude: destGeo.lat,
                destinationLongitude: destGeo.lng,
                destinationAddress: destGeo.formattedAddress,
                distance: distanceKm,
                fare,
            });
            setPickupAddress('');
            setDestinationAddress('');
            await fetchMyTrips();
        } catch (err) {
            setRequestError(err.message || 'Failed to request trip.');
        } finally {
            setRequestLoading(false);
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
                {isPassenger && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Route size={20} /> Book a ride
                        </h3>
                        <form onSubmit={handleBookRide} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup address</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={pickupAddress}
                                        onChange={(e) => setPickupAddress(e.target.value)}
                                        placeholder="e.g. Kigali City Tower"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        disabled={useMyLocation}
                                    />
                                    <label className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={useMyLocation}
                                            onChange={(e) => setUseMyLocation(e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <Navigation size={16} /> Use my location
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Destination address</label>
                                <input
                                    type="text"
                                    value={destinationAddress}
                                    onChange={(e) => setDestinationAddress(e.target.value)}
                                    placeholder="e.g. Kigali International Airport"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            {requestError && (
                                <p className="text-sm text-red-600">{requestError}</p>
                            )}
                            <button
                                type="submit"
                                disabled={requestLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {requestLoading ? <Loader size={18} className="animate-spin" /> : <MapPin size={18} />}
                                {requestLoading ? 'Requesting...' : 'Request trip'}
                            </button>
                        </form>
                    </div>
                )}
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
                                        <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold">Distance</th>
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
                                            <td className="p-4 text-sm text-gray-600">{t.distance != null ? `${Number(t.distance).toFixed(1)} km` : '—'}</td>
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
