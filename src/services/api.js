// Explicit REACT_APP_API_URL wins (e.g. production Railway while running CRA locally).
// Otherwise use relative `/api` so setupProxy.js can forward to a local backend.
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
if (process.env.NODE_ENV === 'development') {
  console.log('[Ryde API]', API_BASE_URL);
}

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const text = await response.text();

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_) {
        if (text.trimStart().startsWith('<')) {
          throw new Error(
            'Server returned a web page instead of JSON. Check that REACT_APP_API_URL points to your API (e.g. https://your-backend.up.railway.app/api), not to the frontend URL.'
          );
        }
        if (response.status === 413) {
          throw new Error('The export file is too large to email. Try Download PDF or a smaller report.');
        }
        throw new Error('Invalid response from server. Please try again.');
      }

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error(
            data.error || 'The export file is too large to email. Try Download PDF or export a smaller page (e.g. Passengers instead of Dashboard).'
          );
        }
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(
          'Could not reach the server. The export may be too large, or the backend may be restarting. Try Download PDF, or retry in a moment.'
        );
      }
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async getAdminReferralCode() {
    return this.request('/auth/admin-referral-code');
  }

  logout() {
    this.setToken(null);
  }

  // Trips endpoints
  async getTrips(status = null) {
    const url = status ? `/trips/my-trips?status=${status}` : '/trips/my-trips';
    return this.request(url);
  }

  async getTripById(tripId) {
    return this.request(`/trips/${tripId}`);
  }

  async getTripLocations(tripId) {
    return this.request(`/trips/${tripId}/locations`);
  }

  async getAvailableTrips(latitude, longitude) {
    return this.request(`/trips/available?latitude=${latitude}&longitude=${longitude}`);
  }

  async requestTrip(tripData) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async acceptTrip(tripId) {
    return this.request(`/trips/${tripId}/accept`, {
      method: 'POST',
    });
  }

  async startTrip(tripId) {
    return this.request(`/trips/${tripId}/start`, {
      method: 'POST',
    });
  }

  async completeTrip(tripId, duration) {
    return this.request(`/trips/${tripId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ duration }),
    });
  }

  async cancelTrip(tripId) {
    return this.request(`/trips/${tripId}/cancel`, {
      method: 'POST',
    });
  }

  // Drivers endpoints
  async getDrivers() {
    // Note: This would need to be implemented in the backend
    return this.request('/drivers');
  }

  async getDriverProfile() {
    return this.request('/drivers/profile');
  }

  async updateDriverLocation(latitude, longitude) {
    return this.request('/drivers/location', {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude }),
    });
  }

  async toggleDriverAvailability(isAvailable) {
    return this.request('/drivers/availability', {
      method: 'PUT',
      body: JSON.stringify({ isAvailable }),
    });
  }

  async registerVehicle(vehicleData) {
    return this.request('/drivers/vehicle', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  // Passengers endpoints
  async getPassengers() {
    // Note: This would need to be implemented in the backend
    return this.request('/passengers');
  }

  async getPassengerProfile() {
    return this.request('/passengers/profile');
  }

  async updatePassengerLocation(latitude, longitude) {
    return this.request('/passengers/location', {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude }),
    });
  }

  // Payments endpoints
  async getPaymentByTrip(tripId) {
    return this.request(`/payments/trip/${tripId}`);
  }

  async createPaymentInvoice(paymentId) {
    return this.request(`/payments/${paymentId}/create-invoice`, {
      method: 'POST',
    });
  }

  async createInvoiceForAmount(amountOrOptions, address, vehicleRef) {
    const body =
      amountOrOptions != null && typeof amountOrOptions === 'object'
        ? amountOrOptions
        : {
            amount: Number(amountOrOptions),
            address: address || undefined,
            vehicleRef: vehicleRef || undefined,
          };
    return this.request('/payments/create-invoice-for-amount', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async acknowledgeRentalPayment(intentId) {
    return this.request(`/payments/rental-intent/${encodeURIComponent(intentId)}/acknowledge`, {
      method: 'POST',
    });
  }

  async cancelRentalPayment(intentId) {
    return this.request(`/payments/rental-intent/${encodeURIComponent(intentId)}/cancel`, {
      method: 'POST',
    });
  }

  async getRentalIntent(intentId) {
    return this.request(`/payments/rental-intent/${encodeURIComponent(intentId)}`);
  }

  async completePayment(paymentId, transactionRef) {
    return this.request(`/payments/${paymentId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ transactionRef }),
    });
  }

  // Notifications endpoints
  async getNotifications(isRead = null) {
    const url = isRead !== null ? `/notifications?isRead=${isRead}` : '/notifications';
    return this.request(url);
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Ratings endpoints
  async createRating(ratingData) {
    return this.request('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  }

  async getRatingsByTrip(tripId) {
    return this.request(`/ratings/trip/${tripId}`);
  }

  async getRatingsByUser(userId) {
    return this.request(`/ratings/user/${userId}`);
  }

  // Rentals
  async getRentalVehicles() {
    return this.request('/rentals');
  }

  async createRentalVehicle(vehicleData) {
    return this.request('/rentals', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async updateRentalVehicle(rentalId, vehicleData) {
    return this.request(`/rentals/${encodeURIComponent(rentalId)}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  // Auctions
  async getAuctionListings(type = null, all = false) {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (all) params.set('all', 'true');
    const qs = params.toString();
    const url = qs ? `/auctions?${qs}` : '/auctions';
    return this.request(url);
  }

  async createAuctionListing(listingData) {
    return this.request('/auctions', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  async updateAuctionListing(listingId, listingData) {
    return this.request(`/auctions/${encodeURIComponent(listingId)}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  }

  async purchaseAuctionListing(listingId) {
    return this.request(`/auctions/${listingId}/purchase`, { method: 'POST' });
  }

  // Mechanics
  async getMechanics(latitude, longitude, radius = 15) {
    let url = '/mechanics';
    if (latitude != null && longitude != null) {
      url += `?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
    }
    return this.request(url);
  }

  // Nearby drivers (passenger)
  async getNearbyDrivers(latitude, longitude, radius = 10) {
    return this.request(
      `/drivers/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
  }

  // Admin
  async getAdminDrivers() {
    return this.request('/admin/drivers');
  }

  async getAdminPassengers() {
    return this.request('/admin/passengers');
  }

  async updateDriverVerification(driverId, status) {
    return this.request(`/admin/drivers/${driverId}/verification`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateAdminDriver(driverId, data) {
    return this.request(`/admin/drivers/${encodeURIComponent(driverId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateAdminPassenger(passengerId, data) {
    return this.request(`/admin/passengers/${encodeURIComponent(passengerId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateAdminTrip(tripId, data) {
    return this.request(`/admin/trips/${encodeURIComponent(tripId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminTrips({ active = false, status = null } = {}) {
    const params = new URLSearchParams();
    if (active) params.set('active', 'true');
    else if (status) params.set('status', status);
    const qs = params.toString();
    return this.request(`/admin/trips${qs ? `?${qs}` : ''}`);
  }

  async createAdminTrip(tripData) {
    return this.request('/admin/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async getAdminSubscriptions() {
    return this.request('/admin/subscriptions');
  }

  async createAdminSubscription(data) {
    return this.request('/admin/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelAdminSubscription(subscriptionId) {
    return this.request(`/admin/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      method: 'DELETE',
    });
  }

  async sendExportEmail({ email, filename, reportTitle, pdfBase64 }) {
    return this.request('/export/email', {
      method: 'POST',
      body: JSON.stringify({ email, filename, reportTitle, pdfBase64 }),
    });
  }
}

const apiService = new ApiService();
export default apiService;
