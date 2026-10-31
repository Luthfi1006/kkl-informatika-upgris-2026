/**
 * API Client for Supabase Backend
 * Replaces local JSON with Supabase API calls
 */

const API_BASE = '/api';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('admin_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }

  // Public endpoints (no auth required)
  async getProfiles() {
    return this.request('/profiles');
  }

  async getDestinations() {
    return this.request('/destinations');
  }

  async getGallery() {
    return this.request('/gallery');
  }

  async getVideos() {
    return this.request('/videos');
  }

  async getFeedback() {
    return this.request('/feedback');
  }

  async getSettings() {
    return this.request('/settings');
  }

  // Feedback submission (public)
  async submitFeedback(feedback) {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback)
    });
  }

  // Admin endpoints (require auth)
  async login(email, password) {
    const data = await this.request('/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.success && data.data.session) {
      this.setToken(data.data.session.access_token);
    }
    return data;
  }

  async logout() {
    await this.request('/auth', { method: 'DELETE' });
    this.setToken(null);
  }

  async checkAuth() {
    try {
      return await this.request('/auth');
    } catch {
      this.setToken(null);
      return { success: false };
    }
  }

  // Admin CRUD
  async createProfile(data) {
    return this.request('/profiles', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProfile(id, data) {
    return this.request(`/profiles?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProfile(id) {
    return this.request(`/profiles?id=${id}`, { method: 'DELETE' });
  }

  async createDestination(data) {
    return this.request('/destinations', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateDestination(id, data) {
    return this.request(`/destinations?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteDestination(id) {
    return this.request(`/destinations?id=${id}`, { method: 'DELETE' });
  }

  async createGallery(data) {
    return this.request('/gallery', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateGallery(id, data) {
    return this.request(`/gallery?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteGallery(id) {
    return this.request(`/gallery?id=${id}`, { method: 'DELETE' });
  }

  async createVideo(data) {
    return this.request('/videos', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateVideo(id, data) {
    return this.request(`/videos?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteVideo(id) {
    return this.request(`/videos?id=${id}`, { method: 'DELETE' });
  }

  async getAllFeedback() {
    return this.request('/feedback');
  }

  async approveFeedback(id) {
    return this.request(`/feedback?id=${id}`, { 
      method: 'PUT', 
      body: JSON.stringify({ approved: true }) 
    });
  }

  async deleteFeedback(id) {
    return this.request(`/feedback?id=${id}`, { method: 'DELETE' });
  }

  async updateSettings(settings) {
    return this.request('/settings', { method: 'POST', body: JSON.stringify(settings) });
  }

  async uploadImage(file, bucket = 'gallery') {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
    
    return response.json();
  }
}

export const api = new APIClient();
export default api;
