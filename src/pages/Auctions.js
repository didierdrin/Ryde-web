import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import { Gavel, Plus, Loader, ShoppingBag, Tag } from 'lucide-react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80';

const Auctions = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        listingType: 'SELL',
        title: '',
        description: '',
        make: '',
        model: '',
        year: '',
        price: '',
        imageUrl: '',
    });

    const loadListings = useCallback(async () => {
        setLoading(true);
        try {
            const type = filter === 'ALL' ? null : filter;
            const { listings: data } = await api.getAuctionListings(type);
            setListings(data || []);
        } catch (e) {
            console.error(e);
            setListings([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadListings();
    }, [loadListings]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.createAuctionListing({
                ...form,
                year: form.year ? Number(form.year) : undefined,
                price: Number(form.price),
                imageUrl: form.imageUrl || DEFAULT_IMAGE,
            });
            setShowModal(false);
            setForm({ listingType: 'SELL', title: '', description: '', make: '', model: '', year: '', price: '', imageUrl: '' });
            loadListings();
        } catch (e) {
            alert(e.message || 'Failed to create listing');
        }
    };

    const handlePurchase = async (listing) => {
        if (!window.confirm(`Confirm purchase of "${listing.title}" for RWF ${Number(listing.price).toLocaleString()}?`)) return;
        try {
            await api.purchaseAuctionListing(listing.id);
            loadListings();
            alert('Purchase recorded successfully!');
        } catch (e) {
            alert(e.message || 'Purchase failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Vehicle Auction" subtitle="Buy and sell vehicles on Ryde" />

            <div className="max-w-6xl mx-auto p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2">
                        {['ALL', 'SELL', 'BUY'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setFilter(t)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                            >
                                {t === 'ALL' ? 'All' : t === 'SELL' ? 'For Sale' : 'Wanted to Buy'}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
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
                        <p className="text-gray-600">No active listings yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                <div className="h-44 bg-gray-100 relative">
                                    <img
                                        src={item.imageUrl || DEFAULT_IMAGE}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                                    />
                                    <span className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold ${item.listingType === 'SELL' ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'}`}>
                                        {item.listingType === 'SELL' ? 'For Sale' : 'Wanted'}
                                    </span>
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                                    {(item.make || item.model) && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {[item.make, item.model, item.year].filter(Boolean).join(' • ')}
                                        </p>
                                    )}
                                    {item.description && (
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                                    )}
                                    <p className="mt-3 text-xl font-semibold text-gray-900">
                                        RWF {Number(item.price).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Listed by {item.sellerName || 'User'}</p>
                                    {item.listingType === 'SELL' && item.userId !== user?.userId && (
                                        <button
                                            type="button"
                                            onClick={() => handlePurchase(item)}
                                            className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                                        >
                                            <ShoppingBag size={16} /> Buy now
                                        </button>
                                    )}
                                    {item.listingType === 'BUY' && (
                                        <div className="mt-4 flex items-center gap-2 text-amber-700 text-sm bg-amber-50 px-3 py-2 rounded-lg">
                                            <Tag size={14} /> Buyer looking for this vehicle
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Create listing</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={form.listingType} onChange={(e) => setForm({ ...form, listingType: e.target.value })}>
                                        <option value="SELL">Sell a vehicle</option>
                                        <option value="BUY">Want to buy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <input placeholder="Make" className="px-3 py-2 border border-gray-300 rounded-lg" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
                                    <input placeholder="Model" className="px-3 py-2 border border-gray-300 rounded-lg" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                                    <input placeholder="Year" type="number" className="px-3 py-2 border border-gray-300 rounded-lg" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (RWF)</label>
                                    <input required type="number" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                    <input type="url" placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
                                    <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Publish</button>
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
