import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { User, Search, Navigation, Plus, X, Route as RouteIcon } from 'lucide-react';
import Header from '../components/Header';
import Trips from './Trips';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { StatusBadge, DetailRow, formatRwf, formatLabel, rideStatusMeta } from '../components/ui/EntityUI';

const libraries = ['places'];
const KIGALI = { lat: -1.9441, lng: 30.0619 };

const tripToRide = (trip) => ({
    id: trip.tripId || trip.trip_id,
    source: 'api',
    user: trip.passengerName || trip.passenger_name || trip.passengerPhone || 'Passenger',
    pickupLocation: {
        address: trip.pickupAddress || trip.pickup_address,
        latitude: Number(trip.pickupLatitude ?? trip.pickup_latitude),
        longitude: Number(trip.pickupLongitude ?? trip.pickup_longitude),
    },
    dropoffLocation: {
        address: trip.destinationAddress || trip.destination_address,
        latitude: Number(trip.destinationLatitude ?? trip.destination_latitude),
        longitude: Number(trip.destinationLongitude ?? trip.destination_longitude),
    },
    pricePerSeat: trip.fare,
    emptySeat: 1,
    status: trip.status || 'REQUESTED',
});

const rideToEditForm = (ride) => ({
    id: ride.id,
    passengerName: ride.user || '',
    pickupAddress: ride.pickupLocation?.address || '',
    dropoffAddress: ride.dropoffLocation?.address || '',
    price: ride.pricePerSeat ?? '',
    status: ride.status || 'REQUESTED',
});

