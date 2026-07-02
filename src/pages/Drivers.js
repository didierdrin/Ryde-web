import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Header from '../components/Header';
import ExportDropdown from '../components/ExportDropdown';
import { StatusBadge, DetailRow, driverVerificationMeta } from '../components/ui/EntityUI';
import { CardGridSkeleton, EntityCardSkeleton } from '../components/ui/Skeleton';
import { Truck, User, FileText, X, Loader, Route, Calendar } from 'lucide-react';
import { BADGES, badgeCell, getHighPerformerId, withBadgeColumn } from '../utils/exportBadges';
import { normalizeTrip, tripField } from '../utils/tripUtils';

const rideStatusColors = {
    COMPLETED: 'bg-green-100 text-green-600',
    REQUESTED: 'bg-amber-100 text-amber-600',
    ACCEPTED: 'bg-blue-100 text-blue-600',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-600',
    CANCELLED: 'bg-red-100 text-red-500',
};

const formatDate = (d) => (d ? new Date(d).toLocaleString() : '—');

const formatDateInput = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const tripDateKey = (trip) => {
    const raw = tripField(trip, 'requestTime');
    if (!raw) return null;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return null;
    return formatDateInput(date);
};

const RIDE_DATE_FILTERS = [
    { key: 'all', label: 'All drivers' },
    { key: 'today', label: 'Rode today' },
    { key: 'yesterday', label: 'Rode yesterday' },
    { key: 'custom', label: 'Custom period' },
];

const getRideDateRange = (filter, customFrom, customTo) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'today') {
        const key = formatDateInput(today);
        return { from: key, to: key, label: 'Today' };
    }

    if (filter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const key = formatDateInput(yesterday);
        return { from: key, to: key, label: 'Yesterday' };
    }

    if (filter === 'custom' && customFrom && customTo) {
        return {
            from: customFrom <= customTo ? customFrom : customTo,
            to: customTo >= customFrom ? customTo : customFrom,
            label: `${customFrom} – ${customTo}`,
        };
    }

    return null;
};

const tripInDateRange = (trip, range) => {
    if (!range) return true;
    const key = tripDateKey(trip);
    if (!key) return false;
    return key >= range.from && key <= range.to;
};

const tripRoute = (trip) => {
    const pickup = tripField(trip, 'pickupAddress') || '—';
    const dest = tripField(trip, 'destinationAddress') || '—';
    return `${pickup} → ${dest}`;
};

const buildDriverExportConfig = (driver, trips) => {
    const completed = trips.filter((t) => t.status === 'COMPLETED');
    const totalEarnings = completed.reduce((sum, t) => sum + (Number(t.fare) || 0), 0);

    return {
        title: `Driver Report — ${driver.name}`,
        subtitle: 'Profile and ride history',
        filename: `ryde-driver-${(driver.name || 'driver').replace(/\s+/g, '-').toLowerCase()}`,
        summary: [
            { label: 'Driver', value: driver.name },
            { label: 'Phone', value: driver.phoneNumber || '—' },
            { label: 'Email', value: driver.email || '—' },
            { label: 'Verification', value: driver.verificationStatus || 'PENDING' },
            { label: 'Total rides', value: trips.length },
            { label: 'Completed rides', value: completed.length },
            { label: 'Total earnings', value: `RWF ${totalEarnings.toLocaleString()}` },
        ],
        columns: ['Ride ID', 'Passenger', 'Route', 'Amount', 'Status', 'Date'],
        rows: trips.map((t) => [
            (tripField(t, 'tripId') || '').slice(0, 8),
            tripField(t, 'passengerName') || tripField(t, 'passengerPhone') || '—',
            tripRoute(t),
            `RWF ${t.fare ?? 0}`,
            t.status || 'REQUESTED',
            formatDate(t.requestTime),
        ]),
    };
};

const driverToEditForm = (driver) => ({
    driverId: driver.driverId,
    name: driver.name || '',
    email: driver.email || '',
    phoneNumber: driver.phoneNumber || '',
    licenseNumber: driver.licenseNumber || '',
    address: driver.address || '',
    bio: driver.bio || '',
    yearsExperience: driver.yearsExperience ?? '',
    verificationStatus: driver.verificationStatus || 'PENDING',
    isAvailable: driver.isAvailable !== false,
});

