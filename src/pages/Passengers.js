import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Header from '../components/Header';
import { User, Search, Shield } from 'lucide-react';

const Passengers = () => {
  const { isAdmin } = useAuth();
  const [passengers, setPassengers] = useState([]);
  const [filteredPassengers, setFilteredPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPassengers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAdminPassengers();
      const list = data.passengers || [];
      setPassengers(list);
      setFilteredPassengers(list);
    } catch (error) {
      console.error('Error fetching passengers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    setFilteredPassengers(
      passengers.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(lower)) ||
          (p.phoneNumber && p.phoneNumber.toLowerCase().includes(lower)) ||
          (p.email && p.email.toLowerCase().includes(lower))
      )
    );
  }, [searchQuery, passengers]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header title="Passengers" subtitle="Access restricted" />
        <div className="p-8 text-center text-gray-600">Only admins can view this page.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Passengers" subtitle="Registered passengers (API)" />

      <div className="p-6 flex-1">
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPassengers.map((p) => (
              <div
                key={p.passengerId}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-start gap-4">
                  {p.profilePictureUrl ? (
                    <img
                      src={p.profilePictureUrl}
                      alt={p.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="text-purple-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{p.name}</h3>
                    <p className="text-sm text-gray-500">{p.phoneNumber}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                  </div>
                  <Shield size={18} className="text-gray-300 shrink-0" />
                </div>
                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  {p.ageYears != null && <p>Age: {p.ageYears} years</p>}
                  {p.paymentMethod && <p>Payment: {p.paymentMethod}</p>}
                  {p.emergencyContactName && (
                    <p>
                      Emergency: {p.emergencyContactName}
                      {p.emergencyContactPhone ? ` (${p.emergencyContactPhone})` : ''}
                    </p>
                  )}
                  {p.totalTrips != null && <p>Total trips: {p.totalTrips}</p>}
                  {p.rating != null && <p>Rating: {p.rating}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Passengers;
