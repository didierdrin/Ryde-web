import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Header from '../components/Header';
import { StatusBadge, DetailRow, driverVerificationMeta } from '../components/ui/EntityUI';
import { CardGridSkeleton, EntityCardSkeleton } from '../components/ui/Skeleton';
import { Truck, User, FileText, X, Loader } from 'lucide-react';

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
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        fetchDrivers();
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

    const exportConfig = {
        title: 'Drivers Report',
        subtitle: 'Approve and manage drivers',
        filename: 'ryde-drivers',
        summary: [{ label: 'Total drivers', value: drivers.length }],
        columns: ['Name', 'Phone', 'Email', 'Verification', 'Available', 'License'],
        rows: drivers.map((d) => [
            d.name,
            d.phoneNumber,
            d.email,
            d.verificationStatus || 'PENDING',
            d.isAvailable !== false ? 'Yes' : 'No',
            d.licenseNumber || '—',
        ]),
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Drivers Management" subtitle="Approve and manage drivers" exportConfig={exportConfig} />

            <div className="p-6 flex-1">
                {loading ? (
                    <CardGridSkeleton count={6} Card={EntityCardSkeleton} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {drivers.map((driver) => {
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
