import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import { StatusBadge, DetailRow, formatRwf, formatLabel, auctionStatusMeta } from '../components/ui/EntityUI';
import { Gavel, Plus, Loader, ShoppingBag, Tag, X, User } from 'lucide-react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80';

const EMPTY_FORM = {
    listingType: 'SELL',
    title: '',
    description: '',
    make: '',
    model: '',
    year: '',
    price: '',
    imageUrl: '',
    status: 'ACTIVE',
};

const listingToEditForm = (item) => ({
    id: item.id,
    listingType: item.listingType || 'SELL',
    title: item.title || '',
    description: item.description || '',
    make: item.make || '',
    model: item.model || '',
    year: item.year ?? '',
    price: item.price ?? '',
    imageUrl: item.imageUrl || '',
    status: item.status || 'ACTIVE',
});

const Auctions = () => {
    const { user, isAdmin } = useAuth();
    const [listings, setListings] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [selectedListing, setSelectedListing] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);

    const loadListings = useCallback(async () => {
        setLoading(true);
        try {
            const type = filter === 'ALL' ? null : filter;
            const { listings: data } = await api.getAuctionListings(type, isAdmin);
            setListings(data || []);
        } catch (e) {
            console.error(e);
            setListings([]);
        } finally {
            setLoading(false);
        }
    }, [filter, isAdmin]);

    useEffect(() => {
        loadListings();
    }, [loadListings]);

    const openListing = (item) => {
        setSelectedListing(item);
        setEditForm(isAdmin ? listingToEditForm(item) : null);
    };

    const closeListing = () => {
        setSelectedListing(null);
        setEditForm(null);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.createAuctionListing({
                ...form,
                year: form.year ? Number(form.year) : undefined,
                price: Number(form.price),
                imageUrl: form.imageUrl || DEFAULT_IMAGE,
            });
            setShowAddModal(false);
            setForm(EMPTY_FORM);
            loadListings();
        } catch (e) {
            alert(e.message || 'Failed to create listing');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editForm?.id) return;
        setSaving(true);
        try {
            const { listing } = await api.updateAuctionListing(editForm.id, {
                listingType: editForm.listingType,
                title: editForm.title,
                description: editForm.description,
                make: editForm.make,
                model: editForm.model,
                year: editForm.year ? Number(editForm.year) : null,
                price: Number(editForm.price),
                imageUrl: editForm.imageUrl || DEFAULT_IMAGE,
                status: editForm.status,
            });
            setListings((prev) => prev.map((l) => (l.id === listing.id ? listing : l)));
            setSelectedListing(listing);
            setEditForm(listingToEditForm(listing));
        } catch (err) {
            alert(err.message || 'Failed to update listing');
        } finally {
            setSaving(false);
        }
    };

    const handlePurchase = async (listing) => {
        if (!window.confirm(`Confirm purchase of "${listing.title}" for RWF ${Number(listing.price).toLocaleString()}?`)) return;
        try {
            await api.purchaseAuctionListing(listing.id);
            loadListings();
            closeListing();
            alert('Purchase recorded successfully!');
        } catch (e) {
            alert(e.message || 'Purchase failed');
        }
    };

    const canBuy = (item) =>
        item.listingType === 'SELL' &&
        item.status === 'ACTIVE' &&
        item.userId !== user?.userId;

    const exportConfig = {
        title: 'For Sale Report',
        subtitle: 'Buy and sell vehicles on Ryde',
        filename: 'ryde-for-sale',
        summary: [
            { label: 'Total listings', value: listings.length },
            { label: 'Filter', value: filter === 'ALL' ? 'All' : filter },
        ],
        columns: ['Title', 'Type', 'Make', 'Model', 'Year', 'Price (RWF)', 'Status'],
        rows: listings.map((item) => [
            item.title,
            item.listingType === 'SELL' ? 'For Sale' : 'Wanted',
            item.make || '—',
            item.model || '—',
            item.year ?? '—',
            item.price != null ? Number(item.price).toLocaleString() : '—',
            item.status || '—',
        ]),
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Vehicle For Sale" subtitle="Buy and sell vehicles on Ryde" exportConfig={exportConfig} />

            <div className="max-w-6xl mx-auto p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2">
                        {['ALL', 'SELL', 'BUY'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setFilter(t)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium btn-tab ${filter === t ? 'btn-tab-active' : ''}`}
                            >
                                {t === 'ALL' ? 'All' : t === 'SELL' ? 'For Sale' : 'Wanted to Buy'}
                            </button>
                        ))}
                    </div>
                    <button type="button" onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 btn-outline-primary rounded-lg">
                        <Plus size={18} /> New listing
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500 flex items-center justify-center gap-2">
                        <Loader className="animate-spin" size={20} /> Loading listings…
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Gavel size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-600">No listings yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((item) => {
                            const status = auctionStatusMeta(item.status);
                            return (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                    <div className="h-44 bg-gray-100 relative">
                                        <img src={item.imageUrl || DEFAULT_IMAGE} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
                                        <StatusBadge label={status.label} tone={status.tone} className="absolute top-3 left-3" />
                                        <span className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-semibold ${item.listingType === 'SELL' ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'}`}>
                                            {item.listingType === 'SELL' ? 'For Sale' : 'Wanted'}
                                        </span>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                                        {(item.make || item.model) && (
                                            <p className="text-sm text-gray-600 mt-1">{[item.make, item.model, item.year].filter(Boolean).join(' • ')}</p>
                                        )}
                                        <p className="mt-3 text-xl font-semibold text-gray-900">{formatRwf(item.price)}</p>
                                        <button type="button" onClick={() => openListing(item)} className="mt-4 w-full py-2.5 btn-outline-primary rounded-lg">View</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {selectedListing && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="relative h-48 bg-gray-100">
                                <img src={(isAdmin ? editForm?.imageUrl : selectedListing.imageUrl) || DEFAULT_IMAGE} alt={selectedListing.title} className="w-full h-full object-cover" onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
                                <StatusBadge {...auctionStatusMeta(isAdmin ? editForm?.status : selectedListing.status)} className="absolute top-3 left-3" />
                                <button type="button" onClick={closeListing} className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full text-gray-600 hover:text-gray-900" aria-label="Close"><X size={20} /></button>
                            </div>
                            <div className="p-6">
                                {isAdmin && editForm ? (
                                    <form onSubmit={handleSave} className="space-y-4">
                                        <h3 className="text-xl font-bold text-gray-900">Edit listing</h3>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {['ACTIVE', 'SOLD', 'CANCELLED'].map((s) => (
                                                    <button key={s} type="button" onClick={() => setEditForm((f) => ({ ...f, status: s }))} className={`px-3 py-2 rounded-lg text-sm font-medium btn-tab ${editForm.status === s ? 'btn-tab-active' : ''}`}>
                                                        {auctionStatusMeta(s).label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={editForm.listingType} onChange={(e) => setEditForm({ ...editForm, listingType: e.target.value })}>
                                                <option value="SELL">Sell</option>
                                                <option value="BUY">Want to buy</option>
                                            </select>
                                        </div>
                                        <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                                        <div className="grid grid-cols-3 gap-2">
                                            <input placeholder="Make" className="px-3 py-2 border border-gray-300 rounded-lg" value={editForm.make} onChange={(e) => setEditForm({ ...editForm, make: e.target.value })} />
                                            <input placeholder="Model" className="px-3 py-2 border border-gray-300 rounded-lg" value={editForm.model} onChange={(e) => setEditForm({ ...editForm, model: e.target.value })} />
                                            <input placeholder="Year" type="number" className="px-3 py-2 border border-gray-300 rounded-lg" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} />
                                        </div>
                                        <input required type="number" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Price (RWF)" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                                        <input type="url" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Image URL" value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} />
                                        <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                                        <div className="flex gap-2">
                                            <button type="button" onClick={closeListing} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
                                            <button type="submit" disabled={saving} className="flex-1 py-2 btn-outline-primary rounded-lg disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedListing.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{formatLabel(selectedListing.listingType)} • Listed by {selectedListing.sellerName || 'User'}</p>
                                        {selectedListing.description && <p className="text-sm text-gray-500 mt-3">{selectedListing.description}</p>}
                                        <div className="mt-6 rounded-lg border border-gray-200 px-4">
                                            <DetailRow label="Make / Model" value={[selectedListing.make, selectedListing.model, selectedListing.year].filter(Boolean).join(' • ') || '—'} />
                                            <DetailRow label="Price" value={formatRwf(selectedListing.price)} />
                                            <DetailRow label="Status" value={auctionStatusMeta(selectedListing.status).label} icon={User} />
                                        </div>
                                        {canBuy(selectedListing) && (
                                            <button type="button" onClick={() => handlePurchase(selectedListing)} className="mt-6 w-full py-2.5 btn-outline-primary rounded-lg flex items-center justify-center gap-2">
                                                <ShoppingBag size={16} /> Buy now
                                            </button>
                                        )}
                                        {selectedListing.listingType === 'BUY' && (
                                            <div className="mt-6 flex items-center gap-2 text-amber-700 text-sm bg-amber-50 px-3 py-2 rounded-lg">
                                                <Tag size={14} /> Buyer looking for this vehicle
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Create listing</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={form.listingType} onChange={(e) => setForm({ ...form, listingType: e.target.value })}>
                                    <option value="SELL">Sell a vehicle</option>
                                    <option value="BUY">Want to buy</option>
                                </select>
                                <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                                <div className="grid grid-cols-3 gap-2">
                                    <input placeholder="Make" className="px-3 py-2 border border-gray-300 rounded-lg" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
                                    <input placeholder="Model" className="px-3 py-2 border border-gray-300 rounded-lg" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                                    <input placeholder="Year" type="number" className="px-3 py-2 border border-gray-300 rounded-lg" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
                                </div>
                                <input required type="number" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Price (RWF)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                                <input type="url" placeholder="Image URL" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                                <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
                                    <button type="submit" className="flex-1 py-2 btn-outline-primary rounded-lg">Publish</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Auctions;
