import React, { useCallback, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { waitForRentalIntentCompleted, syncRentalIntentInBackground } from '../services/paymentPolling';
import Header from '../components/Header';
import PaymentConfirmDialog from '../components/PaymentConfirmDialog';
import { CardGridSkeleton } from '../components/ui/Skeleton';
import { BADGES, badgeCell, getMostRentedId, withBadgeColumn } from '../utils/exportBadges';
import {
    Car,
    Plus,
    CreditCard,
    Loader,
    ImageIcon,
    X,
    MapPin,
    Users,
    Fuel,
    Settings2,
    User,
} from 'lucide-react';

const IPAY_PUBLIC_KEY = process.env.REACT_APP_IPAY_PUBLIC_KEY || '';

const DEFAULT_CAR_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80';

const EMPTY_VEHICLE = {
    make: '',
    model: '',
    year: '',
    color: '',
    vehicleType: 'SEDAN',
    dailyRateWithDriver: '',
    dailyRateWithoutDriver: '',
    pickupLocation: '',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    ownerName: '',
    seats: '',
    imageUrl: '',
    description: '',
};

const formatRwf = (value) => {
    if (value == null || Number.isNaN(Number(value))) return '—';
    return `RWF ${Number(value).toLocaleString()}`;
};

const formatLabel = (value) => {
    if (!value) return '—';
    return String(value)
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const displayDailyRate = (vehicle) =>
    vehicle.dailyRateWithoutDriver ?? vehicle.dailyRate ?? 0;

const formatDateInput = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const countRentalDays = (start, end) => {
    const s = new Date(`${start}T00:00:00`);
    const e = new Date(`${end}T00:00:00`);
    return Math.max(1, Math.round((e - s) / (24 * 60 * 60 * 1000)) + 1);
};

const isVehicleAvailable = (vehicle) => {
    if (vehicle?.isAvailable === false) return false;
    if (vehicle?.rentedUntil) {
        const end = new Date(`${String(vehicle.rentedUntil).slice(0, 10)}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (end >= today) return false;
    }
    return vehicle?.isAvailable === true;
};

const vehicleToEditForm = (vehicle) => ({
    id: vehicle.id,
    make: vehicle.make || '',
    model: vehicle.model || '',
    year: vehicle.year ?? '',
    color: vehicle.color || '',
    vehicleType: vehicle.type || vehicle.vehicleType || 'SEDAN',
    dailyRateWithDriver: vehicle.dailyRateWithDriver ?? '',
    dailyRateWithoutDriver: vehicle.dailyRateWithoutDriver ?? vehicle.dailyRate ?? '',
    pickupLocation: vehicle.pickupLocation || '',
    transmission: vehicle.transmission || 'AUTOMATIC',
    fuelType: vehicle.fuelType || 'PETROL',
    ownerName: vehicle.ownerName || '',
    seats: vehicle.seats ?? '',
    imageUrl: vehicle.imageUrl || '',
    description: vehicle.description || '',
    isAvailable: isVehicleAvailable(vehicle),
});

const StatusBadge = ({ available, className = '' }) => (
    <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            available ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
        } ${className}`}
    >
        {available ? 'Available' : 'Rented'}
    </span>
);

const DetailRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
            {Icon && <Icon size={16} className="text-gray-400" />}
            <span>{label}</span>
        </div>
        <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
);

const Rentals = () => {
    const { isPassenger, isAdmin } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState(EMPTY_VEHICLE);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [savingVehicle, setSavingVehicle] = useState(false);
    const [rentWithDriver, setRentWithDriver] = useState(false);
    const [rentalStartDate, setRentalStartDate] = useState(() => formatDateInput(new Date()));
    const [rentalEndDate, setRentalEndDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return formatDateInput(d);
    });
    const [payingVehicleId, setPayingVehicleId] = useState(null);
    const [error, setError] = useState(null);
    const [paymentConfirm, setPaymentConfirm] = useState({ open: false, intentId: null, vehicleLabel: '', clientConfirmed: false });

    const loadVehicles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { vehicles: list } = await api.getRentalVehicles();
            setVehicles(list || []);
        } catch (e) {
            setError(e.message || 'Failed to load rental vehicles');
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    useEffect(() => {
        const onFocus = () => loadVehicles();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [loadVehicles]);

    const openVehicleDetails = (vehicle) => {
        setSelectedVehicle(vehicle);
        setEditForm(isAdmin ? vehicleToEditForm(vehicle) : null);
        setRentWithDriver(false);
        const today = formatDateInput(new Date());
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setRentalStartDate(today);
        setRentalEndDate(formatDateInput(tomorrow));
    };

    const closeVehicleDetails = () => {
        setSelectedVehicle(null);
        setEditForm(null);
        setRentWithDriver(false);
    };

    const handleSaveVehicle = async (e) => {
        e.preventDefault();
        if (!editForm?.id) return;

        setSavingVehicle(true);
        try {
            const { vehicle } = await api.updateRentalVehicle(editForm.id, {
                make: editForm.make,
                model: editForm.model,
                year: Number(editForm.year),
                color: editForm.color,
                vehicleType: editForm.vehicleType,
                dailyRateWithDriver: Number(editForm.dailyRateWithDriver),
                dailyRateWithoutDriver: Number(editForm.dailyRateWithoutDriver),
                pickupLocation: editForm.pickupLocation,
                transmission: editForm.transmission,
                fuelType: editForm.fuelType,
                ownerName: editForm.ownerName,
                seats: Number(editForm.seats),
                imageUrl: editForm.imageUrl || DEFAULT_CAR_IMAGE,
                description: editForm.description,
                isAvailable: editForm.isAvailable,
            });
            setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? vehicle : v)));
            setSelectedVehicle(vehicle);
            setEditForm(vehicleToEditForm(vehicle));
        } catch (err) {
            alert(err.message || 'Failed to update vehicle');
        } finally {
            setSavingVehicle(false);
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            const { vehicle } = await api.createRentalVehicle({
                make: newVehicle.make,
                model: newVehicle.model,
                year: Number(newVehicle.year),
                color: newVehicle.color,
                vehicleType: newVehicle.vehicleType,
                dailyRateWithDriver: Number(newVehicle.dailyRateWithDriver),
                dailyRateWithoutDriver: Number(newVehicle.dailyRateWithoutDriver),
                pickupLocation: newVehicle.pickupLocation,
                transmission: newVehicle.transmission,
                fuelType: newVehicle.fuelType,
                ownerName: newVehicle.ownerName,
                seats: Number(newVehicle.seats),
                imageUrl: newVehicle.imageUrl || DEFAULT_CAR_IMAGE,
                description: newVehicle.description,
            });
            setVehicles((prev) => [...prev, vehicle]);
            setNewVehicle(EMPTY_VEHICLE);
            setShowAddModal(false);
        } catch (e) {
            alert(e.message || 'Failed to add vehicle');
        }
    };

    const handleRent = async (vehicle, withDriver = false) => {
        if (!IPAY_PUBLIC_KEY) {
            alert('Payment (IremboPay) is not configured.');
            return;
        }
        if (typeof window.IremboPay === 'undefined') {
            alert('Payment system is not ready. Please refresh and try again.');
            return;
        }
        if (!rentalStartDate || !rentalEndDate) {
            alert('Please select rental start and end dates.');
            return;
        }
        if (rentalEndDate < rentalStartDate) {
            alert('End date must be on or after start date.');
            return;
        }

        const days = countRentalDays(rentalStartDate, rentalEndDate);
        const rate = withDriver
            ? (vehicle.dailyRateWithDriver ?? vehicle.dailyRate)
            : (vehicle.dailyRateWithoutDriver ?? vehicle.dailyRate);
        const amount = Number(rate) * days;

        if (!amount || amount <= 0) {
            alert('Invalid amount.');
            return;
        }

        setPayingVehicleId(vehicle.id);
        try {
            const { invoiceNumber, intentId } = await api.createInvoiceForAmount({
                vehicleRef: vehicle.id,
                rentalStartDate,
                rentalEndDate,
                withDriver,
            });
            if (!invoiceNumber || !intentId) {
                alert('Could not create payment invoice. Please try again.');
                return;
            }
            window.IremboPay.initiate({
                publicKey: IPAY_PUBLIC_KEY,
                invoiceNumber,
                locale: window.IremboPay.locale.EN,
                callback: async (err) => {
                    setPayingVehicleId(null);
                    if (!err) {
                        try {
                            await api.acknowledgeRentalPayment(intentId);
                        } catch (_) {
                            syncRentalIntentInBackground(intentId);
                        }
                        setPaymentConfirm({
                            open: true,
                            intentId,
                            vehicleLabel: `${vehicle.make} ${vehicle.model}`,
                            clientConfirmed: true,
                        });
                        await loadVehicles();
                        closeVehicleDetails();
                    } else {
                        try {
                            await api.cancelRentalPayment(intentId);
                        } catch (_) {}
                        alert('Payment failed or was cancelled.');
                    }
                },
            });
        } catch (e) {
            setPayingVehicleId(null);
            alert(e.message || 'Failed to start payment.');
        }
    };

    const selectedRate = selectedVehicle
        ? (rentWithDriver
            ? (selectedVehicle.dailyRateWithDriver ?? selectedVehicle.dailyRate)
            : (selectedVehicle.dailyRateWithoutDriver ?? selectedVehicle.dailyRate))
        : 0;

    const selectedDays = countRentalDays(rentalStartDate, rentalEndDate);
    const selectedTotal = Number(selectedRate) * selectedDays;

    const mostRentedId = getMostRentedId(vehicles);

    const exportConfig = {
        title: 'Rentals Report',
        subtitle: isPassenger ? 'Rent a vehicle — pay with IremboPay' : 'Add and manage rental vehicles',
        filename: 'ryde-rentals',
        summary: [
            { label: 'Total vehicles', value: vehicles.length },
            { label: 'Available', value: vehicles.filter((v) => isVehicleAvailable(v)).length },
            ...(mostRentedId ? [{
                label: 'Most Rented',
                value: `${vehicles.find((v) => v.id === mostRentedId)?.make || ''} ${vehicles.find((v) => v.id === mostRentedId)?.model || ''}`.trim(),
            }] : []),
        ],
        columns: ['Make', 'Model', 'Year', 'Type', 'Daily rate', 'Location', 'Status', 'Badge'],
        rows: withBadgeColumn(
            vehicles.map((v) => [
                v.make,
                v.model,
                v.year ?? '—',
                formatLabel(v.type || v.vehicleType),
                formatRwf(displayDailyRate(v)),
                v.pickupLocation || '—',
                isVehicleAvailable(v) ? 'Available' : 'Rented',
            ]),
            vehicles.map((v) => badgeCell(v.id, mostRentedId, BADGES.MOST_RENTED))
        ),
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="Rentals"
                subtitle={isPassenger ? 'Rent a vehicle — pay with IremboPay' : 'Add and manage rental vehicles'}
                exportConfig={exportConfig}
            />

            <div className="max-w-6xl mx-auto p-6">
                {isPassenger && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-800">
                        <CreditCard size={20} />
                        <span>Pay securely with IremboPay when you book.</span>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
                )}

                {isAdmin && (
                    <div className="mb-6 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 btn-outline-primary rounded-lg"
                        >
                            <Plus size={18} /> Add vehicle for rental
                        </button>
                    </div>
                )}

                {loading ? (
                    <CardGridSkeleton count={6} />
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Car size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-600">No vehicles available for rental.</p>
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setShowAddModal(true)}
                                className="mt-4 btn-text-action"
                            >
                                Add first vehicle
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map((v) => (
                            <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                <div className="h-44 bg-gray-100 relative">
                                    <img
                                        src={v.imageUrl || DEFAULT_CAR_IMAGE}
                                        alt={`${v.make} ${v.model}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = DEFAULT_CAR_IMAGE; }}
                                    />
                                    <StatusBadge available={isVehicleAvailable(v)} className="absolute top-3 left-3" />
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-lg font-bold text-gray-900">{v.make} {v.model}</h3>
                                        {!isAdmin && <StatusBadge available={isVehicleAvailable(v)} />}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{v.year} • {v.color} • {formatLabel(v.type)}</p>
                                    {v.description && (
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{v.description}</p>
                                    )}
                                    {!isVehicleAvailable(v) && v.rentedUntil && (
                                        <p className="text-xs text-amber-700 mt-2">
                                            Rented until {v.rentedUntil}
                                        </p>
                                    )}
                                    <p className="mt-4 text-xl font-semibold text-gray-900">
                                        {formatRwf(displayDailyRate(v))}{' '}
                                        <span className="text-sm font-normal text-gray-500">/ day (no driver)</span>
                                    </p>
                                    <div className={`mt-4 flex gap-2 ${isPassenger ? '' : 'flex-col'}`}>
                                        <button
                                            type="button"
                                            onClick={() => openVehicleDetails(v)}
                                            className={`py-2.5 btn-outline-primary rounded-lg ${isPassenger ? 'flex-1' : 'w-full'}`}
                                        >
                                            View
                                        </button>
                                        {isPassenger && (
                                            <button
                                                type="button"
                                                onClick={() => openVehicleDetails(v)}
                                                disabled={payingVehicleId === v.id || !isVehicleAvailable(v)}
                                                className="flex-1 py-2.5 btn-outline-primary rounded-lg disabled:opacity-50"
                                            >
                                                {isVehicleAvailable(v) ? 'Book' : 'Rented'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedVehicle && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={(isAdmin ? editForm?.imageUrl : selectedVehicle.imageUrl) || DEFAULT_CAR_IMAGE}
                                    alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = DEFAULT_CAR_IMAGE; }}
                                />
                                <StatusBadge
                                    available={isAdmin ? editForm?.isAvailable : isVehicleAvailable(selectedVehicle)}
                                    className="absolute top-3 left-3"
                                />
                                <button
                                    type="button"
                                    onClick={closeVehicleDetails}
                                    className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full text-gray-600 hover:text-gray-900"
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                {isAdmin && editForm ? (
                                    <form onSubmit={handleSaveVehicle} className="space-y-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <h3 className="text-xl font-bold text-gray-900">Edit rental vehicle</h3>
                                            <StatusBadge available={editForm.isAvailable} />
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditForm((f) => ({ ...f, isAvailable: true }))}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium btn-tab ${editForm.isAvailable ? 'btn-tab-active' : ''}`}
                                                >
                                                    Available
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditForm((f) => ({ ...f, isAvailable: false }))}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium btn-tab ${!editForm.isAvailable ? 'btn-tab-active' : ''}`}
                                                >
                                                    Rented
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                                                <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.make} onChange={(e) => setEditForm({ ...editForm, make: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                                <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.model} onChange={(e) => setEditForm({ ...editForm, model: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                                <input type="number" required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                                <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.color} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.vehicleType} onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })}>
                                                    <option value="SEDAN">Sedan</option>
                                                    <option value="SUV">SUV</option>
                                                    <option value="MOTORCYCLE">Motorcycle</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                                                <input type="number" required min="1" max="50" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.seats} onChange={(e) => setEditForm({ ...editForm, seats: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup location</label>
                                            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.pickupLocation} onChange={(e) => setEditForm({ ...editForm, pickupLocation: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Rate with driver (RWF)</label>
                                                <input type="number" required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.dailyRateWithDriver} onChange={(e) => setEditForm({ ...editForm, dailyRateWithDriver: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Rate without driver (RWF)</label>
                                                <input type="number" required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.dailyRateWithoutDriver} onChange={(e) => setEditForm({ ...editForm, dailyRateWithoutDriver: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.transmission} onChange={(e) => setEditForm({ ...editForm, transmission: e.target.value })}>
                                                    <option value="AUTOMATIC">Automatic</option>
                                                    <option value="MANUAL">Manual</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel type</label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.fuelType} onChange={(e) => setEditForm({ ...editForm, fuelType: e.target.value })}>
                                                    <option value="PETROL">Petrol</option>
                                                    <option value="DIESEL">Diesel</option>
                                                    <option value="ELECTRIC">Electric</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Owner name</label>
                                            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.ownerName} onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                <ImageIcon size={14} /> Image URL
                                            </label>
                                            <input type="url" required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="button" onClick={closeVehicleDetails} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                            <button type="submit" disabled={savingVehicle} className="flex-1 py-2 btn-outline-primary rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                                                {savingVehicle && <Loader size={16} className="animate-spin" />}
                                                Save changes
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">
                                                    {selectedVehicle.make} {selectedVehicle.model}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {selectedVehicle.year} • {selectedVehicle.color} • {formatLabel(selectedVehicle.type)}
                                                </p>
                                            </div>
                                            <StatusBadge available={isVehicleAvailable(selectedVehicle)} />
                                        </div>
                                        {selectedVehicle.description && (
                                            <p className="text-sm text-gray-500 mt-3">{selectedVehicle.description}</p>
                                        )}

                                        <div className="mt-6 rounded-lg border border-gray-200 px-4">
                                            <DetailRow label="Pickup location" value={selectedVehicle.pickupLocation || '—'} icon={MapPin} />
                                            <DetailRow label="Cost with driver" value={`${formatRwf(selectedVehicle.dailyRateWithDriver)} / day`} />
                                            <DetailRow label="Cost without driver" value={`${formatRwf(selectedVehicle.dailyRateWithoutDriver ?? selectedVehicle.dailyRate)} / day`} />
                                            <DetailRow label="Transmission" value={formatLabel(selectedVehicle.transmission)} icon={Settings2} />
                                            <DetailRow label="Fuel type" value={formatLabel(selectedVehicle.fuelType)} icon={Fuel} />
                                            <DetailRow label="Owner" value={selectedVehicle.ownerName || '—'} icon={User} />
                                            <DetailRow label="Seats" value={selectedVehicle.seats ?? '—'} icon={Users} />
                                        </div>

                                        {isPassenger && isVehicleAvailable(selectedVehicle) && (
                                            <div className="mt-6 space-y-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Rental period</p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">From</label>
                                                            <input
                                                                type="date"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black"
                                                                value={rentalStartDate}
                                                                min={formatDateInput(new Date())}
                                                                onChange={(e) => setRentalStartDate(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">To</label>
                                                            <input
                                                                type="date"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black"
                                                                value={rentalEndDate}
                                                                min={rentalStartDate || formatDateInput(new Date())}
                                                                onChange={(e) => setRentalEndDate(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">{selectedDays} day{selectedDays !== 1 ? 's' : ''}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Rental option</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setRentWithDriver(false)}
                                                            className={`flex-1 py-2 rounded-lg text-sm font-medium btn-tab ${!rentWithDriver ? 'btn-tab-active' : ''}`}
                                                        >
                                                            Without driver
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRentWithDriver(true)}
                                                            className={`flex-1 py-2 rounded-lg text-sm font-medium btn-tab ${rentWithDriver ? 'btn-tab-active' : ''}`}
                                                        >
                                                            With driver
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    Total: {formatRwf(selectedTotal)}{' '}
                                                    <span className="text-sm font-normal text-gray-500">
                                                        ({formatRwf(selectedRate)} × {selectedDays} day{selectedDays !== 1 ? 's' : ''})
                                                    </span>
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRent(selectedVehicle, rentWithDriver)}
                                                    disabled={payingVehicleId === selectedVehicle.id}
                                                    className="w-full py-2.5 btn-outline-primary rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {payingVehicleId === selectedVehicle.id && <Loader size={18} className="animate-spin" />}
                                                    Book (Pay with IremboPay)
                                                </button>
                                            </div>
                                        )}

                                        {isPassenger && !isVehicleAvailable(selectedVehicle) && (
                                            <p className="mt-6 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                                                This vehicle is currently rented
                                                {selectedVehicle.rentedUntil ? ` until ${selectedVehicle.rentedUntil}` : ''}
                                                {' '}and not available for booking.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Add vehicle for rental</h3>
                            <form onSubmit={handleAddVehicle} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                                        <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.make} onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                        <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                        <input type="number" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                        <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.color} onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.vehicleType} onChange={(e) => setNewVehicle({ ...newVehicle, vehicleType: e.target.value })}>
                                            <option value="SEDAN">Sedan</option>
                                            <option value="SUV">SUV</option>
                                            <option value="MOTORCYCLE">Motorcycle</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                                        <input type="number" required min="1" max="50" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.seats} onChange={(e) => setNewVehicle({ ...newVehicle, seats: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup location</label>
                                    <input type="text" required placeholder="e.g. Kigali Heights, KG 7 Ave" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.pickupLocation} onChange={(e) => setNewVehicle({ ...newVehicle, pickupLocation: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Daily rate with driver (RWF)</label>
                                        <input type="number" required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.dailyRateWithDriver} onChange={(e) => setNewVehicle({ ...newVehicle, dailyRateWithDriver: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Daily rate without driver (RWF)</label>
                                        <input type="number" required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.dailyRateWithoutDriver} onChange={(e) => setNewVehicle({ ...newVehicle, dailyRateWithoutDriver: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.transmission} onChange={(e) => setNewVehicle({ ...newVehicle, transmission: e.target.value })}>
                                            <option value="AUTOMATIC">Automatic</option>
                                            <option value="MANUAL">Manual</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fuel type</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.fuelType} onChange={(e) => setNewVehicle({ ...newVehicle, fuelType: e.target.value })}>
                                            <option value="PETROL">Petrol</option>
                                            <option value="DIESEL">Diesel</option>
                                            <option value="ELECTRIC">Electric</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner name</label>
                                    <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.ownerName} onChange={(e) => setNewVehicle({ ...newVehicle, ownerName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <ImageIcon size={14} /> Image URL
                                    </label>
                                    <input type="url" required placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.imageUrl} onChange={(e) => setNewVehicle({ ...newVehicle, imageUrl: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newVehicle.description} onChange={(e) => setNewVehicle({ ...newVehicle, description: e.target.value })} />
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="flex-1 py-2 btn-outline-primary rounded-lg">Add vehicle</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <PaymentConfirmDialog
                open={paymentConfirm.open}
                title="Rental payment"
                successMessage={`Booking confirmed for ${paymentConfirm.vehicleLabel}. Payment successful!`}
                clientConfirmed={paymentConfirm.clientConfirmed}
                poll={paymentConfirm.intentId
                    ? () => waitForRentalIntentCompleted(paymentConfirm.intentId)
                    : null}
                onClose={async () => {
                    setPaymentConfirm({ open: false, intentId: null, vehicleLabel: '', clientConfirmed: false });
                    await loadVehicles();
                }}
            />
        </div>
    );
};

export default Rentals;
