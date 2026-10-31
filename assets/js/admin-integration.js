/**
 * Admin API Integration
 * Connects admin.html with admin-api.php (MySQL database)
 */

class AdminAPI {
    constructor() {
        this.apiBase = '/admin-api.php';
        this.csrfToken = this.getCsrfToken();
    }
    
    getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : '';
    }
    
    async request(action, method = 'GET', data = {}) {
        try {
            const params = new URLSearchParams();
            params.append('action', action);
            params.append('csrf_token', this.csrfToken);
            
            const options = {
                method: method,
                headers: {
                    'X-CSRF-TOKEN': this.csrfToken,
                }
            };
            
            let url = `${this.apiBase}?action=${action}`;
            
            if (method === 'POST' || method === 'PUT') {
                if (data instanceof FormData) {
                    data.append('action', action);
                    data.append('csrf_token', this.csrfToken);
                    options.body = data;
                } else {
                    options.body = JSON.stringify({...data, action, csrf_token: this.csrfToken});
                    options.headers['Content-Type'] = 'application/json';
                }
            }
            
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'API Error');
            }
            
            return result;
        } catch (error) {
            console.error(`API Error [${action}]:`, error);
            throw error;
        }
    }
    
    // PROFILES
    async getProfiles() {
        return this.request('profiles_list');
    }
    
    async saveProfile(data) {
        const formData = new FormData();
        formData.append('id', data.id || 0);
        formData.append('name', data.name);
        formData.append('role', data.role);
        formData.append('bio', data.bio);
        formData.append('sort_order', data.sort_order || 0);
        
        if (data.photoFile) {
            formData.append('photo', data.photoFile);
        }
        
        return this.request('profile_save', 'POST', formData);
    }
    
    async deleteProfile(id) {
        const fd = new FormData();
        fd.append('id', id);
        return this.request('profile_delete', 'POST', fd);
    }
    
    // FEEDBACK
    async getFeedback() {
        return this.request('feedback_list');
    }
    
    async approveFeedback(id) {
        const fd = new FormData();
        fd.append('id', id);
        return this.request('feedback_approve', 'POST', fd);
    }
    
    async deleteFeedback(id) {
        const fd = new FormData();
        fd.append('id', id);
        return this.request('feedback_delete', 'POST', fd);
    }
    
    // DESTINATIONS
    async getDestinations() {
        return this.request('destinations_list');
    }
    
    async saveDestination(data) {
        const fd = new FormData();
        fd.append('id', data.id || 0);
        fd.append('name', data.name);
        fd.append('day_no', data.day_no || 1);
        fd.append('description', data.description || '');
        fd.append('route', data.route || '');
        fd.append('sort_order', data.sort_order || 0);
        return this.request('destination_save', 'POST', fd);
    }
    
    async deleteDestination(id) {
        const fd = new FormData();
        fd.append('id', id);
        return this.request('destination_delete', 'POST', fd);
    }
    
    // GALLERY
    async getGallery() {
        return this.request('gallery_list');
    }
    
    async saveGallery(data) {
        const fd = new FormData();
        fd.append('id', data.id || 0);
        fd.append('title', data.title);
        fd.append('location', data.location || '');
        fd.append('destination_id', data.destination_id || 0);
        
        if (data.photoFile) {
            fd.append('photo', data.photoFile);
        }
        
        return this.request('gallery_save', 'POST', fd);
    }
    
    async deleteGallery(id) {
        const fd = new FormData();
        fd.append('id', id);
        return this.request('gallery_delete', 'POST', fd);
    }
    
    // VIDEOS
    async getVideos() {
        return this.request('videos_list');
    }
    
    async saveVideo(data) {
        const fd = new FormData();
        fd.append('id', data.id || 0);
        fd.append('title', data.title);
        fd.append('embed_url', data.embed_url);
        return this.request('video_save', 'POST', fd);
    }
    
    async deleteVideo(id) {
        const fd = new FormData();
        fd.append('id', id);
        return this.request('video_delete', 'POST', fd);
    }
}

// Initialize
const adminAPI = new AdminAPI();

// Helper: Show notification
function showNotification(message, type = 'success') {
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    div.textContent = message;
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 3000);
}

// Override save functions to use API
window.saveProfile = async function(id) {
    try {
        const form = document.querySelector(`#profileForm_${id}`);
        if (!form) return;
        
        const data = {
            id: id,
            name: form.querySelector('[name="name"]').value,
            role: form.querySelector('[name="role"]').value,
            bio: form.querySelector('[name="bio"]').value,
            sort_order: form.querySelector('[name="sort_order"]').value,
            photoFile: form.querySelector('[name="photo"]').files[0]
        };
        
        const result = await adminAPI.saveProfile(data);
        if (result.success) {
            showNotification('Profil tersimpan ke database! ✓');
            await loadProfiles();
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
};

window.deleteProfile = async function(id) {
    if (!confirm('Hapus profil ini?')) return;
    try {
        const result = await adminAPI.deleteProfile(id);
        if (result.success) {
            showNotification('Profil dihapus! ✓');
            await loadProfiles();
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
};

window.approveFeedback = async function(id) {
    try {
        const result = await adminAPI.approveFeedback(id);
        if (result.success) {
            showNotification('Feedback disetujui & akan muncul di website! ✓');
            await loadFeedback();
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
};

window.deleteFeedback = async function(id) {
    if (!confirm('Hapus feedback ini?')) return;
    try {
        const result = await adminAPI.deleteFeedback(id);
        if (result.success) {
            showNotification('Feedback dihapus! ✓');
            await loadFeedback();
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
};

// Load data from database
async function loadProfiles() {
    try {
        const result = await adminAPI.getProfiles();
        if (result.success) {
            renderProfiles(result.data);
        }
    } catch (error) {
        console.error('Failed to load profiles:', error);
    }
}

async function loadFeedback() {
    try {
        const result = await adminAPI.getFeedback();
        if (result.success) {
            renderFeedback(result.data);
        }
    } catch (error) {
        console.error('Failed to load feedback:', error);
    }
}

async function loadDestinations() {
    try {
        const result = await adminAPI.getDestinations();
        if (result.success) {
            renderDestinations(result.data);
        }
    } catch (error) {
        console.error('Failed to load destinations:', error);
    }
}

async function loadGallery() {
    try {
        const result = await adminAPI.getGallery();
        if (result.success) {
            renderGallery(result.data);
        }
    } catch (error) {
        console.error('Failed to load gallery:', error);
    }
}

async function loadVideos() {
    try {
        const result = await adminAPI.getVideos();
        if (result.success) {
            renderVideos(result.data);
        }
    } catch (error) {
        console.error('Failed to load videos:', error);
    }
}

// Load on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProfiles();
    loadFeedback();
    loadDestinations();
    loadGallery();
    loadVideos();
});

// Auto-refresh every 10 seconds
setInterval(() => {
    loadProfiles();
    loadFeedback();
    loadDestinations();
    loadGallery();
    loadVideos();
}, 10000);