const Drivers = () => {
    const { isAdmin } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [allTrips, setAllTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tripsLoading, setTripsLoading] = useState(true);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [rideDateFilter, setRideDateFilter] = useState('all');
    const [customDateFrom, setCustomDateFrom] = useState('');
    const [customDateTo, setCustomDateTo] = useState('');

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAdminDrivers();
            setDrivers(data.drivers || []);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrips = async () => {
        try {
            setTripsLoading(true);
            const data = await apiService.getAdminTrips();
            setAllTrips((data.trips || []).map(normalizeTrip));
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setTripsLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
        fetchTrips();
    }, []);

    const rideDateRange = useMemo(
        () => getRideDateRange(rideDateFilter, customDateFrom, customDateTo),
        [rideDateFilter, customDateFrom, customDateTo]
    );

    const tripsByDriverId = useMemo(() => {
        const map = new Map();
        allTrips.forEach((trip) => {
            const driverId = tripField(trip, 'driverId');
            if (!driverId) return;
            if (!map.has(driverId)) map.set(driverId, []);
            map.get(driverId).push(trip);
        });
        return map;
    }, [allTrips]);

    const driverRideStats = useMemo(() => {
        const stats = new Map();
        drivers.forEach((driver) => {
            const trips = tripsByDriverId.get(driver.driverId) || [];
            const periodTrips = rideDateRange
                ? trips.filter((t) => tripInDateRange(t, rideDateRange))
                : trips;
            const lastRideTime = periodTrips.reduce((latest, trip) => {
                const time = new Date(tripField(trip, 'requestTime') || 0).getTime();
                return time > latest ? time : latest;
            }, 0);
            stats.set(driver.driverId, {
                periodRideCount: periodTrips.length,
                lastRideTime,
            });
        });
        return stats;
    }, [drivers, tripsByDriverId, rideDateRange]);

    const filteredDrivers = useMemo(() => {
        let list = drivers;
        if (rideDateRange) {
            list = drivers.filter((d) => (driverRideStats.get(d.driverId)?.periodRideCount || 0) > 0);
        }
        return [...list].sort((a, b) => {
            const aTime = driverRideStats.get(a.driverId)?.lastRideTime || 0;
            const bTime = driverRideStats.get(b.driverId)?.lastRideTime || 0;
            return bTime - aTime;
        });
    }, [drivers, rideDateRange, driverRideStats]);

    const driverTrips = useMemo(() => {
        if (!selectedDriver?.driverId) return [];
        return allTrips
            .filter((t) => tripField(t, 'driverId') === selectedDriver.driverId)
            .sort((a, b) => new Date(b.requestTime || 0) - new Date(a.requestTime || 0));
    }, [allTrips, selectedDriver?.driverId]);

    const openDriver = (driver) => {
        setSelectedDriver(driver);
        setEditForm(driverToEditForm(driver));
    };

    const closeDriver = () => {
        setSelectedDriver(null);
        setEditForm(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editForm?.driverId) return;
        setSaving(true);
        try {
            const { driver } = await apiService.updateAdminDriver(editForm.driverId, {
                name: editForm.name,
                email: editForm.email,
                phoneNumber: editForm.phoneNumber,
                licenseNumber: editForm.licenseNumber,
                address: editForm.address,
                bio: editForm.bio,
                yearsExperience: editForm.yearsExperience !== '' ? Number(editForm.yearsExperience) : undefined,
                verificationStatus: editForm.verificationStatus,
                isAvailable: editForm.isAvailable,
            });
            setDrivers((prev) => prev.map((d) => (d.driverId === driver.driverId ? driver : d)));
            setSelectedDriver(driver);
            setEditForm(driverToEditForm(driver));
        } catch (error) {
            alert(error.message || 'Failed to update driver');
        } finally {
            setSaving(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header title="Drivers" subtitle="Access restricted" />
                <div className="p-8 text-center text-gray-600">Only admins can view this page.</div>
            </div>
        );
    }

    const highPerformerId = getHighPerformerId(drivers);
    const highPerformer = drivers.find((d) => d.driverId === highPerformerId);

    const exportConfig = {
        title: 'Drivers Report',
        subtitle: rideDateRange
            ? `Drivers with rides — ${rideDateRange.label}`
            : 'Approve and manage drivers',
        filename: 'ryde-drivers',
        summary: [
            { label: 'Total drivers', value: filteredDrivers.length },
            ...(rideDateRange ? [{ label: 'Period', value: rideDateRange.label }] : []),
            ...(highPerformer ? [{ label: 'High Performer', value: highPerformer.name }] : []),
        ],
        columns: ['Name', 'Phone', 'Email', 'Trips', 'Rides in period', 'Rating', 'Verification', 'Available', 'License', 'Badge'],
        rows: withBadgeColumn(
            filteredDrivers.map((d) => [
                d.name,
                d.phoneNumber,
                d.email,
                d.totalTrips ?? '—',
                driverRideStats.get(d.driverId)?.periodRideCount ?? '—',
                d.rating ?? '—',
                d.verificationStatus || 'PENDING',
                d.isAvailable !== false ? 'Yes' : 'No',
                d.licenseNumber || '—',
            ]),
            filteredDrivers.map((d) => badgeCell(d.driverId, highPerformerId, BADGES.HIGH_PERFORMER))
        ),
    };

    const driverExportConfig = selectedDriver ? buildDriverExportConfig(selectedDriver, driverTrips) : null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Drivers Management" subtitle="Approve and manage drivers" exportConfig={exportConfig} />

            <div className="p-6 flex-1">
                <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mr-1">
                            <Calendar size={16} />
                            Filter by ride date:
                        </span>
                        {RIDE_DATE_FILTERS.map(({ key, label }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => {
                                    setRideDateFilter(key);
                                    if (key === 'custom' && !customDateFrom && !customDateTo) {
                                        const today = formatDateInput(new Date());
                                        setCustomDateFrom(today);
                                        setCustomDateTo(today);
                                    }
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium btn-tab ${rideDateFilter === key ? 'btn-tab-active' : ''}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {rideDateFilter === 'custom' && (
                        <div className="flex flex-wrap items-end gap-3 p-4 bg-white rounded-xl border border-gray-200">
                            <div>
                                <label htmlFor="driver-filter-from" className="block text-xs font-medium text-gray-600 mb-1">From</label>
                                <input
                                    id="driver-filter-from"
                                    type="date"
                                    value={customDateFrom}
                                    max={customDateTo || undefined}
                                    onChange={(e) => setCustomDateFrom(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="driver-filter-to" className="block text-xs font-medium text-gray-600 mb-1">To</label>
                                <input
                                    id="driver-filter-to"
                                    type="date"
                                    value={customDateTo}
                                    min={customDateFrom || undefined}
                                    onChange={(e) => setCustomDateTo(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                            {rideDateRange && (
                                <p className="text-sm text-gray-500 pb-2">
                                    Showing drivers with rides between {rideDateRange.from} and {rideDateRange.to}
                                </p>
                            )}
                        </div>
                    )}

                    {rideDateRange && rideDateFilter !== 'custom' && (
                        <p className="text-sm text-gray-500">
                            Showing {filteredDrivers.length} driver{filteredDrivers.length === 1 ? '' : 's'} who rode {rideDateRange.label.toLowerCase()}
                        </p>
                    )}
                    {rideDateFilter === 'custom' && customDateFrom && customDateTo && (
                        <p className="text-sm text-gray-500">
                            Showing {filteredDrivers.length} driver{filteredDrivers.length === 1 ? '' : 's'} in selected period
                        </p>
                    )}
                </div>

                {loading ? (
                    <CardGridSkeleton count={6} Card={EntityCardSkeleton} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
                ) : filteredDrivers.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-100">
                        {rideDateRange
                            ? 'No drivers found with rides in this period.'
                            : 'No drivers found.'}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDrivers.map((driver) => {
                            const verification = driverVerificationMeta(driver.verificationStatus);
                            const periodRides = driverRideStats.get(driver.driverId)?.periodRideCount || 0;
                            return (
                                <div key={driver.driverId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                    <div className="p-5 flex-1">
                                        <div className="flex items-start gap-4">
                                            {driver.profilePictureUrl ? (
                                                <img src={driver.profilePictureUrl} alt={driver.name} className="w-14 h-14 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <User className="text-gray-600" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate">{driver.name}</h3>
                                                <p className="text-sm text-gray-500">{driver.phoneNumber}</p>
                                                {rideDateRange && periodRides > 0 && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {periodRides} ride{periodRides === 1 ? '' : 's'} in period
                                                    </p>
                                                )}
                                            </div>
                                            <StatusBadge label={verification.label} tone={verification.tone} />
                                        </div>
                                        {driver.vehicle && (
                                            <p className="mt-3 text-sm text-gray-600">{driver.vehicle.make} {driver.vehicle.model}</p>
                                        )}
                                    </div>
                                    <div className="px-5 pb-5">
                                        <button type="button" onClick={() => openDriver(driver)} className="w-full py-2.5 btn-outline-primary rounded-lg">View</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedDriver && editForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Edit driver</h3>
                            <button type="button" onClick={closeDriver} className="p-1.5 rounded-full text-gray-500 hover:text-gray-900"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Verification status</p>
                                <div className="flex gap-2 flex-wrap">
                                    {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                                        <button key={s} type="button" onClick={() => setEditForm((f) => ({ ...f, verificationStatus: s }))} className={`px-3 py-2 rounded-lg text-sm font-medium btn-tab ${editForm.verificationStatus === s ? 'btn-tab-active' : ''}`}>
                                            {driverVerificationMeta(s).label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Availability</p>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setEditForm((f) => ({ ...f, isAvailable: true }))} className={`flex-1 py-2 rounded-lg text-sm font-medium btn-tab ${editForm.isAvailable ? 'btn-tab-active' : ''}`}>Available</button>
                                    <button type="button" onClick={() => setEditForm((f) => ({ ...f, isAvailable: false }))} className={`flex-1 py-2 rounded-lg text-sm font-medium btn-tab ${!editForm.isAvailable ? 'btn-tab-active' : ''}`}>Unavailable</button>
                                </div>
                            </div>
                            <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Full name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                            <input required type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                            <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Phone" value={editForm.phoneNumber} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} />
                            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="License number" value={editForm.licenseNumber} onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })} />
                            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                            <input type="number" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Years experience" value={editForm.yearsExperience} onChange={(e) => setEditForm({ ...editForm, yearsExperience: e.target.value })} />
                            <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Bio" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
                            {selectedDriver.vehicle && (
                                <div className="rounded-lg border border-gray-200 px-4">
                                    <DetailRow label="Vehicle" value={`${selectedDriver.vehicle.make} ${selectedDriver.vehicle.model}`} icon={Truck} />
                                    <DetailRow label="Registration" value={selectedDriver.vehicle.registrationNumber || '—'} />
                                </div>
                            )}
                            {selectedDriver.licenseDocumentUrl && (
                                <a href={selectedDriver.licenseDocumentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-gray-700 hover:underline">
                                    <FileText size={16} /> View license document
                                </a>
                            )}

                            <div className="rounded-lg border border-gray-200 overflow-hidden">
                                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Route size={18} className="text-gray-600" />
                                        <h4 className="text-sm font-semibold text-gray-900">Ride history</h4>
                                        <span className="text-xs text-gray-500">({driverTrips.length})</span>
                                    </div>
                                    {driverExportConfig && (
                                        <ExportDropdown exportConfig={driverExportConfig} className="shrink-0" />
                                    )}
                                </div>
                                {tripsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader size={24} className="animate-spin text-gray-400" />
                                    </div>
                                ) : driverTrips.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-8">No rides recorded for this driver.</p>
                                ) : (
                                    <div className="overflow-x-auto max-h-56 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-white">
                                                <tr>
                                                    <th className="text-left p-3 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">Passenger</th>
                                                    <th className="text-left p-3 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">Route</th>
                                                    <th className="text-left p-3 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">Amount</th>
                                                    <th className="text-left p-3 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">Status</th>
                                                    <th className="text-left p-3 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {driverTrips.map((trip) => {
                                                    const tripId = tripField(trip, 'tripId') || '';
                                                    const status = trip.status || 'REQUESTED';
                                                    return (
                                                        <tr key={tripId} className="hover:bg-gray-50">
                                                            <td className="p-3 border-b border-gray-50 text-gray-900">
                                                                {tripField(trip, 'passengerName') || tripField(trip, 'passengerPhone') || '—'}
                                                            </td>
                                                            <td className="p-3 border-b border-gray-50 text-gray-700 max-w-[160px]">
                                                                <span className="truncate block" title={tripRoute(trip)}>{tripRoute(trip)}</span>
                                                            </td>
                                                            <td className="p-3 border-b border-gray-50 text-gray-900 font-medium whitespace-nowrap">
                                                                RWF {trip.fare ?? 0}
                                                            </td>
                                                            <td className="p-3 border-b border-gray-50">
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rideStatusColors[status] || 'bg-gray-100 text-gray-700'}`}>
                                                                    {status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 border-b border-gray-50 text-gray-600 whitespace-nowrap">
                                                                {formatDate(trip.requestTime)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={closeDriver} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
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

export default Drivers;
