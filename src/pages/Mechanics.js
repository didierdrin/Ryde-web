import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Wrench, MapPin, Phone, Star, Loader, Navigation } from 'lucide-react';

const DEFAULT_LAT = -1.9441;
const DEFAULT_LNG = 30.0619;

const Mechanics = () => {
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });

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
            try {
                const { mechanics: data } = await api.getMechanics(coords.lat, coords.lng);
                setMechanics(data || []);
            } catch (e) {
                console.error(e);
                setMechanics([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [coords.lat, coords.lng]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Find Mechanics" subtitle="Trusted auto repair shops near you" />

            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700 text-sm">
                    <Navigation size={18} className="text-blue-600" />
                    Showing mechanics sorted by distance from your location.
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500 flex items-center justify-center gap-2">
                        <Loader className="animate-spin" size={20} /> Finding mechanics…
                    </div>
                ) : mechanics.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-600">No mechanics found nearby.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mechanics.map((m) => (
                            <div key={m.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{m.name}</h3>
                                        {m.specialty && (
                                            <p className="text-sm text-blue-600 font-medium mt-0.5">{m.specialty}</p>
                                        )}
                                    </div>
                                    {m.rating != null && (
                                        <div className="flex items-center gap-1 text-amber-600 text-sm font-semibold shrink-0">
                                            <Star size={16} fill="currentColor" />
                                            {Number(m.rating).toFixed(1)}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 space-y-2 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                        <span>{m.address}</span>
                                    </div>
                                    {m.distanceKm != null && (
                                        <p className="text-blue-600 font-medium pl-6">{m.distanceKm} km away</p>
                                    )}
                                    {m.phoneNumber && (
                                        <div className="flex items-center gap-2 pl-6">
                                            <Phone size={14} className="text-gray-400" />
                                            <a href={`tel:${m.phoneNumber}`} className="text-blue-600 hover:underline">{m.phoneNumber}</a>
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

export default Mechanics;