function RequestRideView() {
    const [pickupAddress, setPickupAddress] = useState('');
    const [pickupLat] = useState(KIGALI.lat);
    const [pickupLng] = useState(KIGALI.lng);
    const [destinationAddress, setDestinationAddress] = useState('');
    const [destLat] = useState(-1.95);
    const [destLng] = useState(30.07);
    const [distance, setDistance] = useState('');
    const [fare, setFare] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.requestTrip({
                pickupLatitude: pickupLat,
                pickupLongitude: pickupLng,
                pickupAddress: pickupAddress || 'Pickup',
                destinationLatitude: destLat,
                destinationLongitude: destLng,
                destinationAddress: destinationAddress || 'Destination',
                distance: distance ? parseFloat(distance) : 5,
                fare: fare ? parseFloat(fare) : 1000,
            });
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to request ride');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Request a ride" subtitle="Book a trip — payment via IremboPay (to be integrated)" />
            <div className="max-w-xl mx-auto p-6 w-full">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                        Payment will be completed with IremboPay when integrated. You can request the ride now.
                    </p>
                    {success ? (
                        <div className="text-center py-6">
                            <p className="text-green-600 font-semibold mb-2">Ride requested successfully.</p>
                            <p className="text-gray-600 text-sm">A nearby driver can accept your trip. Check the Trips page for status.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup address</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={pickupAddress}
                                    onChange={(e) => setPickupAddress(e.target.value)}
                                    placeholder="e.g. Kigali City Center"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Destination address</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={destinationAddress}
                                    onChange={(e) => setDestinationAddress(e.target.value)}
                                    placeholder="e.g. Kigali Airport"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={distance}
                                        onChange={(e) => setDistance(e.target.value)}
                                        placeholder="e.g. 5.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fare (RWF)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={fare}
                                        onChange={(e) => setFare(e.target.value)}
                                        placeholder="e.g. 2500"
                                    />
                                </div>
                            </div>
                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 btn-outline-primary rounded-lg font-bold disabled:opacity-50"
                            >
                                {submitting ? 'Requesting…' : 'Request ride (payment via IremboPay later)'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

function AdminLiveMapView() {
    const navigate = useNavigate();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [map, setMap] = useState(null);
    const [center, setCenter] = useState(KIGALI);
    const [searchController, setSearchController] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [activeTrips, setActiveTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRide, setSelectedRide] = useState(null);
    const [editRideForm, setEditRideForm] = useState(null);
    const [savingRide, setSavingRide] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRide, setNewRide] = useState({
        phoneNumber: '',
        pickupAddress: '',
        pickupLat: KIGALI.lat,
        pickupLng: KIGALI.lng,
        dropoffAddress: '',
        dropoffLat: -1.95,
        dropoffLng: 30.07,
        price: '',
    });

    const mapContainerStyle = { width: '100%', height: '100%' };

    const loadActiveTrips = useCallback(async () => {
        try {
            const res = await api.getAdminTrips({ active: true });
            setActiveTrips(res.trips || []);
        } catch (err) {
            console.error('Failed to load active trips:', err);
            setActiveTrips([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadActiveTrips();
        const interval = setInterval(loadActiveTrips, 15000);
        return () => clearInterval(interval);
    }, [loadActiveTrips]);

    const allRides = activeTrips.map(tripToRide);

    const exportConfig = {
        title: 'Active Rides Report',
        subtitle: 'Real-time GPS',
        filename: 'ryde-active-rides',
        summary: [{ label: 'Active rides', value: allRides.length }],
        columns: ['Passenger', 'Pickup', 'Dropoff', 'Fare', 'Status'],
        rows: allRides.map((ride) => [
            ride.user || '—',
            ride.pickupLocation?.address || '—',
            ride.dropoffLocation?.address || '—',
            ride.pricePerSeat ?? '—',
            ride.status || 'REQUESTED',
        ]),
    };

    const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
    const onUnmount = useCallback(() => setMap(null), []);

    const onPlacesChanged = () => {
        if (searchController) {
            const places = searchController.getPlaces();
            if (places?.length > 0) {
                const loc = places[0].geometry.location;
                const newPos = { lat: loc.lat(), lng: loc.lng() };
                setCenter(newPos);
                setSelectedLocation(newPos);
                map?.panTo(newPos);
                map?.setZoom(15);
            }
        }
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const posObj = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setCenter(posObj);
                    setSelectedLocation(posObj);
                    map?.panTo(posObj);
                    map?.setZoom(15);
                },
                () => alert('Error fetching location.')
            );
        }
    };

    const openRideDetails = (ride) => {
        setSelectedRide(ride);
        setEditRideForm(rideToEditForm(ride));
        map?.panTo({
            lat: ride.pickupLocation?.latitude ?? 0,
            lng: ride.pickupLocation?.longitude ?? 0,
        });
    };

    const closeRideDetails = () => {
        setSelectedRide(null);
        setEditRideForm(null);
    };

    const handleSaveRide = async (e) => {
        e.preventDefault();
        if (!editRideForm?.id) return;
        setSavingRide(true);
        try {
            const { trip } = await api.updateAdminTrip(editRideForm.id, {
                status: editRideForm.status,
                pickupAddress: editRideForm.pickupAddress,
                destinationAddress: editRideForm.dropoffAddress,
                fare: Number(editRideForm.price),
            });
            setActiveTrips((prev) =>
                prev.map((t) => {
                    const id = t.tripId || t.trip_id;
                    if (id !== editRideForm.id) return t;
                    return trip || { ...t, ...editRideForm };
                })
            );
            closeRideDetails();
        } catch (err) {
            alert(err.message || 'Failed to update ride');
        } finally {
            setSavingRide(false);
        }
    };

    const handleAddRide = async (e) => {
        e.preventDefault();
        try {
            await api.createAdminTrip({
                passengerPhone: newRide.phoneNumber,
                pickupLatitude: newRide.pickupLat,
                pickupLongitude: newRide.pickupLng,
                pickupAddress: newRide.pickupAddress || 'Selected Location',
                destinationLatitude: newRide.dropoffLat,
                destinationLongitude: newRide.dropoffLng,
                destinationAddress: newRide.dropoffAddress || 'Dropoff',
                distance: 5,
                fare: Number(newRide.price),
                serviceType: 'Taxi/Cab',
            });
            setIsAddModalOpen(false);
            setNewRide({ ...newRide, phoneNumber: '', pickupAddress: '', dropoffAddress: '', price: '' });
            await loadActiveTrips();
            alert('Ride added successfully.');
        } catch (err) {
            console.error(err);
            alert(err.message || 'Failed to add ride');
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Live Map Tracking" subtitle="Real-time GPS" exportConfig={exportConfig} />
            <div className="relative flex-1 h-[calc(100vh-80px)]">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={13}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{ zoomControl: false, streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
                >
                    {allRides.map((ride) => (
                        <Marker
                            key={ride.id}
                            position={{
                                lat: ride.pickupLocation?.latitude ?? 0,
                                lng: ride.pickupLocation?.longitude ?? 0,
                            }}
                            onClick={() => openRideDetails(ride)}
                        />
                    ))}
                    {selectedLocation && <Marker position={selectedLocation} />}
                </GoogleMap>

                <div className="absolute top-4 left-4 z-10 w-80">
                    <div className="relative">
                        <StandaloneSearchBox onLoad={setSearchController} onPlacesChanged={onPlacesChanged}>
                            <input
                                type="text"
                                placeholder="Search location..."
                                className="w-full px-4 py-3 pl-10 bg-white rounded-lg shadow-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                            />
                        </StandaloneSearchBox>
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    </div>
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/app/rides/trips')}
                        className="h-10 px-3 btn-outline-primary rounded-lg shadow-md flex items-center gap-2 text-sm font-medium"
                        title="View trips"
                    >
                        <RouteIcon size={18} />
                        Trips
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-10 h-10 btn-outline-primary rounded-lg shadow-md"
                        title="Add New Ride"
                    >
                        <Plus size={20} />
                    </button>
                    <button
                        onClick={handleCurrentLocation}
                        className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 text-gray-600"
                        title="My Location"
                    >
                        <Navigation size={18} />
                    </button>
                </div>

                <div className="absolute top-20 left-4 w-80 bg-white rounded-lg shadow-lg max-h-[calc(100vh-140px)] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-900">Active Rides ({allRides.length})</h3>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Loading…</div>
                        ) : allRides.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No active rides.</div>
                        ) : (
                            allRides.map((ride) => {
                                const status = rideStatusMeta(ride);
                                return (
                                    <div
                                        key={ride.id}
                                        className={`p-4 border-b border-gray-200 list-item-interactive ${selectedRide?.id === ride.id ? 'list-item-selected' : ''}`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-600">#{String(ride.id || '').slice(0, 8)}</span>
                                            <StatusBadge label={status.label} tone={status.tone} />
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User size={16} className="text-gray-600" />
                                            </div>
                                            <div className="overflow-hidden flex-1">
                                                <h4 className="font-semibold text-sm text-gray-900 truncate">{ride.user || 'Unknown'}</h4>
                                                <p className="text-xs text-gray-600 truncate">{ride.pickupLocation?.address}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-2 gap-2">
                                            <span className="font-semibold text-gray-900">{ride.pricePerSeat} RWF</span>
                                        </div>
                                        <button type="button" onClick={() => openRideDetails(ride)} className="mt-3 w-full py-2 btn-outline-primary rounded-lg text-sm">View</button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {selectedRide && editRideForm && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Ride details</h3>
                                    <p className="text-sm text-gray-500 mt-1">Trip • #{String(editRideForm.id).slice(0, 8)}</p>
                                </div>
                                <button type="button" onClick={closeRideDetails} className="p-1.5 rounded-full text-gray-500 hover:text-gray-900"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSaveRide} className="p-6 space-y-4">
                                <StatusBadge {...rideStatusMeta(selectedRide)} />

                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
                                            <button key={s} type="button" onClick={() => setEditRideForm((f) => ({ ...f, status: s }))} className={`px-3 py-2 rounded-lg text-xs font-medium btn-tab ${editRideForm.status === s ? 'btn-tab-active' : ''}`}>
                                                {formatLabel(s)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <input className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" value={editRideForm.passengerName} readOnly placeholder="Passenger" />
                                <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Pickup address" value={editRideForm.pickupAddress} onChange={(e) => setEditRideForm({ ...editRideForm, pickupAddress: e.target.value })} />
                                <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Dropoff address" value={editRideForm.dropoffAddress} onChange={(e) => setEditRideForm({ ...editRideForm, dropoffAddress: e.target.value })} />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fare (RWF)</label>
                                    <input required type="number" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={editRideForm.price} onChange={(e) => setEditRideForm({ ...editRideForm, price: e.target.value })} />
                                </div>

                                <div className="rounded-lg border border-gray-200 px-4">
                                    <DetailRow label="Pickup coords" value={`${selectedRide.pickupLocation?.latitude ?? '—'}, ${selectedRide.pickupLocation?.longitude ?? '—'}`} />
                                    <DetailRow label="Dropoff coords" value={`${selectedRide.dropoffLocation?.latitude ?? '—'}, ${selectedRide.dropoffLocation?.longitude ?? '—'}`} />
                                    <DetailRow label="Price" value={formatRwf(editRideForm.price)} />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button type="button" onClick={closeRideDetails} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
                                    <button type="submit" disabled={savingRide} className="flex-1 py-2 btn-outline-primary rounded-lg disabled:opacity-50">
                                        {savingRide ? 'Saving…' : 'Save changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Add New Ride</h3>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleAddRide} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Phone</label>
                                    <input type="tel" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newRide.phoneNumber} onChange={(e) => setNewRide({ ...newRide, phoneNumber: e.target.value })} placeholder="+250788123456" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
                                    <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newRide.pickupAddress} onChange={(e) => setNewRide({ ...newRide, pickupAddress: e.target.value })} placeholder="Kigali Heights" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Address</label>
                                    <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newRide.dropoffAddress} onChange={(e) => setNewRide({ ...newRide, dropoffAddress: e.target.value })} placeholder="Amahoro Stadium" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (RWF)</label>
                                    <input type="number" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newRide.price} onChange={(e) => setNewRide({ ...newRide, price: e.target.value })} placeholder="1000" />
                                </div>
                                <button type="submit" className="w-full py-3 btn-outline-primary rounded-lg font-bold">Create Ride</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const LiveMap = () => {
    const { isPassenger, isAdmin } = useAuth();

    if (isPassenger) return <RequestRideView />;

    return (
        <Routes>
            <Route
                index
                element={
                    isAdmin ? (
                        <AdminLiveMapView />
                    ) : (
                        <div className="min-h-screen bg-gray-50 flex flex-col">
                            <Header title="Rides" subtitle="Request rides from the Trips page" />
                            <div className="p-8 text-center text-gray-600">Drivers manage trips from the Trips page.</div>
                        </div>
                    )
                }
            />
            <Route path="trips" element={<Trips nestedInRides />} />
            <Route path="*" element={<Navigate to="/app/rides" replace />} />
        </Routes>
    );
};

export default LiveMap;
