import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Header from '../components/Header';
import { CheckCircle, Clock, Truck, User, FileText } from 'lucide-react';

const Drivers = () => {
  const { isAdmin } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const toggleVerification = async (driverId, currentStatus) => {
    const next = currentStatus === 'APPROVED' ? 'PENDING' : 'APPROVED';
    try {
      await apiService.updateDriverVerification(driverId, next);
      setDrivers((prev) =>
        prev.map((d) =>
          d.driverId === driverId ? { ...d, verificationStatus: next } : d
        )
      );
    } catch (error) {
      console.error('Error updating driver:', error);
      alert('Failed to update driver status');
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Drivers Management" subtitle="Approve and manage drivers (API)" />

      <div className="p-6 flex-1">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((driver) => {
              const approved = driver.verificationStatus === 'APPROVED';
              const vehicle = driver.vehicle;
              return (
                <div
                  key={driver.driverId}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {driver.profilePictureUrl ? (
                        <img
                          src={driver.profilePictureUrl}
                          alt={driver.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{driver.name}</h3>
                        <p className="text-sm text-gray-500">{driver.phoneNumber}</p>
                        <p className="text-xs text-gray-400 mt-1">{driver.email}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      {driver.ageYears != null && <p>Age: {driver.ageYears} years</p>}
                      {driver.yearsExperience != null && (
                        <p>Experience: {driver.yearsExperience} years</p>
                      )}
                      {driver.licenseNumber && <p>License: {driver.licenseNumber}</p>}
                      {driver.address && <p>Address: {driver.address}</p>}
                      {driver.bio && <p className="italic">{driver.bio}</p>}
                    </div>

                    {vehicle && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg flex gap-3 items-center">
                        {vehicle.imageUrl ? (
                          <img
                            src={vehicle.imageUrl}
                            alt="Vehicle"
                            className="w-16 h-12 rounded object-cover"
                          />
                        ) : (
                          <Truck className="text-gray-400" size={32} />
                        )}
                        <div className="text-sm">
                          <p className="font-medium">
                            {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-gray-500">{vehicle.registrationNumber}</p>
                        </div>
                      </div>
                    )}

                    {driver.licenseDocumentUrl && (
                      <a
                        href={driver.licenseDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <FileText size={16} />
                        View license document
                      </a>
                    )}
                  </div>

                  <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        approved
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {driver.verificationStatus || 'PENDING'}
                    </span>
                    <button
                      onClick={() =>
                        toggleVerification(driver.driverId, driver.verificationStatus)
                      }
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                        approved
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {approved ? (
                        <>
                          <Clock size={14} /> Revoke
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} /> Approve
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drivers;
