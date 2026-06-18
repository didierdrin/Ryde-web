/** Normalize trip fields from API (snake_case or camelCase). */
export function tripField(trip, camelKey) {
  if (!trip) return undefined;
  const snake = camelKey.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
  return trip[camelKey] ?? trip[snake];
}

export function tripIdOf(trip) {
  return tripField(trip, 'tripId') ?? '';
}

export function isTrackableStatus(status) {
  const s = (status || '').toUpperCase();
  return s === 'REQUESTED' || s === 'ACCEPTED' || s === 'IN_PROGRESS';
}

export function normalizeTrip(trip) {
  if (!trip) return trip;
  return {
    ...trip,
    tripId: tripField(trip, 'tripId'),
    pickupAddress: tripField(trip, 'pickupAddress'),
    destinationAddress: tripField(trip, 'destinationAddress'),
    pickupLatitude: tripField(trip, 'pickupLatitude'),
    pickupLongitude: tripField(trip, 'pickupLongitude'),
    destinationLatitude: tripField(trip, 'destinationLatitude'),
    destinationLongitude: tripField(trip, 'destinationLongitude'),
    status: tripField(trip, 'status'),
    fare: tripField(trip, 'fare'),
    distance: tripField(trip, 'distance'),
    requestTime: tripField(trip, 'requestTime'),
  };
}
