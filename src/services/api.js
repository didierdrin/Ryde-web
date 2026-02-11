const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
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
}

export default new ApiService();
