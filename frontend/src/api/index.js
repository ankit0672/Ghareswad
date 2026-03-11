import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('ghareswad_token');
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
};

export const orderAPI = {
    place: (data) => api.post('/orders', data),
    getMy: () => api.get('/orders/my'),
    getChef: () => api.get('/orders/chef'),
    getStats: () => api.get('/orders/chef/stats'),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export default api;
