const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

/**
 * Get driving distance in km via Google Directions API.
 * @returns {Promise<number|null>} Distance in km or null if key missing or request fails.
 */
export async function getRouteDistanceKm(originLat, originLng, destLat, destLng) {
  if (!GOOGLE_MAPS_API_KEY) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'OK' || !data.routes?.length) return null;
    const legs = data.routes[0].legs;
    if (!legs?.length) return null;
    const value = legs[0].distance?.value;
    if (value == null) return null;
    return value / 1000;
  } catch (_) {
    return null;
  }
}

/**
 * Geocode an address to lat/lng using Google Geocoding API.
 * @returns {Promise<{ lat: number, lng: number, formattedAddress: string }|null>}
 */
export async function geocodeAddress(address) {
  if (!GOOGLE_MAPS_API_KEY || !address?.trim()) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address.trim())}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'OK' || !data.results?.length) return null;
    const r = data.results[0];
    const loc = r.geometry?.location;
    if (!loc) return null;
    return {
      lat: loc.lat,
      lng: loc.lng,
      formattedAddress: r.formatted_address || address.trim(),
    };
  } catch (_) {
    return null;
  }
}

/**
 * Fare estimate (match mobile: 1500 base for first km, 900/km up to 30km, 700/km after).
 */
export function estimateFare(km) {
  if (km <= 1) return 1500;
  if (km <= 30) return 1500 + Math.round((km - 1) * 900);
  return 1500 + 29 * 900 + Math.round((km - 30) * 700);
}
