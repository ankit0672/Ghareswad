import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || '/api';
if (baseURL !== '/api' && !baseURL.endsWith('/api')) {
    // If the user provided a domain without /api (like https://backend.com), append /api 
    baseURL = baseURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
    baseURL,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('ghorerswad_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

export const dishAPI = {
    getAll: (params) => api.get('/dishes', { params }),
    getMy: () => api.get('/dishes/my'),
    upload: (formData) =>
        api.post('/dishes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    toggle: (id) => api.patch(`/dishes/${id}/toggle`),
    delete: (id) => api.delete(`/dishes/${id}`),
    updatePhoto: (id, formData) =>
        api.patch(`/dishes/${id}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    rate: (id, data) => api.post(`/dishes/${id}/rate`, data),
};

export const orderAPI = {
    place: (data) => api.post('/orders', data),
    getMy: () => api.get('/orders/my'),
    getChef: () => api.get('/orders/chef'),
    getStats: () => api.get('/orders/chef/stats'),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    cancel: (id, reason) => api.patch(`/orders/${id}/cancel`, { reason }),
};

export default api;
