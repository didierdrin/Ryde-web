import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import Header from '../components/Header';
import { CheckCircle, Clock, Truck, FileText, User } from 'lucide-react';

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));

            const driversData = await Promise.all(vehiclesSnapshot.docs.map(async (vehicleDoc) => {
                const vehicleData = vehicleDoc.data();
                let userData = { fullName: 'Unknown', phoneNumber: 'N/A' };

                if (vehicleData.userId) {
                    // Assuming userId is the document ID for users is simpler, but usually userId is a field in users too?
                    // The schema for vehicle says userId: "mailto:didiercode20@gmail.com".
                    // The schema for user says mamboPhoneNumber: "mailto:didier...", phoneNumber: "mailto...".
                    // Let's assume the Users collection uses the same ID or we query by email/id field.
                    // If userId is the doc ID in 'users', simple. If not, we query. 
                    // Let's try to getDoc from 'users' using vehicleData.userId first (common pattern).
                    // If that fails or is empty, we might need to query.

                    // Looking at schema: users collection: country_code, fullName...
                    // I will attempt to fetch user by ID if userId matches docId.
                    // Given the IDs look like emails or strings, it's possible.

                    try {
                        // Strategy: Try to get User assuming userId is the key.
                        // But 'users' collection doc IDs usually are UIDs. 
                        // The schema shows userId as an email string for the vehicle.
                        // I will perform a query for the user.
                        // I will perform a query for the user.
                        // Or maybe 'email'? The schema shows phoneNumber as "mailto:..." which is weird. 
                        // Let's assume userId in vehicle matches ONE of the fields in User.
                        // Wait, in `users` schema: phoneNumber: "mailto:didiercode20@gmail.com".
                        // So I will query users where phoneNumber == vehicleData.userId.

                        const userQuery = query(collection(db, 'users'), where('phoneNumber', '==', vehicleData.userId));
                        const userSnapshot = await getDocs(userQuery);

                        if (!userSnapshot.empty) {
                            userData = userSnapshot.docs[0].data();
                        }
                    } catch (e) {
                        console.log("Error fetching user details", e);
                    }
                }

                return {
                    id: vehicleDoc.id,
                    ...vehicleData,
                    driverDetails: userData
                };
            }));

            setDrivers(driversData);
        } catch (error) {
            console.error("Error fetching drivers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const toggleApproval = async (driverId, currentStatus) => {
        try {
            const driverRef = doc(db, 'vehicles', driverId);
            await updateDoc(driverRef, {
                approved: !currentStatus
            });
            // Optimistic update
            setDrivers(prev => prev.map(d =>
                d.id === driverId ? { ...d, approved: !currentStatus } : d
            ));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Drivers Management" subtitle="Approve and Manage Drivers" />

            <div className="p-6 flex-1">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {drivers.map(driver => (
                            <div key={driver.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                {driver.driverDetails.profilePicture ? (
                                                    <img src={driver.driverDetails.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <User size={24} className="text-gray-500" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{driver.driverDetails.fullName || driver.userId}</h3>
                                                <p className="text-xs text-gray-500">{driver.driverDetails.phoneNumber}</p>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${driver.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {driver.approved ? <CheckCircle size={12} /> : <Clock size={12} />}
                                            {driver.approved ? 'Approved' : 'Pending'}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                            <Truck size={16} className="text-blue-500" />
                                            <span className="font-medium">{driver.vehicleMake}</span>
                                            <span className="text-gray-400">•</span>
                                            <span>{driver.vehicleRegNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 px-2">
                                            <FileText size={16} className="text-gray-400" />
                                            <span>TIN: {driver.tin}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 px-2">
                                            <span className={`w-2 h-2 rounded-full ${driver.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                            <span>{driver.active ? 'Currently Active' : 'Offline'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => toggleApproval(driver.id, driver.approved)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${driver.approved
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}
                                        >
                                            {driver.approved ? 'Reject / Revoke' : 'Approve Driver'}
                                        </button>
                                        <button className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {drivers.length === 0 && (
                            <div className="col-span-full text-center py-10 text-gray-500">
                                No drivers found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Drivers;
