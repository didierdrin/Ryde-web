import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Header from '../components/Header';
import { StatusBadge, DetailRow, driverVerificationMeta } from '../components/ui/EntityUI';
import { CardGridSkeleton, EntityCardSkeleton } from '../components/ui/Skeleton';
import { Truck, User, FileText, X, Loader, Activity, Users } from 'lucide-react';
import { BADGES, badgeCell, getHighPerformerId, withBadgeColumn } from '../utils/exportBadges';
import { normalizeTrip, tripField } from '../utils/tripUtils';

const TABS = [
    { key: 'activity', label: 'Recent Activity', icon: Activity },
    { key: 'management', label: 'Driver Management', icon: Users },
];

const VERIFICATION_FILTERS = [
    { key: 'ALL', label: 'All' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'REJECTED', label: 'Rejected' },
];

const rideStatusColors = {
    COMPLETED: 'bg-green-100 text-green-600',
    REQUESTED: 'bg-amber-100 text-amber-600',
    ACCEPTED: 'bg-blue-100 text-blue-600',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-600',
    CANCELLED: 'bg-red-100 text-red-500',
};

const formatDate = (d) => (d ? new Date(d).toLocaleString() : '—');

const formatTimeAgo = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
};

const tripRoute = (trip) => {
    const pickup = tripField(trip, 'pickupAddress') || '—';
    const dest = tripField(trip, 'destinationAddress') || '—';
    return `${pickup} → ${dest}`;
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
    const [activeTab, setActiveTab] = useState('activity');
    const [verificationFilter, setVerificationFilter] = useState('ALL');
    const [drivers, setDrivers] = useState([]);
    const [recentTrips, setRecentTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tripsLoading, setTripsLoading] = useState(true);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);

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

    const fetchRecentTrips = async () => {
        try {
            setTripsLoading(true);
            const data = await apiService.getAdminTrips();
            const trips = (data.trips || []).map(normalizeTrip);
            const sorted = [...trips].sort((a, b) => {
                const dateA = new Date(a.requestTime || 0);
                const dateB = new Date(b.requestTime || 0);
                return dateB - dateA;
            });
            setRecentTrips(sorted);
        } catch (error) {
            console.error('Error fetching recent trips:', error);
        } finally {
            setTripsLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
        fetchRecentTrips();
    }, []);

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

    const filteredDrivers = verificationFilter === 'ALL'
        ? drivers
        : drivers.filter((d) => (d.verificationStatus || 'PENDING') === verificationFilter);

    const exportConfig = activeTab === 'activity'
        ? {
            title: 'Driver Activity Report',
            subtitle: 'Recent rides by driver',
            filename: 'ryde-driver-activity',
            summary: [
                { label: 'Total rides', value: recentTrips.length },
                { label: 'With driver assigned', value: recentTrips.filter((t) => tripField(t, 'driverId')).length },
            ],
            columns: ['Ride ID', 'Driver', 'Passenger', 'Route', 'Amount', 'Status', 'Time'],
            rows: recentTrips.map((t) => [
                (tripField(t, 'tripId') || '').slice(0, 8),
                tripField(t, 'driverName') || 'Unassigned',
                tripField(t, 'passengerName') || tripField(t, 'passengerPhone') || '—',
                tripRoute(t),
                t.fare ?? 0,
                t.status || 'REQUESTED',
                formatDate(t.requestTime),
            ]),
        }
        : {
            title: 'Drivers Report',
            subtitle: 'Approve and manage drivers',
            filename: 'ryde-drivers',
            summary: [
                { label: 'Total drivers', value: filteredDrivers.length },
                ...(highPerformer ? [{ label: 'High Performer', value: highPerformer.name }] : []),
            ],
            columns: ['Name', 'Phone', 'Email', 'Trips', 'Rating', 'Verification', 'Available', 'License', 'Badge'],
            rows: withBadgeColumn(
                filteredDrivers.map((d) => [
                    d.name,
                    d.phoneNumber,
                    d.email,
                    d.totalTrips ?? '—',
                    d.rating ?? '—',
                    d.verificationStatus || 'PENDING',
                    d.isAvailable !== false ? 'Yes' : 'No',
                    d.licenseNumber || '—',
                ]),
                filteredDrivers.map((d) => badgeCell(d.driverId, highPerformerId, BADGES.HIGH_PERFORMER))
            ),
        };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header
                title="Drivers Management"
                subtitle={activeTab === 'activity' ? 'Recent driver ride activity' : 'Approve and manage drivers'}
                exportConfig={exportConfig}
            />

            <div className="px-6 pt-4">
                <div className="flex gap-2 flex-wrap border-b border-gray-200 pb-4">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium btn-tab ${activeTab === key ? 'btn-tab-active' : ''}`}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 flex-1 pt-4">
                {activeTab === 'activity' ? (
                    tripsLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader size={32} className="animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Ride ID</th>
                                            <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Driver</th>
                                            <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Passenger</th>
                                            <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Route</th>
                                            <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Amount</th>
                                            <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Status</th>
                                            <th className="text-left p-4 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTrips.length > 0 ? recentTrips.map((trip) => {
                                            const tripId = tripField(trip, 'tripId') || '';
                                            const driverName = tripField(trip, 'driverName');
                                            const passengerName = tripField(trip, 'passengerName') || tripField(trip, 'passengerPhone');
                                            const status = trip.status || 'REQUESTED';
                                            return (
                                                <tr key={tripId} className="hover:bg-gray-50">
                                                    <td className="p-4 border-b border-gray-200 text-gray-600 text-sm font-mono">
                                                        #{tripId.slice(0, 8) || '—'}
                                                    </td>
                                                    <td className="p-4 border-b border-gray-200">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                                <User size={14} className="text-gray-600" />
                                                            </div>
                                                            <span className="font-medium text-sm text-gray-900">
                                                                {driverName || 'Unassigned'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 border-b border-gray-200 text-sm text-gray-900">
                                                        {passengerName || '—'}
                                                    </td>
                                                    <td className="p-4 border-b border-gray-200 text-sm text-gray-700 max-w-xs">
                                                        <span className="truncate block" title={tripRoute(trip)}>{tripRoute(trip)}</span>
                                                    </td>
                                                    <td className="p-4 border-b border-gray-200 text-sm text-gray-900 font-medium">
                                                        RWF {trip.fare ?? 0}
                                                    </td>
                                                    <td className="p-4 border-b border-gray-200">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rideStatusColors[status] || 'bg-gray-100 text-gray-700'}`}>
                                                            {status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 border-b border-gray-200 text-gray-600 text-sm">
                                                        {formatTimeAgo(trip.requestTime)}
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={7} className="text-center p-8 text-gray-500">No recent ride activity.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ) : (
                    <>
                        <div className="mb-6 flex gap-2 flex-wrap">
                            {VERIFICATION_FILTERS.map(({ key, label }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setVerificationFilter(key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium btn-tab ${verificationFilter === key ? 'btn-tab-active' : ''}`}
                                >
                                    {label}
                                    {key !== 'ALL' && (
                                        <span className="ml-1.5 text-xs opacity-70">
                                            ({drivers.filter((d) => (d.verificationStatus || 'PENDING') === key).length})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <CardGridSkeleton count={6} Card={EntityCardSkeleton} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
                        ) : filteredDrivers.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                No {verificationFilter === 'ALL' ? '' : verificationFilter.toLowerCase()} drivers found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredDrivers.map((driver) => {
                                    const verification = driverVerificationMeta(driver.verificationStatus);
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
                    </>
                )}
            </div>

            {selectedDriver && editForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
