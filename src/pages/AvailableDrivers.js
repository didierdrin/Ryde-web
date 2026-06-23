import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { User, MapPin, Navigation, Star, Loader, Car, Briefcase } from 'lucide-react';

const DEFAULT_LAT = -1.9441;
const DEFAULT_LNG = 30.0619;

const AvailableDrivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG })
            );
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const { drivers: data } = await api.getNearbyDrivers(coords.lat, coords.lng);
                setDrivers(data || []);
            } catch (e) {
                setError(e.message || 'Failed to load drivers');
                setDrivers([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [coords.lat, coords.lng]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Available Drivers" subtitle="Drivers near you with full profile details" />

            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700 text-sm">
                    <Navigation size={18} className="text-blue-600" />
                    Only verified, available drivers within range are shown.
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
                )}

                {loading ? (
                    <div className="text-center py-12 text-gray-500 flex items-center justify-center gap-2">
                        <Loader className="animate-spin" size={20} /> Loading drivers…
                    </div>
                ) : drivers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <User size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-600">No available drivers found nearby.</p>
                        <p className="text-sm text-gray-400 mt-2">Try again later or expand your search area.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {drivers.map((d) => (
                            <div key={d.driverId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <User size={28} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{d.name}</h3>
                                        {d.rating != null && (
                                            <div className="flex items-center gap-1 text-amber-600 text-sm mt-0.5">
                                                <Star size={14} fill="currentColor" />
                                                {Number(d.rating).toFixed(1)} • {d.totalTrips || 0} trips
                                            </div>
                                        )}
                                    </div>
                                    {d.distanceKm != null && (
                                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg shrink-0">
                                            {d.distanceKm} km
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex items-start gap-2 text-gray-600">
                                        <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                        <span>{d.address}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        {d.ageYears != null && (
                                            <span className="inline-flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg text-gray-700">
                                                <User size={14} /> {d.ageYears} years old
                                            </span>
                                        )}
                                        {d.yearsExperience != null && (
                                            <span className="inline-flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg text-gray-700">
                                                <Briefcase size={14} /> {d.yearsExperience} yrs experience
                                            </span>
                                        )}
                                    </div>
                                    {d.vehicle && (
                                        <div className="flex items-center gap-2 mt-3 p-3 bg-gray-50 rounded-lg text-gray-700">
                                            <Car size={16} className="text-blue-500" />
                                            <span>
                                                {d.vehicle.make} {d.vehicle.model} ({d.vehicle.year}) • {d.vehicle.color}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailableDrivers;
