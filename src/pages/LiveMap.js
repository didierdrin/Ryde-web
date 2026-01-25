import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { RefreshCw, Maximize, Layers, User, Search, Navigation, Plus, X } from 'lucide-react';
import Header from '../components/Header';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, Timestamp, query, where } from 'firebase/firestore';

const libraries = ['places'];

const LiveMap = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries: libraries,
    });

    const [map, setMap] = useState(null);
    const [center, setCenter] = useState({ lat: -1.9441, lng: 30.0619 }); // Kigali, Rwanda
    const [searchController, setSearchController] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

    // Data States
    const [activeRides, setActiveRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRide, setSelectedRide] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form States for New Ride
    const [newRide, setNewRide] = useState({
        phoneNumber: '',
        pickupAddress: '',
        pickupLat: -1.9441,
        pickupLng: 30.0619,
        dropoffAddress: '',
        dropoffLat: -1.9500,
        dropoffLng: 30.0600,
        price: '',
        seats: 1
    });

    const mapContainerStyle = {
        width: '100%',
        height: '100%'
    };

    // Fetch Active Rides
    useEffect(() => {
        const q = query(collection(db, 'offerPool'), where('completed', '==', false));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rides = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setActiveRides(rides);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const onSearchLoad = (ref) => {
        setSearchController(ref);
    };

    const onPlacesChanged = () => {
        if (searchController) {
            const places = searchController.getPlaces();
            if (places && places.length > 0) {
                const place = places[0];
                const location = place.geometry.location;
                const newPos = {
                    lat: location.lat(),
                    lng: location.lng(),
                };
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
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCenter(pos);
                    setSelectedLocation(pos);
                    map?.panTo(pos);
                    map?.setZoom(15);
                },
                () => {
                    alert("Error fetching current location.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleAddRide = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'offerPool'), {
                user: newRide.phoneNumber || "admin_created@ryde.rw",
                phoneNumber: newRide.phoneNumber,
                pickupLocation: {
                    address: newRide.pickupAddress || "Selected Location",
                    latitude: newRide.pickupLat,
                    longitude: newRide.pickupLng
                },
                dropoffLocation: {
                    address: newRide.dropoffAddress || "Dropoff Location",
                    latitude: newRide.dropoffLat,
                    longitude: newRide.dropoffLng
                },
                pricePerSeat: Number(newRide.price),
                availableSeat: [],
                emptySeat: Number(newRide.seats),
                dateTime: Timestamp.now(),
                completed: false,
                isRideStarted: false,
                isSeatFull: false,
                pending: true,
                type: 'passengers',
                country_code: "+250"
            });
            setIsAddModalOpen(false);
            setNewRide({ ...newRide, phoneNumber: '', pickupAddress: '', dropoffAddress: '', price: '' });
            alert("Ride added successfully!");
        } catch (error) {
            console.error("Error adding ride: ", error);
            alert("Failed to add ride");
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Live Map Tracking" subtitle="Real-time GPS" />

            <div className="relative flex-1 h-[calc(100vh-80px)]">
                {/* Google Map */}
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={13}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{
                        zoomControl: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                    }}
                >
                    {/* Active Rides Markers */}
                    {activeRides.map(ride => (
                        <Marker
                            key={ride.id}
                            position={{
                                lat: ride.pickupLocation?.latitude || 0,
                                lng: ride.pickupLocation?.longitude || 0
                            }}
                            icon={{
                                path: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
                                fillColor: "#2563EB",
                                fillOpacity: 1,
                                strokeWeight: 0,
                                scale: 1.2,
                                anchor: new window.google.maps.Point(12, 12),
                            }}
                            onClick={() => setSelectedRide(ride)}
                        />
                    ))}

                    {selectedLocation && (
                        <Marker position={selectedLocation} />
                    )}
                </GoogleMap>

                {/* Search Bar Overlay */}
                <div className="absolute top-4 left-4 z-10 w-80">
                    <div className="relative">
                        <StandaloneSearchBox
                            onLoad={onSearchLoad}
                            onPlacesChanged={onPlacesChanged}
                        >
                            <input
                                type="text"
                                placeholder="Search location..."
                                className="w-full px-4 py-3 pl-10 bg-white rounded-lg shadow-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                            />
                        </StandaloneSearchBox>
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    </div>
                </div>

                {/* Overlay Controls */}
                <div className="absolute top-4 right-4 flex gap-2">
                    {/* Add Ride Button */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-10 h-10 bg-blue-600 text-white rounded-lg shadow-md flex items-center justify-center hover:bg-blue-700 transition-colors"
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
                    <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
                        <Layers size={18} className="text-gray-600" />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
                        <Maximize size={18} className="text-gray-600" />
                    </button>
                </div>

                {/* Active Rides Sidebar */}
                <div className="absolute top-20 left-4 w-80 bg-white rounded-lg shadow-lg max-h-[calc(100vh-140px)] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-900">Active Rides ({activeRides.length})</h3>
                        <button onClick={() => { }} className="text-blue-600 hover:text-blue-700">
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Loading rides...</div>
                        ) : activeRides.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No active rides found.</div>
                        ) : (
                            activeRides.map(ride => (
                                <div
                                    key={ride.id}
                                    onClick={() => {
                                        setSelectedRide(ride);
                                        map?.panTo({
                                            lat: ride.pickupLocation?.latitude || 0,
                                            lng: ride.pickupLocation?.longitude || 0
                                        });
                                    }}
                                    className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${selectedRide?.id === ride.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-600">#{ride.id.slice(0, 8)}</span>
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${ride.isRideStarted ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {ride.isRideStarted ? 'Started' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User size={16} className="text-gray-600" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-semibold text-sm text-gray-900 truncate">{ride.user || "Unknown User"}</h4>
                                            <p className="text-xs text-gray-600 truncate">{ride.pickupLocation?.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs border-t border-gray-100 pt-2 mt-2">
                                        <span className="text-gray-600">Seats: {ride.emptySeat}</span>
                                        <span className="font-semibold text-gray-900">{ride.pricePerSeat} RWF</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Ride Details Float */}
                {selectedRide && (
                    <div className="absolute bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Ride Details</h3>
                            <button
                                onClick={() => setSelectedRide(null)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="flex gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center">
                                    <User size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{selectedRide.user}</h4>
                                    <p className="text-gray-600 text-xs text-ellipsis overflow-hidden w-48 whitespace-nowrap">{selectedRide.id}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4 relative pl-2">
                                <div className="absolute left-[0.6rem] top-2 bottom-8 w-0.5 bg-gray-200 -z-10"></div>

                                <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1 border-2 border-white shadow-sm"></div>
                                    <div>
                                        <span className="block text-xs text-gray-500 uppercase tracking-wide">Pickup Location</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedRide.pickupLocation?.address}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pt-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mt-1 border-2 border-white shadow-sm"></div>
                                    <div>
                                        <span className="block text-xs text-gray-500 uppercase tracking-wide">Destination</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedRide.dropoffLocation?.address}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between text-sm font-bold text-blue-600 pt-1 border-t border-gray-200 mt-1">
                                    <span>Fare:</span>
                                    <span>{selectedRide.pricePerSeat} RWF</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm transition-all">Contact</button>
                                <button className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 shadow-sm transition-all">View</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Ride Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Add New Ride</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddRide} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newRide.phoneNumber}
                                        onChange={e => setNewRide({ ...newRide, phoneNumber: e.target.value })}
                                        placeholder="e.g. +250788123456"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newRide.pickupAddress}
                                        onChange={e => setNewRide({ ...newRide, pickupAddress: e.target.value })}
                                        placeholder="e.g. Kigali Heights"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Address</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newRide.dropoffAddress}
                                        onChange={e => setNewRide({ ...newRide, dropoffAddress: e.target.value })}
                                        placeholder="e.g. Amahoro Stadium"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (RWF)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newRide.price}
                                            onChange={e => setNewRide({ ...newRide, price: e.target.value })}
                                            placeholder="1000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="6"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newRide.seats}
                                            onChange={e => setNewRide({ ...newRide, seats: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors mt-4"
                                >
                                    Create Ride
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveMap;